/*
MIT License
Copyright (c) 2017 Pavel Dobryakov
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

const canvas = document.getElementsByTagName('canvas')[0];
resizeCanvas();

Array.prototype.getRandom = function() {
    return this[Math.floor(Math.random() * this.length)];
};

let idleSplats;

function idleSplatsFunction() {
    multipleSplats(parseInt(Math.random() * config.RANDOM_AMOUNT) + (config.RANDOM_AMOUNT / 2) + 1);
}

let config = {
    // Default values
    SIM_RESOLUTION: 1024,
    DYE_RESOLUTION: 8192,
    DENSITY_DISSIPATION: 3.3,
    DENSITY_DISSIPATION_MULTIPLIER: 1,
    VELOCITY_DISSIPATION: 0.91,
    VELOCITY_DISSIPATION_MULTIPLIER: 1,
    PRESSURE: 1,
    PRESSURE_ITERATIONS: 20,
    CURL: 50,
    SPLAT_RADIUS: 0.3,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: true,
    COLOR_UPDATE_SPEED: 8,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: false,
    BLOOM: false,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 2,

    ZOOM_PERCENT: 100,
    ZOOM_X: 0,
    ZOOM_Y: 0,
    SPLAT_COLOR: [{ r: 0.15, g: 0.15, b: 0 }],
    SOUND_SENSITIVITY: 3.75,
    AUDIO_RESPONSIVE: true,
    FREQ_RANGE: 8,
    FREQ_RANGE_START: 0,
    IDLE_SPLATS: false,
    RANDOM_AMOUNT: 10,
    RANDOM_INTERVAL: 1,
    SOUND_SPLATS: true,
    SPLAT_STRENGTH: 70,
    SOUND_SPLAT_AMOUNT: 15,
    SPLAT_ON_CLICK: false,
    SHOW_MOUSE_MOVEMENT: false,
    POINTER_SIZE: 0.5,
    MOUSE_GRAVITY: false,
    NUM_STREAMS: 2,
    STREAM_SIZE: 0.7,
    STREAM_SPEED: 0.7,
    STREAM_STRENGTH: 225,
    MAX_STREAM_SPEED: 1.2,
    STREAM_SPEED_DECAY: 0.26,
    STREAM_GRAVITY: 200,
    STREAM_DIRECTION_VARIABILITY: .05,
    STREAM_BRIGHTNESS: 0.5,
    STREAM_COLORS: false,
    STREAM_COLOR: [{ r: 0.15, g: 0, b: 0 },{ r: 0, g: 0.15, b: 0 },{ r: 0, g: 0, b: 0.15 }],
    STREAM_COLOR_1: { r: 38, g: 0, b: 0 },
    STREAM_COLOR_2: { r: 0, g: 38, b: 0 },
    STREAM_COLOR_3: { r: 0, g: 0, b: 38 },
    STREAM_COLOR_4: { r: 0, g: 38, b: 38 },
    STREAM_COLOR_5: { r: 38, g: 38, b: 0 },
    COLOR_1: { r: 38, g: 0, b: 0 },
    COLOR_2: { r: 0, g: 38, b: 0 },
    COLOR_3: { r: 0, g: 0, b: 38 },
    COLOR_4: { r: 0, g: 38, b: 38 },
    COLOR_5: { r: 38, g: 38, b: 0 },
    STREAM_MASS: 1.5,
    STREAM_REPEL_FORCE: 0,
    BOUNCE_STRENGTH: 30,

    STARSPLAT_ANGLE: -1,
    STARSPLAT_POINTS: 3
};

document.addEventListener("DOMContentLoaded", () => {   
    window.wallpaperPropertyListener = {
        applyUserProperties: (properties) => {
            // This is called on load and when a property is changed in the UI.
            // Only the changed property is passed in.

            // general properties
            if (properties.use_background_image) config.TRANSPARENT = properties.use_background_image.value;
            if (properties.background_image) canvas.style.backgroundImage = `url("file:///${properties.background_image.value}")`;
            if (properties.repeat_background) canvas.style.backgroundRepeat = properties.repeat_background.value ? "repeat" : "no-repeat";
            if (properties.background_image_size) canvas.style.backgroundSize = properties.background_image_size.value;
            if (properties.frequency_range) {
                config.FREQ_RANGE = properties.frequency_range.value;

                if (config.FREQ_RANGE + config.FREQ_RANGE_START > 61) {
                    config.FREQ_RANGE_START = 62 - config.FREQ_RANGE;
                }
            }
            if (properties.frequency_range_start) {
                if (config.FREQ_RANGE + properties.frequency_range_start.value > 61) {
                    config.FREQ_RANGE_START = 62 - config.FREQ_RANGE;
                } else {
                    config.FREQ_RANGE_START = properties.frequency_range_start.value;
                }
            }
            if (properties.idle_random_splats) {
                config.IDLE_SPLATS = properties.idle_random_splats.value;
                if (properties.idle_random_splats.value) {
                    idleSplats = setInterval(idleSplatsFunction, config.RANDOM_INTERVAL * 1000);
                } else {
                    clearInterval(idleSplats);
                }
            }
            if (properties.random_splat_interval) {
                config.RANDOM_INTERVAL = properties.random_splat_interval.value;
                if (config.IDLE_SPLATS) {
                    clearInterval(idleSplats);
                    idleSplats = setInterval(idleSplatsFunction, config.RANDOM_INTERVAL * 1000);
                }
            }
            if (properties.random_splat_amount) {
                config.RANDOM_AMOUNT = properties.random_splat_amount.value;
                if (config.IDLE_SPLATS) {
                    clearInterval(idleSplats);
                    idleSplats = setInterval(idleSplatsFunction, config.RANDOM_INTERVAL * 1000);
                }
            }
            if (properties.splat_on_click) config.SPLAT_ON_CLICK = properties.splat_on_click.value;
            if (properties.show_mouse_movement) config.SHOW_MOUSE_MOVEMENT = properties.show_mouse_movement.value;
            if (properties.pointer_size) config.POINTER_SIZE = properties.pointer_size.value;
            if (properties.mouse_gravity) config.MOUSE_GRAVITY = properties.mouse_gravity.value;
            if (properties.sound_sensitivity) config.SOUND_SENSITIVITY = properties.sound_sensitivity.value;
            if (properties.audio_responsive) config.AUDIO_RESPONSIVE = properties.audio_responsive.value;
            if (properties.background_color) {
                let c = WPEColorToRGB(properties.background_color.value);
                document.body.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
                config.BACK_COLOR = Object.assign({}, c);
            }
            if (properties.zoom_percent) {
                config.ZOOM_PERCENT = properties.zoom_percent.value;
                config.ZOOM_X = canvas.width - canvas.width / (config.ZOOM_PERCENT / 100);
                config.ZOOM_Y = canvas.height - canvas.height / (config.ZOOM_PERCENT / 100);
            }

            // fluid properties
            if (properties.simulation_resolution) {
                config.SIM_RESOLUTION = properties.simulation_resolution.value;
                initFramebuffers();
            }
            if (properties.dye_resolution) {
                config.DYE_RESOLUTION = properties.dye_resolution.value;
                initFramebuffers();
            }
            if (properties.shading) {
                config.SHADING = properties.shading.value;
                updateKeywords();
            }
            if (properties.enable_bloom) {
                config.BLOOM = properties.enable_bloom.value;
                updateKeywords();
            }
            if (properties.bloom_intensity) config.BLOOM_INTENSITY = properties.bloom_intensity.value;
            if (properties.bloom_threshold) config.BLOOM_THRESHOLD = properties.bloom_threshold.value;
            if (properties.bloom_soft_knee) config.BLOOM_SOFT_KNEE = properties.bloom_soft_knee.value;
            if (properties.sunrays) {
                config.SUNRAYS = properties.sunrays.value;
                updateKeywords();
            }
            if (properties.sunrays_resolution) config.SUNRAYS_RESOLUTION = properties.sunrays_resolution.value;
            if (properties.sunrays_weight) config.SUNRAYS_WEIGHT = properties.sunrays_weight.value;            
            if (properties.density_diffusion_multiplier) {
                config.DENSITY_DISSIPATION /= config.DENSITY_DISSIPATION_MULTIPLIER;
                if (properties.density_diffusion_multiplier.value == 0) {
                    config.DENSITY_DISSIPATION_MULTIPLIER = 0.001;
                } else {
                    config.DENSITY_DISSIPATION_MULTIPLIER = properties.density_diffusion_multiplier.value;
                } 
                config.DENSITY_DISSIPATION *= config.DENSITY_DISSIPATION_MULTIPLIER;
            }
            if (properties.density_diffusion) {
                config.DENSITY_DISSIPATION = properties.density_diffusion.value * config.DENSITY_DISSIPATION_MULTIPLIER;
            }
            if (properties.velocity_diffusion_multiplier) {
                config.VELOCITY_DISSIPATION /= config.VELOCITY_DISSIPATION_MULTIPLIER;
                if (properties.velocity_diffusion_multiplier.value == 0) {
                    config.VELOCITY_DISSIPATION_MULTIPLIER = 0.001;
                } else {
                    config.VELOCITY_DISSIPATION_MULTIPLIER = properties.velocity_diffusion_multiplier.value;
                } 
                config.VELOCITY_DISSIPATION *= config.VELOCITY_DISSIPATION_MULTIPLIER;
            }
            if (properties.velocity_diffusion) {
                config.VELOCITY_DISSIPATION = properties.velocity_diffusion.value * config.VELOCITY_DISSIPATION_MULTIPLIER;
            }
            if (properties.pressure_diffusion) config.PRESSURE = properties.pressure_diffusion.value;
            if (properties.curl) config.CURL = properties.curl.value;

            if (properties.paused) config.PAUSED = properties.paused.value;
            // if (properties.splat_force) config.SPLAT_FORCE = properties.splat_force.value;
            
            // splat properties
            if (properties.colorful) config.COLORFUL = properties.colorful.value;
            if (properties.splat_radius) config.SPLAT_RADIUS = properties.splat_radius.value;
            if (properties.color_update_speed) config.COLOR_UPDATE_SPEED = properties.color_update_speed.value;
            if (properties.splat_color) {
                config.COLOR_1 = WPEColorToRGB(properties.splat_color.value);
                updateColors(1);
            }
            if (properties.splat_color_2) {
                config.COLOR_2 = WPEColorToRGB(properties.splat_color_2.value);
                updateColors(1);
            }
            if (properties.splat_color_3) {
                config.COLOR_3 = WPEColorToRGB(properties.splat_color_3.value);
                updateColors(1);
            }
            if (properties.splat_color_4) {
                config.COLOR_4 = WPEColorToRGB(properties.splat_color_4.value);
                updateColors(1);
            }
            if (properties.splat_color_5) {
                config.COLOR_5 = WPEColorToRGB(properties.splat_color_5.value);
                updateColors(1);
            }

            if (properties.stream_color_1) {
                config.STREAM_COLOR_1 = WPEColorToRGB(properties.stream_color_1.value);
                updateStreams();
            }
            if (properties.stream_color_2) {
                config.STREAM_COLOR_2 = WPEColorToRGB(properties.stream_color_2.value);
                updateStreams();
            }
            if (properties.stream_color_3) {
                config.STREAM_COLOR_3 = WPEColorToRGB(properties.stream_color_3.value);
                updateStreams();
            }
            if (properties.stream_color_4) {
                config.STREAM_COLOR_4 = WPEColorToRGB(properties.stream_color_4.value);
                updateStreams();
            }
            if (properties.stream_color_5) {
                config.STREAM_COLOR_5 = WPEColorToRGB(properties.stream_color_5.value);
                updateStreams();
            }

            if (properties.splat_color_for_stream) {
                config.STREAM_COLORS = !properties.splat_color_for_stream.value;
                updateStreams();
            }
            if (properties.starsplat_points) config.STARSPLAT_POINTS = properties.starsplat_points.value;
            if (properties.starsplat_angle) config.STARSPLAT_ANGLE = properties.starsplat_angle.value;

            // stream properties
            if (properties.num_streams) {
                config.NUM_STREAMS = properties.num_streams.value;
                updateStreams();
            }
            if (properties.stream_size) config.STREAM_SIZE = properties.stream_size.value;
            if (properties.stream_speed) config.STREAM_SPEED = properties.stream_speed.value;
            if (properties.stream_strength) config.STREAM_STRENGTH = properties.stream_strength.value;
            if (properties.max_stream_speed) config.MAX_STREAM_SPEED = properties.max_stream_speed.value;
            if (properties.stream_speed_decay) config.STREAM_SPEED_DECAY = properties.stream_speed_decay.value;
            if (properties.stream_gravity) config.STREAM_GRAVITY = properties.stream_gravity.value;
            if (properties.stream_direction_variability) config.STREAM_DIRECTION_VARIABILITY = properties.stream_direction_variability.value;
            if (properties.stream_brightness) config.STREAM_BRIGHTNESS = properties.stream_brightness.value;
            if (properties.sound_splats) config.SOUND_SPLATS = properties.sound_splats.value;
            if (properties.sound_splat_amount) config.SOUND_SPLAT_AMOUNT = properties.sound_splat_amount.value;
            if (properties.splat_strength) config.SPLAT_STRENGTH = properties.splat_strength.value;
            if (properties.stream_mass) {
                config.STREAM_MASS = properties.stream_mass.value;
                updateStreams();
            }
            if (properties.bounce_strength) config.BOUNCE_STRENGTH = properties.bounce_strength.value;
            if (properties.stream_repel_force) config.STREAM_REPEL_FORCE = properties.stream_repel_force.value;
        }
    };

    window.wallpaperRegisterAudioListener((audioArray) => {
        if (!config.AUDIO_RESPONSIVE) return;
        let bass = 0.0;
        let half = Math.floor(audioArray.length / 2);
        let freqRange = config.FREQ_RANGE;
        let webFactor = 1;

        if (config.IS_WEB) {
            audioArray.reverse();
            freqRange = Math.floor(freqRange / 4);
            webFactor = 0.2;
        } else if (audioArray[0] > 5) {
            return;
        }

        // let arr = [0, 0, 0, 0, 0, 0, 0, 0];
        // let h = arr.length / 2;
        // for (let i = 0; i < arr.length; i++) {
        //     for (let j = 0; j < audioArray.length / arr.length; j++) {
        //         arr[i] += audioArray[i * Math.floor(audioArray.length / arr.length) + j];
        //     }
        //     arr[i] = Math.floor(arr[i] * 100);
        // }
        // console.log(arr);

        // let arr = [0, 0, 0, 0, 0, 0, 0, 0];
        // for (let i = 0; i < arr.length; i++) {
        //     for (let j = 0; j < half / 8 / arr.length; j++) {
        //         arr[i] += audioArray[i * Math.floor(half / 8 / arr.length) + j];
        //     }
        //     arr[i] = Math.floor(arr[i] * 100);
        // }
        // console.log(arr);

        for (let i = 0; i <= freqRange; i++) {
            bass += audioArray[i + config.FREQ_RANGE_START];
            bass += audioArray[half + (i + config.FREQ_RANGE_START)];
        }
        bass /= (freqRange * 2);
        if (config.SOUND_SPLATS) multipleSplats(Math.floor((bass * config.SOUND_SENSITIVITY / 10) * config.SOUND_SPLAT_AMOUNT * webFactor));
        if (config.NUM_STREAMS > 0) generateStreams(bass * webFactor);
    });
});

function updateStreams() {
    config.STREAM_COLOR = [
        rgbToPointerColor(config.STREAM_COLOR_1),
        rgbToPointerColor(config.STREAM_COLOR_2),
        rgbToPointerColor(config.STREAM_COLOR_3),
        rgbToPointerColor(config.STREAM_COLOR_4),
        rgbToPointerColor(config.STREAM_COLOR_5),
    ]
    while (streams.length < config.NUM_STREAMS) streams.push(new StreamPrototype);
    while (streams.length > config.NUM_STREAMS) streams.pop();
    for (let s = 0; s < streams.length; s++) {
        streams[s].mass = config.STREAM_MASS;
        if (config.STREAM_COLORS) {
            streams[s].color = Object.assign({}, config.STREAM_COLOR[wrap(s, 0, config.STREAM_COLOR.length - 1)]);
        }
    }
}

class PointerPrototype {
    constructor() {
        this.id = -1;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.down = false;
        this.moved = false;
        this.color = (config.COLORFUL)
            ? generateColor()
            : rgbToPinterColor(config.SPLAT_COLOR.getRandom());
    }
}

class StreamPrototype {
    constructor() {
        this.x = canvas.width * Math.random();
        this.y = canvas.height * Math.random();
        this.vx = (Math.random() - .5); // velocity as fraction of canvas width per second
        this.vy = (Math.random() - .5); // velocity as fraction of canvas height per second
        this.ax = 0; // acceleration
        this.ay = 0;
        this.mass = config.STREAM_MASS;
        this.last_updated = Date.now();
        this.color = (config.STREAM_COLORS)
            ? config.STREAM_COLOR[wrap(streams.length, 0, config.STREAM_COLOR.length - 1)]
            : (config.COLORFUL)
                ? generateColor()
                : rgbToPointerColor(config.SPLAT_COLOR.getRandom());
    }

    clamp(x, min = 0, max = 1) {
        return Math.min(Math.max(x, min), max);
    }

    bounce(x, y) {
        let nX = x - this.x,
            nY = y - this.y,
            nD = Math.hypot(nX, nY),
            d_n;

        if (nD > 0) {
            nX /= nD;
            nY /= nD;
            d_n = nX * this.vx + nY * this.vy;
            if (d_n > 0) {
                this.vx -= 2 * d_n * nX;
                this.vy -= 2 * d_n * nY;
                d_n = nX * this.ax + nY * this.ay;
                this.ax -= 2 * d_n * nX;
                this.ay -= 2 * d_n * nY;
                this.vx *= config.BOUNCE_STRENGTH;
                this.vy *= config.BOUNCE_STRENGTH;
            }
        }
    }

    updateVelocityAndPosition() {
        let timestep = (Date.now() - this.last_updated);
        this.last_updated += timestep;
        timestep /= 1000;
        this.vx += this.ax * timestep / 2;
        this.vy += this.ay * timestep / 2;

        let v = Math.hypot(this.vx, this.vy)
        if (v > config.MAX_STREAM_SPEED) {
            this.vx *= config.MAX_STREAM_SPEED / v;
            this.vy *= config.MAX_STREAM_SPEED / v;
        }

        this.x += this.vx * timestep * canvas.width;
        this.y += this.vy * timestep * canvas.height;
        
        if (this.x > canvas.width || this.x < 0) {
            this.x = this.clamp(this.x, 0, canvas.width);
            this.vx *= -1;
            this.ax *= -1;

        }
        if (this.y > canvas.height || this.y < 0) {
            this.y = this.clamp(this.y, 0, canvas.height);
            this.vy *= -1;
            this.ay *= -1;
        }

        this.vx *= 1 - config.STREAM_SPEED_DECAY;
        this.vy *= 1 - config.STREAM_SPEED_DECAY;
        return timestep;
    }
}

let streams = [];
let pointers = [];
let splatStack = [];
updateStreams();
pointers.push(new PointerPrototype());

const { gl, ext } = getWebGLContext(canvas);

if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 512;
    config.SHADING = false;
    config.BLOOM = false;
    config.SUNRAYS = false;
}

function getWebGLContext(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2)
        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
    let formatRGBA;
    let formatRG;
    let formatR;

    if (isWebGL2)
    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    }
    else
    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return {
        gl,
        ext: {
            formatRGBA,
            formatRG,
            formatR,
            halfFloatTexType,
            supportLinearFiltering
        }
    };
}

function getSupportedFormat(gl, internalFormat, format, type)
{
    if (!supportRenderTextureFormat(gl, internalFormat, format, type))
    {
        switch (internalFormat)
        {
            case gl.R16F:
                return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
            case gl.RG16F:
                return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
            default:
                return null;
        }
    }

    return {
        internalFormat,
        format
    }
}

function supportRenderTextureFormat(gl, internalFormat, format, type) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status == gl.FRAMEBUFFER_COMPLETE;
}

function clamp01(input) {
    return Math.min(Math.max(input, 0), 1);
}


class Material {
    constructor (vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
    }

    setKeywords (keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++)
            hash += hashCode(keywords[i]);

        let program = this.programs[hash];
        if (program == null)
        {
            let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
            program = createProgram(this.vertexShader, fragmentShader);
            this.programs[hash] = program;
        }

        if (program == this.activeProgram) return;

        this.uniforms = getUniforms(program);
        this.activeProgram = program;
    }

    bind () {
        gl.useProgram(this.activeProgram);
    }
}

class Program {
    constructor (vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
    }

    bind () {
        gl.useProgram(this.program);
    }
}

function createProgram(vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.trace(gl.getProgramInfoLog(program));

    return program;
}

function getUniforms(program) {
    let uniforms = [];
    let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
    }
    return uniforms;
}

function compileShader(type, source, keywords) {
    source = addKeywords(source, keywords);

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.trace(gl.getShaderInfoLog(shader));

    return shader;
};

function addKeywords(source, keywords) {
    if (keywords == null) return source;
    let keywordsString = '';
    keywords.forEach(keyword => {
        keywordsString += '#define ' + keyword + '\n';
    });
    return keywordsString + source;
}

const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`);

const blurVertexShader = compileShader(gl.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`);

const blurShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`);

const copyShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`);

const clearShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`);

const colorShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
    }
`);

const checkerboardShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;

    #define SCALE 25.0

    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(vec3(v), 1.0);
    }
`);

const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;

    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;

        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);

        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);

        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif

    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif

    #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
    #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
`;

const bloomPrefilterShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`);

const bloomBlurShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`);

const bloomFinalShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`);

const sunraysMaskShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`);

const sunraysShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;

    #define ITERATIONS 16

    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;

        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;

        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;

        float color = texture2D(uTexture, vUv).a;

        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }

        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`);

const splatShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`);

const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;

        vec2 iuv = floor(st);
        vec2 fuv = fract(st);

        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,
    ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
);

const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;

        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`);

const curlShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`);

const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`);

const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target, clear = false) => {
        if (target == null)
        {
            gl.viewport(
                -config.ZOOM_X,
                -config.ZOOM_Y,
                gl.drawingBufferWidth + 2 * config.ZOOM_X,
                gl.drawingBufferHeight + 2 * config.ZOOM_Y);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        else
        {
            gl.viewport(0, 0, target.width, target.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear)
        {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        // CHECK_FRAMEBUFFER_STATUS();
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
})();

function CHECK_FRAMEBUFFER_STATUS() {
    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
        console.trace("Framebuffer error: " + status);
}

let dye;
let velocity;
let divergence;
let curl;
let pressure;
let bloom;
let bloomFramebuffers = [];
let sunrays;
let sunraysTemp;

let ditheringTexture = createTextureAsync('https://paveldogreat.github.io/WebGL-Fluid-Simulation/LDR_LLL1_0.png');

const blurProgram            = new Program(blurVertexShader, blurShader);
const copyProgram            = new Program(baseVertexShader, copyShader);
const clearProgram           = new Program(baseVertexShader, clearShader);
const colorProgram           = new Program(baseVertexShader, colorShader);
const checkerboardProgram    = new Program(baseVertexShader, checkerboardShader);
const bloomPrefilterProgram  = new Program(baseVertexShader, bloomPrefilterShader);
const bloomBlurProgram       = new Program(baseVertexShader, bloomBlurShader);
const bloomFinalProgram      = new Program(baseVertexShader, bloomFinalShader);
const sunraysMaskProgram     = new Program(baseVertexShader, sunraysMaskShader);
const sunraysProgram         = new Program(baseVertexShader, sunraysShader);
const splatProgram           = new Program(baseVertexShader, splatShader);
const advectionProgram       = new Program(baseVertexShader, advectionShader);
const divergenceProgram      = new Program(baseVertexShader, divergenceShader);
const curlProgram            = new Program(baseVertexShader, curlShader);
const vorticityProgram       = new Program(baseVertexShader, vorticityShader);
const pressureProgram        = new Program(baseVertexShader, pressureShader);
const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

const displayMaterial = new Material(baseVertexShader, displayShaderSource);

function initFramebuffers() {
    let simRes = getResolution(config.SIM_RESOLUTION);
    let dyeRes = getResolution(config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba    = ext.formatRGBA;
    const rg      = ext.formatRG;
    const r       = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);

    if (dye == null)
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    else
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

    if (velocity == null)
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    else
        velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

    divergence = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    curl       = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);

    initBloomFramebuffers();
    initSunraysFramebuffers();
}

function initBloomFramebuffers() {
    let res = getResolution(config.BLOOM_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    bloom = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);

    bloomFramebuffers.length = 0;
    for (let i = 0; i < config.BLOOM_ITERATIONS; i++)
    {
        let width = res.width >> (i + 1);
        let height = res.height >> (i + 1);

        if (width < 2 || height < 2) break;

        let fbo = createFBO(width, height, rgba.internalFormat, rgba.format, texType, filtering);
        bloomFramebuffers.push(fbo);
    }
}

function initSunraysFramebuffers() {
    let res = getResolution(config.SUNRAYS_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    sunrays     = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
    sunraysTemp = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
}

function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let texelSizeX = 1.0 / w;
    let texelSizeY = 1.0 / h;

    return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        attach (id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
        }
    };
}

function createDoubleFBO (w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);

    return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read () {
            return fbo1;
        },
        set read (value) {
            fbo1 = value;
        },
        get write () {
            return fbo2;
        },
        set write (value) {
            fbo2 = value;
        },
        swap () {
            let temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
        }
    }
}

function resizeFBO(target, w, h, internalFormat, format, type, param) {
    let newFBO = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
}

function resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
    if (target.width == w && target.height == h)
        return target;
    target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
    target.write = createFBO(w, h, internalFormat, format, type, param);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
}

function createTextureAsync(url) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255]));

    let obj = {
        texture,
        width: 1,
        height: 1,
        attach (id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
        }
    };

    let image = new Image();
    image.crossOrigin = "anonymouse";
    image.onload = () => {
        obj.width = image.width;
        obj.height = image.height;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    };
    image.src = url;

    return obj;
}

function updateKeywords() {
    let displayKeywords = [];
    if (config.SHADING) displayKeywords.push("SHADING");
    if (config.BLOOM) displayKeywords.push("BLOOM");
    if (config.SUNRAYS) displayKeywords.push("SUNRAYS");
    displayMaterial.setKeywords(displayKeywords);
}

updateKeywords();
initFramebuffers();
// multipleSplats(parseInt(Math.random() * 20) + 5);

let lastUpdateTime = Date.now();
let colorUpdateTimer = 0.0;
update();

function update() {
    const dt = calcDeltaTime();
    if (resizeCanvas())
        initFramebuffers();
    updateColors(dt);
    applyInputs();
    if (!config.PAUSED)
        step(dt);
    render(null);
    requestAnimationFrame(update);
}

function calcDeltaTime() {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
}

function resizeCanvas() {
    let width = scaleByPixelRatio(canvas.clientWidth);
    let height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function updateColors(dt) {
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    config.SPLAT_COLOR = [
        config.COLOR_1,
        config.COLOR_2,
        config.COLOR_3,
        config.COLOR_4,
        config.COLOR_5,
    ]
    if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
        pointers.forEach(p => {
            p.color = config.COLORFUL ? generateColor() : rgbToPointerColor(config.SPLAT_COLOR.getRandom());
        });
        streams.forEach(s => {
            s.color = (config.STREAM_COLORS)
                ? s.color
                : (config.COLORFUL)
                    ? generateColor()
                    : rgbToPointerColor(config.SPLAT_COLOR.getRandom());
        });
    }
}

function applyInputs() {
    if (splatStack.length > 0)
        multipleSplats(splatStack.pop());

    pointers.forEach(p => {
        if (p.moved) {
            p.moved = false;
            splatPointer(p);
        }
    });
}

function step(dt) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    let velocityId = velocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
}

function render(target) {
    if (config.BLOOM)
        applyBloom(dye.read, bloom);
    if (config.SUNRAYS) {
        applySunrays(dye.read, dye.write, sunrays);
        blur(sunrays, sunraysTemp, 1);
    }

    if (target == null || !config.TRANSPARENT) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
    }
    else {
        gl.disable(gl.BLEND);
    }

    if (!config.TRANSPARENT)
        drawColor(target, normalizeColor(config.BACK_COLOR));
    if (target == null && config.TRANSPARENT)
        drawCheckerboard(target);
    drawDisplay(target);
}

function drawColor(target, color) {
    colorProgram.bind();
    gl.uniform4f(colorProgram.uniforms.color, color.r, color.g, color.b, 1);
    blit(target);
}

function drawCheckerboard(target) {
    checkerboardProgram.bind();
    gl.uniform1f(checkerboardProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    blit(target);
}

function drawDisplay(target) {
    let width = target == null ? gl.drawingBufferWidth : target.width;
    let height = target == null ? gl.drawingBufferHeight : target.height;

    displayMaterial.bind();
    if (config.SHADING)
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    if (config.BLOOM) {
        gl.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1));
        gl.uniform1i(displayMaterial.uniforms.uDithering, ditheringTexture.attach(2));
        let scale = getTextureScale(ditheringTexture, width, height);
        gl.uniform2f(displayMaterial.uniforms.ditherScale, scale.x, scale.y);
    }
    if (config.SUNRAYS)
        gl.uniform1i(displayMaterial.uniforms.uSunrays, sunrays.attach(3));
    blit(target);
}

function applyBloom(source, destination) {
    if (bloomFramebuffers.length < 2)
        return;

    let last = destination;

    gl.disable(gl.BLEND);
    bloomPrefilterProgram.bind();
    let knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
    let curve0 = config.BLOOM_THRESHOLD - knee;
    let curve1 = knee * 2;
    let curve2 = 0.25 / knee;
    gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
    gl.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD);
    gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
    blit(last);

    bloomBlurProgram.bind();
    for (let i = 0; i < bloomFramebuffers.length; i++) {
        let dest = bloomFramebuffers[i];
        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
        blit(dest);
        last = dest;
    }

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
        let baseTex = bloomFramebuffers[i];
        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
        gl.viewport(0, 0, baseTex.width, baseTex.height);
        blit(baseTex);
        last = baseTex;
    }

    gl.disable(gl.BLEND);
    bloomFinalProgram.bind();
    gl.uniform2f(bloomFinalProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
    gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
    gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
    blit(destination);
}

function applySunrays(source, mask, destination) {
    gl.disable(gl.BLEND);
    sunraysMaskProgram.bind();
    gl.uniform1i(sunraysMaskProgram.uniforms.uTexture, source.attach(0));
    blit(mask);

    sunraysProgram.bind();
    gl.uniform1f(sunraysProgram.uniforms.weight, config.SUNRAYS_WEIGHT);
    gl.uniform1i(sunraysProgram.uniforms.uTexture, mask.attach(0));
    blit(destination);
}

function blur(target, temp, iterations) {
    blurProgram.bind();
    for (let i = 0; i < iterations; i++) {
        gl.uniform2f(blurProgram.uniforms.texelSize, target.texelSizeX, 0.0);
        gl.uniform1i(blurProgram.uniforms.uTexture, target.attach(0));
        blit(temp);

        gl.uniform2f(blurProgram.uniforms.texelSize, 0.0, target.texelSizeY);
        gl.uniform1i(blurProgram.uniforms.uTexture, temp.attach(0));
        blit(target);
    }
}

function splatPointer(pointer) {
    let dx = pointer.deltaX * config.SPLAT_FORCE;
    let dy = pointer.deltaY * config.SPLAT_FORCE;
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color, config.POINTER_SIZE);
}

function multipleSplats(amount) {
    for (let i = 0; i < amount; i++) {
        const color = config.COLORFUL ? generateColor() : Object.assign({}, config.SPLAT_COLOR.getRandom());
        color.r *= 10.0;
        color.g *= 10.0;
        color.b *= 10.0;
        const x = Math.random();
        const y = Math.random();
        const dx = 1000 * (Math.random() - 0.5);
        const dy = 1000 * (Math.random() - 0.5);
        if (config.STARSPLAT_POINTS > 0) {
            starSplat(x, y, config.STARSPLAT_POINTS, config.SPLAT_STRENGTH * 1000, color);
        } else {
            splat(x, y, dx * config.SPLAT_STRENGTH, dy * config.SPLAT_STRENGTH, color);
        }
    }
}

function splat(x, y, dx, dy, color, radius = config.SPLAT_RADIUS) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(radius / 100.0));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
}

function starSplat(x, y, n, strength, color, radius = config.SPLAT_RADIUS) {
    let splats = [],
        theta = (config.STARSPLAT_ANGLE == -1)
            ? Math.random() * 2 * Math.PI
            : config.STARSPLAT_ANGLE / 180 * Math.PI;

    for (let i = 0; i < n; i++) {
        theta += 2 * Math.PI / n;
        
        splats[i] = {
            dx: Math.cos(theta),
            dy: Math.sin(theta)
        };
        splat(
            x + splats[i].dx * Math.log10(1.013 + radius / 1000) * n,
            y + splats[i].dy * Math.log10(1.013 + radius / 1000) * n,
            splats[i].dx * strength / 2,
            splats[i].dy * strength / 2,
            color,
            radius / n
        );
    }
}

function longSplat(x, y, dx, dy, velocity = config.STREAM_SPEED) {
    let splats = [];
    // fill up splats
    // add splats to splatsStack
    // on update, pop first splat off each splats in splatsStack
}

function correctRadius(radius) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1)
        radius *= aspectRatio;
    return radius;
}



canvas.addEventListener('mouseenter', () => {
    pointers[0].down = true;
    pointers[0].color = config.COLORFUL ? generateColor() : config.SPLAT_COLOR.getRandom();
});

canvas.addEventListener("mousedown", () => {
    if (!config.SPLAT_ON_CLICK) return;
    multipleSplats(parseInt(Math.random() * 20) + 5);
});

window.addEventListener('mouseleave', () => {
    updatePointerLeaveData(pointers[0]);
});

canvas.addEventListener('mousemove', e => {
    if (!config.SHOW_MOUSE_MOVEMENT) return;
    let pointer = pointers[0];
    if (!pointer.down) return;
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    updatePointerMoveData(pointer, posX, posY);
});

// canvas.addEventListener('mousedown', e => {
//     let posX = scaleByPixelRatio(e.offsetX);
//     let posY = scaleByPixelRatio(e.offsetY);
//     let pointer = pointers.find(p => p.id == -1);
//     if (pointer == null)
//         pointer = new PointerPrototype();
//     updatePointerDownData(pointer, -1, posX, posY); 
// });

// function updatePointerDownData (pointer, id, posX, posY) {
//     pointer.id = id;
//     pointer.down = true;
//     pointer.moved = false;
//     pointer.texcoordX = posX / canvas.width;
//     pointer.texcoordY = 1.0 - posY / canvas.height;
//     pointer.prevTexcoordX = pointer.texcoordX;
//     pointer.prevTexcoordY = pointer.texcoordY;
//     pointer.deltaX = 0;
//     pointer.deltaY = 0;
//     pointer.color = generateColor();
// }

function updatePointerMoveData(pointer, posX, posY) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
}

function updatePointerLeaveData(pointer) {
    pointer.down = false;
}

function correctDeltaX(delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
}

function correctDeltaY(delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
}

function generateColor() {
    let c = HSVtoRGB(Math.random(), 1.0, 1.0);
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return c;
}

function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return {
        r,
        g,
        b
    };
}

function normalizeColor(input) {
    let output = {
        r: input.r / 255,
        g: input.g / 255,
        b: input.b / 255
    };
    return output;
}

function wrap(value, min, max) {
    let range = max - min;
    if (range == 0) return min;
    return (value - min) % range + min;
}

function getResolution(resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1)
        aspectRatio = 1.0 / aspectRatio;

    let min = Math.round(resolution);
    let max = Math.round(resolution * aspectRatio);

    if (gl.drawingBufferWidth > gl.drawingBufferHeight)
        return { width: max, height: min };
    else
        return { width: min, height: max };
}

function getTextureScale(texture, width, height) {
    return {
        x: width / texture.width,
        y: height / texture.height
    };
}

function scaleByPixelRatio(input) {
    let pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
}

function hashCode(s) {
    if (s.length == 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function RGBToHue(r, g, b) {
    // Find greatest and smallest channel values
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
  
    // Calculate hue
    // No difference
    if (delta == 0)
      h = 0;
    // Red is max
    else if (cmax == r)
      h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g)
      h = (b - r) / delta + 2;
    // Blue is max
    else
      h = (r - g) / delta + 4;
  
    h = Math.round(h * 60);
      
    // Make negative hues positive behind 360°
    if (h < 0)
        h += 360;
  
    return h;
}

function rgbToPointerColor(color) {
    let hue = RGBToHue(color.r, color.g, color.b),
        c = HSVtoRGB(hue/360, 1.0, 1.0);

    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return c;
}

function WPEColorToRGB(color) {
    let c = color.split(" "),
        r = Math.floor(c[0]*255),
        g = Math.floor(c[1]*255),
        b = Math.floor(c[2]*255);
    return {r: r, g: g, b: b};
}

function generateStreams(amount) {
    let amt = amount * config.SOUND_SENSITIVITY * 10,
        streamSize = config.STREAM_SIZE * Math.pow((Math.pow(amt - 1, 3) + 1), (amt > 1 ? 0.5 : 1));
    for (let s=0; s < streams.length; s++) {
        // update all stream positions and velocities
        let str = streams[s], // str is a ref
            timestep = str.updateVelocityAndPosition(),
            color = Object.assign({}, str.color);
        color.r = color.r * config.STREAM_BRIGHTNESS * Math.pow(1 + amt, .3);
        color.g = color.g * config.STREAM_BRIGHTNESS * Math.pow(1 + amt, .3);
        color.b = color.b * config.STREAM_BRIGHTNESS * Math.pow(1 + amt, .3);
        for (let i=0; i < 1; i++ ) {
            splat(
                str.x / canvas.width,
                str.y / canvas.height, 
                str.vx * timestep * config.STREAM_STRENGTH * 100 * Math.pow(1 + amount, .5),
                str.vy * timestep * config.STREAM_STRENGTH * 100 * Math.pow(1 + amount, .5),
                color,
                streamSize
            );
        }
    }

    for (let s=0; s < streams.length; s++) {
        // calculate net force on stream at new position
        let str = streams[s],
            Fx = 0,
            Fy = 0,
            theta = Math.atan2(str.vy, str.vx),
            maxThetaChange = config.STREAM_DIRECTION_VARIABILITY,
            newTheta = theta + (Math.PI * 2 * maxThetaChange * (Math.random() - 0.5));

        Fx += amt * Math.cos(newTheta) * config.SOUND_SENSITIVITY * config.STREAM_SPEED * 2;
        Fy += amt * Math.sin(newTheta) * config.SOUND_SENSITIVITY * config.STREAM_SPEED * 2;
        for (let k=0; k < streams.length; k++) {
            let x, y, dx, dy, d, tgtMass;
            if (k === s) {
                if (config.SHOW_MOUSE_MOVEMENT && config.MOUSE_GRAVITY) {
                    x = pointers[0].texcoordX * canvas.width;
                    y = pointers[0].texcoordY * canvas.height;
                    tgtMass = config.STREAM_MASS; // * config.POINTER_SIZE * 10;
                } else {
                    continue;
                }
            } else {
                // calculate distance
                x = streams[k].x;
                y = streams[k].y
                tgtMass = streams[k].mass;
            }
            dx = x - str.x;
            dy = y - str.y;
            d = Math.hypot(dx, dy);
            if (d == 0) {
                d = 0.001;
                let theta = Math.random() * 2 * Math.PI;
                dx = Math.cos(theta) * d;
                dy = Math.sin(theta) * d;
            }
            // Fg = G*m1*m2 / d^2
            let Fk = config.STREAM_GRAVITY * str.mass * tgtMass / Math.pow(d, 1);
            Fk -= Math.pow(config.STREAM_REPEL_FORCE,3) * str.mass * tgtMass / Math.pow(d, 4);
            if (d < Math.pow(streamSize / 100, 0.5) * Math.hypot(canvas.width, canvas.height) &&
                config.BOUNCE_STRENGTH > 0) {
                str.bounce(x, y);
            }
            Fx += Fk * (dx / d);
            Fy += Fk * (dy / d);
        }

        str.ax = Fx / str.mass;
        str.ay = Fy / str.mass;
    }
};

