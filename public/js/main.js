var sample;

document.addEventListener("DOMContentLoaded", function() {
    initializeThreeJS(document.body);
    var evtSource = new EventSource("./events", { withCredentials: false });

    evtSource.onmessage = function(e) {
        var newElement = document.createElement("div");
        var obj = JSON.parse(e.data);
        var quaternion = {
            x: obj[0],
            y: obj[1],
            z: obj[2],
            w: obj[3]
        };
        sample = quaternion;
    }
});

function initializeThreeJS(container) {
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

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    container.appendChild(renderer.domElement);

    // attach model
    var model = createModel();
    scene.add(model);
    var light = createLight();
    scene.add(light);

    // the camera starts at 0,0,0
    // so pull it back
    // camera.position.y = 300;
    //camera.position.x = 150;
    window.camera = camera;
    camera.position.z = 150;
    camera.position.y = -150;
    camera.lookAt(model.position);
    light.position.x = camera.position.x;
    light.position.y = camera.position.y;
    light.position.z = camera.position.z;

    function render(timestamp) {
        if (sample) {
            var quaternion = new THREE.Quaternion();
            quaternion.set(sample.x, sample.y, sample.z, sample.w);
            model.rotation.setFromQuaternion(quaternion);
        }
        renderer.render(scene, camera);
        window.requestAnimationFrame(render);
    }

    window.requestAnimationFrame(render);
}

function createModel() {
    var cubeMaterials = [
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
        new THREE.MeshLambertMaterial({ color: 0x00CC00 }),
        new THREE.MeshLambertMaterial({ color: 0xCC0000 }),
        new THREE.MeshLambertMaterial({ color: 0xCCCCCC }),
    ];
    var box = new THREE.Mesh(new THREE.BoxGeometry( 50, 100, 5, 1, 1, 1 ), 
        new THREE.MeshFaceMaterial(cubeMaterials));

    window.box = box;
    return box;
}

function createLight() {
    // create a point light
    var pointLight =
      new THREE.PointLight(0xFFFFFF);
    // add to the scene
    return pointLight;
}
