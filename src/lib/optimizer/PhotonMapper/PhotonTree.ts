import Scene from "@/Scene";
import PhotonNode from "./PhotonNode";
import Vector3 from "@/Vector3";
import Photon from "./Photon";

export default class PhotonTree {
    private readonly root: PhotonNode;

    constructor(scene: Scene, public readonly maxSize: number) {
        const [min, max] = scene.boundingBox;

        this.root = new PhotonNode(
            this,
            Vector3.midpoint(min, max),
            Math.max(max.x - min.x, max.y - min.y, max.z - min.z) / 2
        );
    }

    get(point: Vector3, delta: number) {
        return this.root.get(point, delta);
    }

    add(photon: Photon) {
        return this.root.add(photon);
    }
}