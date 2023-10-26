import "../Scene";
import "../Vector3";
import "../Face";
import "../Geometry";
import "../Mesh";
import "../Material";
import "../Light";

import Camera from "../Camera";
import Scene from "../Scene";
import AppConfig from "../config";
import { deserialize } from "../serializable";
import OctreeOptimizer from "../optimizer/Octree/Octree";
import rendererConfig from "../rendererConfig";
import Photon from "../optimizer/PhotonMapper/Photon";
import PhotonMapper from "../optimizer/PhotonMapper/PhotonMapper";
import PhotonTree from "../optimizer/PhotonMapper/PhotonTree";
import rendererMap from "../renderer/rendererMap";

self.onmessage = ({ data: { scene, photons, _data } }: { data: MessageData }) => {
    deserialize(scene);
    deserialize(photons);

    Object.assign(rendererConfig, _data.config);
    OctreeOptimizer.MAX_DEPTH = _data.config.optimizer.maxDepth;

    const RendererClass = rendererMap[_data.config.renderer.type];

    if (RendererClass.usesPhotonMapper) {
        const tree = new PhotonTree(scene, _data.config.photonMapperSetup.maxSize);
        const mapper: PhotonMapper = { tree } as any;
        Object.setPrototypeOf(mapper, PhotonMapper.prototype); 

        for (const photon of photons) {
            tree.add(photon);
        }
        
        RendererClass.photonMapper = mapper;
    }

    const renderer = new RendererClass(_data.buffer, _data.offset, _data.skip, _data.config.renderer);
    renderer.render(scene);

    self.postMessage("done");

    if (_data.config.autoClose) {
        self.close();
    }
};

interface MessageData {
    scene: Scene,
    camera: Camera,
    photons?: Photon[],
    _data: {
        offset: number;
        skip: number;
        config: AppConfig['renderer'];
        buffer: SharedArrayBuffer;
    };
}