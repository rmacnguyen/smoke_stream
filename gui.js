function startGUI () {
    var gui = new dat.GUI({ width: 300, closeOnTop: true});
    let notes = { note: 'Press H to hide GUI' };
    gui.add(notes, 'note').name('Notes');
    // gui.add({ fun: function () {
    //     splatStack.push(parseInt(Math.random() * 20) + 5);
    // } }, 'fun').name('Random splats');

    gui.remember(config);
    var generalFolder = gui.addFolder('General Settings');
    generalFolder.add(config, 'SHOW_MOUSE_MOVEMENT').name('mouse movement');
    generalFolder.add(config, 'POINTER_SIZE', 0.01, 1).name('mouse size');
    generalFolder.add(config, 'MOUSE_GRAVITY').name('affects streams');
    generalFolder.add(config, 'SPLAT_ON_CLICK').name('splat on click');
    generalFolder.addColor(config, 'BACK_COLOR').name('background color');
    generalFolder.add(config, 'ZOOM_PERCENT', 100, 500).name('zoom');
    generalFolder.add(config, 'SOUND_SENSITIVITY', 0, 10).name('sound sensitivity');
    generalFolder.add(config, 'FREQ_RANGE', 1, 62).name('freq range');
    generalFolder.add(config, 'FREQ_RANGE_START', 0, 62).name('range start');
    generalFolder.add(config, 'PAUSED').name('paused');

    var fluidFolder = gui.addFolder('Fluid Settings');
    fluidFolder.add(config, 'DYE_RESOLUTION', { '8192': 8192, '4096': 4096, '2048': 2048, '1024': 1024, '512': 512, '256': 256, '128': 128 }).name('dye resolution').onFinishChange(initFramebuffers);
    fluidFolder.add(config, 'SIM_RESOLUTION', { '1024': 1024, '512': 512, '256': 256, '128': 128, '64': 64, '32': 32 }).name('sim resolution').onFinishChange(initFramebuffers);
    fluidFolder.add(config, 'DENSITY_DISSIPATION', 0, 5.0).name('density diffusion');
    fluidFolder.add(config, 'VELOCITY_DISSIPATION', 0, 5.0).name('velocity diffusion');
    fluidFolder.add(config, 'PRESSURE', 0.0, 1.0).name('pressure diffusion');
    fluidFolder.add(config, 'CURL', 0, 100).name('curl').step(1);
    fluidFolder.add(config, 'SHADING').name('shading').onFinishChange(updateKeywords);

    var bloomFolder = fluidFolder.addFolder('Bloom');
    bloomFolder.add(config, 'BLOOM').name('enabled').onFinishChange(updateKeywords);
    bloomFolder.add(config, 'BLOOM_INTENSITY', 0.1, 2.0).name('intensity');
    bloomFolder.add(config, 'BLOOM_THRESHOLD', 0.0, 1.0).name('threshold');
    bloomFolder.add(config, 'BLOOM_SOFT_KNEE', 0.0, 1.0).name('soft knee');

    var sunraysFolder = fluidFolder.addFolder('Sunrays');
    sunraysFolder.add(config, 'SUNRAYS').name('enabled').onFinishChange(updateKeywords);
    sunraysFolder.add(config, 'SUNRAYS_WEIGHT', 0.1, 10.0).name('weight');

    var colorFolder = gui.addFolder('Color Settings');
    colorFolder.add(config, 'COLOR_UPDATE_SPEED', 0, 20).name('color update speed');
    colorFolder.add(config, 'COLORFUL').name('random colors');
    colorFolder.addColor(config, 'COLOR_1').name('color 1').onFinishChange(()=>updateColors(1));
    colorFolder.addColor(config, 'COLOR_2').name('color 2').onFinishChange(()=>updateColors(1));
    colorFolder.addColor(config, 'COLOR_3').name('color 3').onFinishChange(()=>updateColors(1));
    colorFolder.addColor(config, 'COLOR_4').name('color 4').onFinishChange(()=>updateColors(1));
    colorFolder.addColor(config, 'COLOR_5').name('color 5').onFinishChange(()=>updateColors(1));
    colorFolder.add(config, 'STREAM_COLORS').name('use stream colors').onFinishChange(updateStreams);
    colorFolder.addColor(config, 'STREAM_COLOR_1').name('stream color 1').onFinishChange(updateStreams);
    colorFolder.addColor(config, 'STREAM_COLOR_2').name('stream color 2').onFinishChange(updateStreams);
    colorFolder.addColor(config, 'STREAM_COLOR_3').name('stream color 3').onFinishChange(updateStreams);
    colorFolder.addColor(config, 'STREAM_COLOR_4').name('stream color 4').onFinishChange(updateStreams);
    colorFolder.addColor(config, 'STREAM_COLOR_5').name('stream color 5').onFinishChange(updateStreams);

    var splatFolder = gui.addFolder('Splat Settings');
    splatFolder.add(config, 'IDLE_SPLATS').name('random splats');
    splatFolder.add(config, 'RANDOM_AMOUNT', 1, 100).name('random splat amount');
    splatFolder.add(config, 'RANDOM_INTERVAL', 0, 5).name('random splat interval');
    splatFolder.add(config, 'SOUND_SPLATS').name('enable sound splats');
    splatFolder.add(config, 'SPLAT_STRENGTH', 0, 100).name('splat strength');
    splatFolder.add(config, 'SOUND_SPLAT_AMOUNT', 1, 100).name('sound splat amount');
    splatFolder.add(config, 'SPLAT_RADIUS', 0.01, 1).name('splat radius');
    splatFolder.add(config, 'STARSPLAT_POINTS', 0, 10, 1).name('star points');
    splatFolder.add(config, 'STARSPLAT_ANGLE', -1, 360, 1).name('star angle');

    var streamFolder = gui.addFolder('Stream Settings');
    streamFolder.add(config, 'NUM_STREAMS', 0, 5, 1).name('number of streams').onFinishChange(updateStreams);
    streamFolder.add(config, 'STREAM_SIZE', 0.01, 2).name('stream size');
    streamFolder.add(config, 'STREAM_SPEED', 0.1, 2.0).name('velocity');
    streamFolder.add(config, 'MAX_STREAM_SPEED', 0.1, 2).name('max velocity');
    streamFolder.add(config, 'STREAM_SPEED_DECAY', 0, 0.99).name('velocity decay');
    streamFolder.add(config, 'STREAM_STRENGTH', 0, 1000).name('stream strength');
    streamFolder.add(config, 'STREAM_GRAVITY', 0, 1000).name('gravity');
    streamFolder.add(config, 'STREAM_REPEL_FORCE', 0, 1000).name('repelling force');
    streamFolder.add(config, 'STREAM_DIRECTION_VARIABILITY', 0, 1).name('directional variability');
    streamFolder.add(config, 'STREAM_BRIGHTNESS', 0, 1).name('brightness');
    streamFolder.add(config, 'STREAM_MASS', 0.1, 10).name('mass').onFinishChange(updateStreams);
    streamFolder.add(config, 'BOUNCE_STRENGTH', 0, 50).name('bounce strength');

    
}

startGUI();
config.IS_WEB = true;