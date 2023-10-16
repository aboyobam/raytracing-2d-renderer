import "../Scene";
import "../Vector3";
import "../Face";
import "../Geometry";
import "../Mesh";
import "../Material";
import "../Light";

import Scene from "../Scene";
import { deserialize } from "../serializable";
import PhotonMapper from "../optimizer/PhotonMapper/PhotonMapper";
import Raytracer from "@/Raytracer";
import AppConfig from "@/config";
import Vector3 from "../Vector3";

self.onmessage = ({ data: { scene, offset, skip, setup } }: { data: MessageData }) => {
    deserialize(scene);

    const rc = new Raytracer(scene);
    const photonMapper = new PhotonMapper(scene, rc, {
        offset, skip,
        ...setup
    });

    const all = Array.from(photonMapper.get(Vector3.ZERO, Infinity));
    self.postMessage(all);

    self.close();
};

interface MessageData {
    scene: Scene,
    offset: number;
    skip: number;
    setup: AppConfig['renderer']['photonMapperSetup'];
}