import {defs, tiny} from './common.js';
// Pull these names into this module's scope for convenience:
const {Vector, vec3, vec4, vec, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene, hex_color} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

import {Shape_From_File} from './obj-file-demo.js'
import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
    Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './shadow-demo-shaders.js'

// 2D shape, to display the texture buffer
const Square =
    class Square extends tiny.Vertex_Buffer {
        constructor() {
            super("position", "normal", "texture_coord");
            this.arrays.position = [
                vec3(0, 0, 0), vec3(1, 0, 0), vec3(0, 1, 0),
                vec3(1, 1, 0), vec3(1, 0, 0), vec3(0, 1, 0)
            ];
            this.arrays.normal = [
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
                vec3(0, 0, 1), vec3(0, 0, 1), vec3(0, 0, 1),
            ];
            this.arrays.texture_coord = [
                vec(0, 0), vec(1, 0), vec(0, 1),
                vec(1, 1), vec(1, 0), vec(0, 1)
            ]
        }
    }

// The scene
export class Shadow_Demo extends Scene {
    constructor() {
        super();
        // Load the model file:
        this.shapes = {
            cube: new Cube(),
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere4: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),

            sphere0: new defs.Subdivision_Sphere(0),
            sphere1: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),

            sphere2: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
            sphere3: new defs.Subdivision_Sphere(3),
            leafTest: new defs.Tetrahedron(true),
            cylinder: new defs.Capped_Cylinder( 4, 12, [[0,1],[0,1]] ),
            cone: new defs.Closed_Cone( 4, 20, [[0,1],[0,1]] ),
            skybox: new defs.Subdivision_Sphere(4),
            ground: new defs.Capped_Cylinder(100,100,[[0,2],[0,1]]),
            pine_cones: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(2),
        };

        // For the teapot
        this.stars = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.5, .5, .5, 1),
            ambient: .4, diffusivity: .5, specularity: .5,
            color_texture: new Texture("assets/stars.png"),
            light_depth_texture: null

        });
        // For the floor or other plain objects
        /*this.floor = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: hex_color("#C19A6B"), ambient: .7, diffusivity: 1,
        })*/
        // For the first pass
        this.pure = new Material(new Color_Phong_Shader(), {
        })
        // For light source
        /*this.light_src = new Material(new Phong_Shader(), {
            color: color(1, 1, 1, 1), ambient: 1, diffusivity: 0, specularity: 0
        });
        // For depth texture display
        this.depth_tex =  new Material(new Depth_Texture_Shader_2D(), {
            color: color(0, 0, .0, 1),
            ambient: 1, diffusivity: 0, specularity: 0, texture: null
        });*/

        const textured = new defs.Textured_Phong(1);
        this.materials = {
            land: new Material(new Shadow_Textured_Phong_Shader(1),
                {ambient: .4, diffusivity: 1, color: hex_color("#6F4E37")}),
            sun: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, color: hex_color("#fac91a")}),
            moon: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 1, color: hex_color("#ffffff")}),
            sky: new Material(textured,
                {ambient:1, specularity: 0.2, texture: new Texture("./assets/sunsetBackgroundSquare.png")}),
            spring_sky: new Material(textured,
                {ambient:1, specularity: 0.2, texture: new Texture("./assets/sunsetBackgroundSquare.png"), color: color(0,0,0,1)}),
            summer_sky: new Material(textured,
                {ambient:1, specularity: 0.2, texture: new Texture("./assets/summerSky.png"), color: color(0,0,0,1)}),
            fall_sky: new Material(textured,
                {ambient:1, specularity: 0.2, texture: new Texture("./assets/fallSky.png"), color: color(0,0,0,1)}),
            winter_sky: new Material(textured,
                {ambient:1, specularity: 0.2, texture: new Texture("./assets/winterSky.png"), color: color(0,0,0,1)}),
            apocalypse: new Material(textured,
                {ambient:1, specularity: 0.2, texture: new Texture("./assets/apocalypse.png"), color: color(0,0,0,1)}),
            night_sky: new Material(textured,
                {ambient:1, specularity: 0.2, texture: new Texture("./assets/nightsky.png"), color: color(0,0,0,1)}),
            land2: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 1,
                texture: new Texture("assets/grass.png", "LINEAR_MIPMAP_LINEAR")
            }),
        }

        this.water = new Material(new Texture_Scroll_X(), {
            color: hex_color("#ffffff"),
            ambient: 1,  diffusivity: .0, specularity: .0,
            texture: new Texture("assets/water.png", "LINEAR_MIPMAP_LINEAR")
        })

        this.land = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.168, .274, .2, 1),
            ambient:0.3,
            color_texture: new Texture("assets/grass.png"),
            light_depth_texture: null
        })

        this.land2 = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.203, .152, .117, 1),
            ambient: .4, diffusivity: .5, specularity: .5,
            color_texture: new Texture("assets/land1.jpg"),
            light_depth_texture: null
        })

        this.treeleaf = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.125, .180, .168, 1),
            ambient: .4, diffusivity: .5, specularity: .2,
            color_texture: new Texture("assets/treeleaf.png", "LINEAR_MIPMAP_LINEAR"),
            light_depth_texture: null
        })

        this.trunk = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.403, .301, .211, 1),
            ambient: .4, diffusivity: .5, specularity: .5,
            color_texture: new Texture("assets/trunk.jpg", "LINEAR_MIPMAP_LINEAR"),
            light_depth_texture: null
        })

        this.pinecones = new Material(new Shadow_Textured_Phong_Shader(1), {
            color: color(.1, .145, .105, 1),
            ambient: .4, diffusivity: .5, specularity: .5,
            color_texture: new Texture("assets/pinecones.png", "LINEAR_MIPMAP_LINEAR"),
            light_depth_texture: null
        })

        // To make sure texture initialization only does once
        this.init_ok = false;
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 40), vec3(0, 0, 0), vec3(0, 1, 0));
        this.shapes.cone.arrays.texture_coord = this.shapes.cone.arrays.texture_coord.map(x => x.times(2));
        this.previousShadeSwitchTime = 0.0;
        this.shadeSwitch = false;
        this.night_time = false;
        this.previousX = 0;
        this.season = 0;
        this.move = false;
    }

    make_control_panel() {
        // // make_control_panel(): Sets up a panel of interactive HTML elements, including
        this.key_triggered_button("Reset Camera", ["Control", "0"], () => this.attached = () => this.initial_camera_location);
        this.new_line();
        this.key_triggered_button("Attach to tree", ["Control", "1"], () => this.attached = () => null);
        this.new_line();
        this.key_triggered_button("Spring", ["Control", "2"], () => {this.season = 0;});
        this.key_triggered_button("Summer", ["Control", "3"], () => {this.season = 1;});
        this.key_triggered_button("Fall", ["Control", "4"], () => {this.season = 2;});
        this.key_triggered_button("Winter", ["Control", "5"], () => {this.season = 3;});
        this.key_triggered_button("Apocalypse", ["Control", "6"], () => {this.season = 4;});
        this.key_triggered_button("Move Trees", ["m"], () => {
            this.move = !this.move;
        });
    }

    draw_tree(context, program_state, tx, ty, tz, treez, green_shade, shadow){
        let trunk_transform = Mat4.identity();
        trunk_transform = trunk_transform.times(Mat4.rotation(1.4, 1, 0, 0))
            .times(Mat4.translation(tx, ty, tz))
            .times(Mat4.scale(1, 1, 11))
        this.shapes.cylinder.draw(context, program_state, trunk_transform, shadow ? this.trunk : this.pure);

        let angle_of_rotation = 0;
        if(this.move){
            const t = this.t = program_state.animation_time / 1000;
            const max_rot = 0.0015 * Math.PI;
            angle_of_rotation = ((max_rot/2) + ((max_rot/2) * Math.sin(1.1 * Math.PI * t)));
        }

        let j = -1;
        for (let i = 0; i < 3; i++) {
            let cone_transform = Mat4.identity();
            cone_transform = cone_transform.times(Mat4.rotation(-1.8, 1, 0, 0))
                .times(Mat4.rotation(angle_of_rotation * j, 0, 0, 1))
                .times(Mat4.translation(tx, -1 * ty, treez + i * 2.25))
                .times(Mat4.scale(5 - i, 5 - i, 3))
            this.shapes.cone.draw(context, program_state, cone_transform, shadow ? this.treeleaf : this.pure);
            j = j*  -1;
        }
    }

    draw_pine_cones(context, program_state, p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z, p1angle1, p1angle2, p2angle1, p2angle2, p3angle1, p3angle2){
        let angle_of_rotation = 0;

        if(this.move){
            const t = this.t = program_state.animation_time / 1000;
            const max_rot = 0.05 * Math.PI;
            angle_of_rotation = ((max_rot/2) + ((max_rot/2) * Math.sin(1 * Math.PI * t)));
        }

        let pine_transform = Mat4.identity().times(Mat4.translation(p1x, p1y, p1z))
            .times(Mat4.rotation(p1angle1, 1, 0, 0))
            .times(Mat4.rotation(p1angle2, 1, 0, 0))
            .times(Mat4.rotation(angle_of_rotation, 0, 0, 1))
            .times(Mat4.scale(0.55, 0.7,0.45));
        this.shapes.pine_cones.draw(context, program_state, pine_transform, this.pinecones);

        pine_transform = Mat4.identity().times(Mat4.translation(p2x, p2y, p2z))
            .times(Mat4.rotation(p2angle1, 1, 0, 0))
            .times(Mat4.rotation(p2angle2, 1, 0, 0))
            .times(Mat4.rotation(angle_of_rotation * -1, 0, 0, 1))
            .times(Mat4.scale(0.55, 0.7,0.45));
        this.shapes.pine_cones.draw(context, program_state, pine_transform, this.pinecones);

        pine_transform = Mat4.identity().times(Mat4.translation(p3x, p3y, p3z))
            .times(Mat4.rotation(p3angle1, 0, 1, 0))
            .times(Mat4.rotation(p3angle2, 1, 0, 0))
            .times(Mat4.rotation(angle_of_rotation, 0, 0, 1))
            .times(Mat4.scale(0.55, 0.7,0.45));
        this.shapes.pine_cones.draw(context, program_state, pine_transform, this.pinecones);
    }

    texture_buffer_init(gl) {
        // Depth Texture
        this.lightDepthTexture = gl.createTexture();
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
        this.materials.sky.light_depth_texture = this.light_depth_texture
        this.materials.land.light_depth_texture = this.light_depth_texture

        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    render_scene(context, program_state, shadow_pass, draw_light_source=false, draw_shadow=false) {
        // shadow_pass: true if this is the second pass that draw the shadow.
        // draw_light_source: true if we want to draw the light source.
        // draw_shadow: true if we want to draw the shadow

        const t = program_state.animation_time/1000;

        let model_transform = Mat4.identity();

        program_state.draw_shadow = draw_shadow;

        let sun_transform;
        sun_transform = model_transform.times(Mat4.translation(34-(7*t)%68, 14, -7));
        if (draw_light_source && shadow_pass) {
            // this.shapes.sphere4.draw(context, program_state, sun_transform, this.materials.sun);
        }

        let sky_transform = model_transform.times(Mat4.scale(60, 60, 60));
        if (this.night_time == true) {
            // Sun Light Color is Yellow
            // this.shapes.sphere4.draw(context, program_state, sun_transform, this.materials.sun.override({color: yellow}));
            this.shapes.sphere4.draw(context, program_state, sun_transform, shadow_pass? this.materials.sun : this.pure);
            // Check Season for background
            if(this.season == 0) {
                this.shapes.skybox.draw(context, program_state, sky_transform, this.materials.spring_sky);
            } else if (this.season == 1) {
                this.shapes.skybox.draw(context, program_state, sky_transform, this.materials.summer_sky);
            } else if (this.season == 2) {
                this.shapes.skybox.draw(context, program_state, sky_transform, this.materials.fall_sky);
            } else if (this.season == 3) {
                this.shapes.skybox.draw(context, program_state, sky_transform, this.materials.winter_sky);
            } else if (this.season == 4) {
                this.shapes.skybox.draw(context, program_state, sky_transform, this.materials.apocalypse);
            }
        } else {
            // Moon Light Color is White
            // this.shapes.sphere4.draw(context, program_state, sun_transform, this.materials.sun.override({color: white}));
            const white = hex_color("#ffffff");
            this.shapes.sphere4.draw(context, program_state, sun_transform, shadow_pass? this.materials.moon : this.pure);
            this.shapes.skybox.draw(context, program_state, sky_transform, this.materials.night_sky);
        }
        //this.shapes.sphere4.draw(context, program_state, sun_transform, shadow_pass? this.materials.sun : this.pure);
        //this.shapes.skybox.draw(context, program_state, sky_transform, shadow_pass? this.materials.sky : this.pure);

        //River
        let water_transform = Mat4.identity();
        water_transform = water_transform.times(Mat4.translation(0, -16, -10))
            .times(Mat4.rotation(-0.2, 1, 0, 0))
            .times(Mat4.rotation(3.14, 0, 1, 0))
            .times(Mat4.scale(50, 4, 20))
        this.shapes.cube.draw(context, program_state, water_transform, shadow_pass? this.water.override({color: hex_color("#000000")}) : this.pure);

        //Land
        let land_transform = Mat4.identity();
        land_transform = land_transform.times(Mat4.translation(0, -23, -10))
                .times(Mat4.rotation(-0.2, 1, 0, 0))
                .times(Mat4.scale(200, 0.5, 20))
        this.shapes.cube.draw(context, program_state, land_transform, shadow_pass? this.materials.land : this.pure);

        for(let i = 0; i < 2; ++i) {
            let land_transform = Mat4.identity();
            land_transform = land_transform.times(Mat4.translation(-31 + (i * 62), -15, -10))
                .times(Mat4.rotation(-0.2, 1, 0, 0))
                .times(Mat4.scale(25, 5, 20))
            this.shapes.cube.draw(context, program_state, land_transform, this.land)

            let land_transform2 = Mat4.identity();
            land_transform2 = land_transform2.times(Mat4.translation(-31 + (i * 62), -16, -10))
                .times(Mat4.rotation(-0.2, 1, 0, 0))
                .times(Mat4.scale(25, 4, 20.5))
            this.shapes.cube.draw(context, program_state, land_transform2, this.land2);
        }


        //Trees on left side
        this.draw_tree(context, program_state, -20, 5, 5, -1.5, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, -8, -5, 5, 0.8, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, -25, -15, 5, 0.4, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, -35, 0, 5, -1, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, -17, -4, 5, -1.1, "#4F7942", shadow_pass);
        this.draw_tree(context, program_state, -30, -6, 5, 0.3, "#4F7942", shadow_pass);
        this.draw_tree(context, program_state, -15, -15, 5, 1.6, "#4F7942", shadow_pass);
        this.draw_tree(context, program_state, -7, -20, 5, 2.3, "#87a96b", shadow_pass);
        this.draw_tree(context, program_state, -30, -23, 5, 2.7, "#87a96b", shadow_pass);

        //Trees on Right side
        this.draw_tree(context, program_state, 20, 5, 5, -1.5, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, 8, -5, 5, 0.8, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, 25, -15, 5, 0.4, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, 35, 0, 5, -1, "#355E3B", shadow_pass);
        this.draw_tree(context, program_state, 17, -4, 5, -1.1, "#4F7942", shadow_pass);
        this.draw_tree(context, program_state, 30, -6, 5, 0.3, "#4F7942", shadow_pass);
        this.draw_tree(context, program_state, 15, -15, 5, 1.6, "#4F7942", shadow_pass);
        this.draw_tree(context, program_state, 7, -20, 5, 2.3, "#87a96b", shadow_pass);
        this.draw_tree(context, program_state,  30, -23, 5, 2.7, "#87a96b", shadow_pass);

        //Pine Cones
        this.draw_pine_cones(context, program_state, -20, -0.05, 9.2, -18, 1.5, 7.2, -20, 4,
            6.2, 2.3, 0, 2.3, 0, 2.3, -2.3)
        this.draw_pine_cones(context, program_state, 10, -1.1, -1.1, 6, 1.5, -3, 9, 3.5,
            -3.9, 2.3, 0, 2.3, -2.3, 0, 2.3)
        this.draw_pine_cones(context, program_state, 26, -1.5, -4.2, 31, 1, -3.5, 29.5, 3,
            -4.3, 2.3, -2, 2.3, 0, 2.3, -2.3)
        this.draw_pine_cones(context, program_state, -15, -1.8, -11, -13, 0.1, -13, -15, 2,
            -13.3, 2.3, 0, -2, -2.3, 0, 2.3)
        this.draw_pine_cones(context, program_state, 20, -0.05, 9.2, 18, 1.5, 7.2, 20, 3.5,
            6.2, 2.3, 0, 2.3, 0, 2.3, -2.3)
    }

    display(context, program_state) {
        const t = program_state.animation_time/1000;
        const yellow = hex_color("#fac91a");
        const white = hex_color("#ffffff");
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            /*program_state.set_camera(Mat4.look_at(
                vec3(0, 12, 12),
                vec3(0, 2, 0),
                vec3(0, 1, 0)
            )); // Locate the camera here*/
            program_state.set_camera(this.initial_camera_location);
        }

        // The position of the light
        /*this.light_position = Mat4.rotation(t / 1500, 0, 1, 0).times(vec4(3, 6, 0, 1));
        // The color of the light
        this.light_color = color(
            0.667 + Math.sin(t/500) / 3,
            0.667 + Math.sin(t/1500) / 3,
            0.667 + Math.sin(t/3500) / 3,
            1
        );*/
        this.light_position = vec4(34-(7*t)%68, 14, -7, 1);
        this.light_color = color(1, 1, 1, 1);
        if(this.previousX < 34-(7*t)%68) {
            this.night_time = !this.night_time;
        }
        this.previousX = 34-(7*t)%68;
        program_state.lights = [new Light(this.light_position, this.light_color, 100)];

        // This is a rough target of the light.
        // Although the light is point light, we need a target to set the POV of the light
        this.light_view_target = vec4(0, 0, 0, 1);
        this.light_field_of_view = 130 * Math.PI / 180; // 130 degree

        program_state.lights = [new Light(this.light_position, this.light_color, 1000)];

        // Step 1: set the perspective and camera to the POV of light
        const light_view_mat = Mat4.look_at(
            vec3(this.light_position[0], this.light_position[1], this.light_position[2]),
            vec3(this.light_view_target[0], this.light_view_target[1], this.light_view_target[2]),
            vec3(0, 1, 0), // assume the light to target will have a up dir of +y, maybe need to change according to your case
        );
        const light_proj_mat = Mat4.perspective(this.light_field_of_view, 1, 7, 60);
        // Bind the Depth Texture Buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Prepare uniforms
        program_state.light_view_mat = light_view_mat;
        program_state.light_proj_mat = light_proj_mat;
        program_state.light_tex_mat = light_proj_mat;
        program_state.view_mat = light_view_mat;
        program_state.projection_transform = light_proj_mat;
        this.render_scene(context, program_state, false,false, false);

        // Step 2: unbind, draw to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        program_state.view_mat = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.5, 5000);
        this.render_scene(context, program_state, true,true, true);

        if(this.attached) {
            if (this.attached() == this.initial_camera_location) {
                //let desired = this.initial_camera_location;
                //desired = desired.map((x, i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
                program_state.set_camera(Mat4.look_at(vec3(0, 10, 40), vec3(0, 0, 0), vec3(0, 1, 0)));
                //program_state.set_camera(this.initial_camera_location);
                this.attached = null;
            }
            else
            {
                let desired = Mat4.translation(8,0,15);
                desired = Mat4.inverse(desired);
                desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1));
                program_state.set_camera(desired);
            }
        }
    }

}

class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                float shift = mod(animation_time, 8.0) * 0.07;
                vec4 tex_color = texture2D( texture, f_tex_coord + vec2(0, shift));
                
     
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}
