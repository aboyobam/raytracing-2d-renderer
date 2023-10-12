import Camera from "./Camera";
import Renderer from "./Renderer";
import Scene from "./Scene";
import type AppConfig from "./config";
import Octree from "./optimizer/Octree/Octree";
import QuadTree from "./optimizer/PlanarQuadTree/QuadTree";

let _buildScene: (context: SetupContext) => void | Promise<void>;
let _data: {
    mod: number;
    total: number;
    config: AppConfig['renderer'];
    buffer: SharedArrayBuffer;
};
let ready = false;

export const rendererConfig = {} as AppConfig['renderer'];

self.onmessage = ({ data: { type, data } }) => {
    if (type == "config") {
        _data = data;
        Object.assign(rendererConfig, _data.config);

        if (_data.config.optimizer) {
            if (_data.config.optimizer.type === "qt") {
                QuadTree.MAX_COUNT = _data.config.optimizer.maxSize;
            }

            if (_data.config.optimizer.type === "ot") {
                Octree.MAX_DEPTH = _data.config.optimizer.maxDepth;
            }
        }
        
        if (_buildScene) {
            doSetup();
        }
    } else if (type == "render") {
        ready = true;
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

    if (_data.config.threadSync) {
        await new Promise<void>((resolve) => {
            self.postMessage("ready");
            const iv = setInterval(() => {
                if (ready) {
                    clearInterval(iv);
                    return resolve();
                }
            });
        });
    }

    scene.position.copy(camera.position.multScalar(-1));
    camera.position.set(0, 0, 0);

    scene.build();
    renderer.render(camera, scene);
    self.close();
}

interface SetupContext {
    scene: Scene;
    camera: Camera;
    renderer: Renderer;
    config: AppConfig['renderer'];
}