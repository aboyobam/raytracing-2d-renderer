import type AppConfig from "./config";
import Camera from "./Camera";
import Scene from "./Scene";
import Octree from "./optimizer/Octree/Octree";
import Photon from "./optimizer/PhotonMapper/Photon";
import rendererMap from "./renderer/rendererMap";

let _buildScene: (context: SetupContext) => void | Promise<void>;
let _data: {
    threads: number;
    config: AppConfig['renderer'];
    buffer: SharedArrayBuffer;
};

self.onmessage = ({ data: { type, data } }) => {
    if (type == "config") {
        _data = data;
        Octree.MAX_DEPTH = _data.config.optimizer.maxDepth;
        
        if (_buildScene) {
            doSetup();
        }
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
    const camera = new Camera(_data.config.cameraFov, _data.config.width / _data.config.height, _data.config.cameraNear);

    const start = performance.now();

    await _buildScene({ scene, camera });

    scene.position.copy(camera.position.neg());
    camera.position.set(0, 0, 0);
    scene.build();

    let finished = 0;

    const photons: Photon[] = [];
    const RendererClass = rendererMap[_data.config.renderer.type];

    if (RendererClass.usesPhotonMapper) {
        await new Promise<void>(resolve => {
            let gotPhotons = 0;

            for (let offset = 0; offset < _data.threads; offset++) {
                const photonThread = new Worker("/js/workers/photons.bundle.js");
                photonThread.postMessage({
                    scene,
                    offset,
                    skip: _data.threads,
                    setup: _data.config.photonMapperSetup
                });
        
                photonThread.onmessage = (event: MessageEvent<Photon[]>) => {
                    gotPhotons++;
                    photons.push(...event.data);

                    if (gotPhotons == _data.threads) {
                        return resolve();
                    }
                }
            }
        });
    }

    for (let offset = 0; offset < _data.threads; offset++) {
        const renderThread = new Worker("/js/workers/frame.bundle.js");
        renderThread.postMessage({
            scene,
            camera,
            photons,
            _data: {
                buffer: _data.buffer,
                config: _data.config,
                offset,
                skip: _data.threads
            }
        });

        renderThread.onmessage = (event) => {
            if (event.data == "done") {
                finished++;
                if (finished == _data.threads) {
                    console.log("Rendering time:", performance.now() - start);

                    if (_data.config.autoClose) {
                        self.close();
                    }
                }
            }
        }
    }
}

interface SetupContext {
    scene: Scene;
    camera: Camera;
    // renderer: Renderer;
    // config: AppConfig['renderer'];
}