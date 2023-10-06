import Camera from "./Camera";
import Renderer from "./Renderer";
import Scene from "./Scene";
import type AppConfig from "./config";
import QuadTree from "./optimizer/QuadTree";

let _buildScene: (context: SetupContext) => void | Promise<void>;
let _data: {
    mod: number;
    total: number;
    config: AppConfig['renderer'];
    buffer: SharedArrayBuffer;
};

export const rendererConfig = {} as AppConfig['renderer'];

self.onmessage = ({ data }) => {
    _data = data;
    Object.assign(rendererConfig, _data.config);
    QuadTree.MAX_COUNT = _data.config.qtMaxSize;
    
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

async function doSetup() {
    const scene = new Scene();
    const renderer = new Renderer(_data.config, _data.buffer, _data.mod, _data.total);
    const camera = new Camera(_data.config.cameraFov, renderer.config.width / renderer.config.height, _data.config.cameraNear);

    await _buildScene({ scene, camera, renderer, config: _data.config });

    renderer.render(camera, scene);
    self.close();
}

interface SetupContext {
    scene: Scene;
    camera: Camera;
    renderer: Renderer;
    config: AppConfig['renderer'];
}