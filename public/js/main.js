document.addEventListener("DOMContentLoaded", function() {
    var eventsQueue = [];
    initializeThreeJS(document.body, eventsQueue);
    var evtSource = new EventSource("./events", { withCredentials: false });

    evtSource.onmessage = function(e) {
        var newElement = document.createElement("div");
        var obj = JSON.parse(e.data);
        obj.loggingTime = new Date(obj.loggingTime);
        if (!eventsQueue.length)
            console.log(obj);
        eventsQueue.push(obj);
        //document.body.appendChild(newElement);
    }
});

function initializeThreeJS(container, eventsQueue) {
    // set the scene size
    var WIDTH = 400,
        HEIGHT = 300;

    // set some camera attributes
    var VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000;

    // create a WebGL renderer, camera
    // and a scene
    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

    var scene = new THREE.Scene();

    // add the camera to the scene
    scene.add(camera);

    // the camera starts at 0,0,0
    // so pull it back
    camera.position.z = 300;

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    container.appendChild(renderer.domElement);

    // attach model
    var model = createModel();
    scene.add(model);
    scene.add(createLight());

    var lastUpdateTimestamp;
    var lastSampleTimestamp;
    var firstUpdate;
    function render(timestamp) {
        var renderDelta = lastUpdateTimestamp ? timestamp - lastUpdateTimestamp : 0;

        var sample = getSample(renderDelta, lastSampleTimestamp, timestamp - firstUpdate);
        if (sample) {
            model.rotation.x = sample.motionRoll;
            model.rotation.y = sample.motionRoll;
            model.rotation.z = sample.motionYaw;
            lastSampleTimestamp = sample.loggingTime.getTime();
            lastUpdateTimestamp = timestamp;
            if (!firstUpdate)
                firstUpdate = timestamp;
        }
        renderer.render(scene, camera);
        window.requestAnimationFrame(render);
    }

    function getSample(renderDelta, lastSampleTimestamp, firstUpdate)
    {
        if (!eventsQueue.length)
            return null;
        if (!renderDelta || !lastSampleTimestamp)
            return eventsQueue.shift();
        var sample = eventsQueue.shift();
        while (eventsQueue.length && sample.loggingTime.getTime() - lastSampleTimestamp < renderDelta)
            sample = eventsQueue.shift();
        if (!eventsQueue.length) {
            console.log("Done." + firstUpdate);
            console.log(sample);
        }
        return sample;
    }

    window.requestAnimationFrame(render);

    // DEBUG
    window.model = model;
}

function createModel() {
    // set up the sphere vars
    var radius = 50,
        segments = 16,
        rings = 16;

    var cubeMaterials = [
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
        new THREE.MeshLambertMaterial({ color: 0xCC0000 }),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
    ];
    var box = new THREE.Mesh(new THREE.BoxGeometry( 50, 100, 5, 1, 1, 1 ), 
        new THREE.MeshFaceMaterial(cubeMaterials));
    box.rotateX(-0.9);

    return box;
}

function createLight() {
    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    return pointLight;
}
