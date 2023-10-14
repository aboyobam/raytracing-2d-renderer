import type AppConfig from "./config";
import Camera from "./Camera";
import Scene from "./Scene";
import Octree from "./optimizer/Octree/Octree";
import QuadTree from "./optimizer/PlanarQuadTree/QuadTree";
import AlphaRenderer from "./renderer/AlphaRenderer";
import LightAlphaRenderer from "./renderer/LightAlphaRenderer";
import LightRenderer from "./renderer/LightRenderer";
import { Renderer, RendererConstructor } from "./renderer/Renderer";
import StubRenderer from "./renderer/StubRenderer";
import WireframeRenderer from "./renderer/WireframeRenderer";
import StubReflectRenderer from "./renderer/StubReflectRenderer";
import LightReflectRenderer from "./renderer/LightReflectRenderer";

const renderers: Record<AppConfig['renderer']['renderer']['type'], RendererConstructor> = {
    light: LightRenderer,
    alpha: AlphaRenderer,
    lightAlpha: LightAlphaRenderer,
    wireframe: WireframeRenderer,
    stub: StubRenderer,
    stubReflect: StubReflectRenderer,
    lightReflect: LightReflectRenderer
};

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
    const RendererClass = renderers[_data.config.renderer.type];
    const scene = new Scene();
    const renderer = new RendererClass(_data.buffer, _data.mod, _data.total, _data.config.renderer);
    const camera = new Camera(_data.config.cameraFov, rendererConfig.width / rendererConfig.height, _data.config.cameraNear);

    await _buildScene({ scene, camera, renderer, config: _data.config });

    scene.position.copy(camera.position.multScalar(-1));
    camera.position.set(0, 0, 0);

    scene.build();
    renderer.render(camera, scene);
    self.postMessage("done");

    if (_data.config.autoClose) {
        self.close();
    }
}

interface SetupContext {
    scene: Scene;
    camera: Camera;
    renderer: Renderer;
    config: AppConfig['renderer'];
}