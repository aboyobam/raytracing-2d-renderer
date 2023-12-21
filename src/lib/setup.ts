import type AppConfig from "./config";
import Camera from "./Camera";
import Scene from "./Scene";
import OctreeOptimizer from "./optimizer/Octree/Octree";
import Photon from "./optimizer/PhotonMapper/Photon";
import rendererMap from "./renderer/rendererMap";
import GLTFParser from "./parsers/GLTFParser";
import Material from "./Material";
import rendererConfig from "./rendererConfig";

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
        Object.assign(rendererConfig, _data.config);
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

        const gold = {
            ambient: [0.24725, 0.1995, 0.0745],
            specular: [0.628281, 0.555802, 0.366065],
            r: 0.75164 * 255,
            g: 0.60648 * 255,
            b: 0.22648 * 255,
            glossyness: 50
        } as Material;
        if (_data.config.gltf == "simple-scene.gltf") {
            // Material.all.Red.glossyness = 40;
            Material.all.Blue.glossyness = 40;
            Material.all.Green.glossyness = 40;
            Object.assign(Material.all.Yellow, gold);
            Object.assign(Material.all.Red, {
                // 0.0	0.0	0.0	0.5	0.0	0.0	0.7	0.6	0.6	.25
                ambient: [0.1745, 0.01175, 0.01175],
                specular: [0.727811, 0.626959, 0.626959],
                r: 0.61424 * 255,
                g: 0.04136 * 255,
                b: 0.04136 * 255,
                glossyness: Math.round(0.6 * 128)
            } as Material);
        }

        if (_data.config.gltf == "emmiting.gltf") {
            Material.all.Material.emmitting = [0.2, 0.4, 4];
        }

        if (_data.config.gltf == "glass.gltf") {
            Material.all.glass.glossyness = 30;
        }


        if (_data.config.gltf == "final.gltf") {
            Material.all.Pottery.glossyness = 10;
            Material.all.Garden.ambient = [1, 1, 1];
            Material.all.Garden.ambientOnly = true;
            Material.all.Floor.specular = [0.05, 0.1, 0.15];
            Material.all.Floor.illusive = 0.1;
            Material.all.DiamondOutside.refractiveIndex = 1.6;
            Material.all.DiamondOutside.specular = [0.1, 0.1, 0.2];
            Material.all.DiamondOutside.illusive = 0.6;
            // Material.all.DiamondOutside.glossyness = 20;
            // Material.all.Floor.ambient = [0.4, 0.3, 0.25];
            Object.assign(Material.all.Clock, gold);
            Material.all.Clock.glossyness = 30;
        }

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

    console.log(scene.lights);
    console.log(Material.all);
    
    

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

                        for (const photon of event.data) {
                            photons.push(photon);
                        }

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