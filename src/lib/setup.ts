import Camera from "./Camera";
import Renderer from "./Renderer";
import Scene from "./Scene";
import AppConfig from "./config";

let _buildScene: (context: SetupContext) => void;
let _data: AppConfig['renderer'];

self.onmessage = ({ data }) => {
    _data = data;
    if (_buildScene) {
        doSetup();
    }
}

export default function setup(buildScene: typeof _buildScene) {
    _buildScene = buildScene;

    if (_data) {
        doSetup();
    }
}

function doSetup() {
    const scene = new Scene();
    const renderer = new Renderer(_data.width, _data.height, _data.autoUpdate, _data.updateRate);
    const camera = new Camera(_data.cameraFov, renderer.width / renderer.height, _data.cameraNear);

    _buildScene({ scene, camera, renderer });

    renderer.render(camera, scene);
}

interface SetupContext {
    scene: Scene;
    camera: Camera;
    renderer: Renderer;
}