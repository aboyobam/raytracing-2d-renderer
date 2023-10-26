import type AppConfig from "./config";
import Camera from "./Camera";
import Scene from "./Scene";
import OctreeOptimizer from "./optimizer/Octree/Octree";
import Photon from "./optimizer/PhotonMapper/Photon";
import rendererMap from "./renderer/rendererMap";
import GLTFParser from "./parsers/GLTFParser";
import Material from "./Material";

type BuildScene = (context: SetupContext) => void | Promise<void>;
let _build: () => Promise<Scene>;
let _data: {
    threads: number;
    config: AppConfig['renderer'];
};

let _render: (size: { width: number, height: number, buffer: SharedArrayBuffer }) => Promise<void>;

self.onmessage = ({ data: { type, data } }) => {
    if (type == "config") {
        _data = data;
        OctreeOptimizer.MAX_DEPTH = _data.config.optimizer.maxDepth;
        
        if (_build) {
            doSetup();
        }
    } else if (type == "render") {
        _render(data);
    }
}

interface SetupFunction {
    (buildScene: BuildScene): void;
    gltf(): void;
}

const setup: SetupFunction = function(buildScene: BuildScene) {
    _build = async () => {
        const scene = new Scene();
        const camera = new Camera(_data.config.cameraFov, _data.config.width / _data.config.height, _data.config.cameraNear);
        scene.cameras.push(camera);
        await buildScene({ scene, camera });
        return scene;
    };

    if (_data) {
        doSetup();
    }
} as SetupFunction;

setup.gltf = function() {
    _build = async () => {
        const scene = await GLTFParser.parse(_data.config.gltf);
        return scene;
    }

    if (_data) {
        doSetup();
    }
}

export default setup;

async function doSetup() {
    
    const start = performance.now();
    
    const scene = await _build();
    scene.build();

    self.postMessage({
        type: "aspect",
        aspect: scene.cameras[0].aspectRatio
    });

    _render = async ({ width, height, buffer }) => {
        _data.config.width = width;
        _data.config.height = height;
        
        let finished = 0;

        const photons: Photon[] = [];
        const RendererClass = rendererMap[_data.config.renderer.type];
    
        if (RendererClass.usesPhotonMapper && _data.config.photonMapperSetup.enabled) {
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
                photons,
                _data: {
                    buffer,
                    config: _data.config,
                    offset,
                    skip: _data.threads
                }
            });
    
            renderThread.onmessage = (event) => {
                if (event.data == "done") {
                    finished++;
                    if (finished == _data.threads) {
                        const time = performance.now() - start;
                        console.log("Rendering time:", time);
                        self.postMessage({
                            type: "time",
                            faces: scene.faces,
                            lights: scene.lights.length,
                            renderer: _data.config.renderer.type,
                            time
                        });
    
                        if (_data.config.autoClose) {
                            self.close();
                        }
                    }
                }
            }
        }
    }
}

interface SetupContext {
    scene: Scene;
    camera: Camera;
}