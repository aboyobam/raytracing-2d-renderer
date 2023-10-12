import Mesh from "@/Mesh";
import QuadNode from "./QuadNode";
import Camera from "@/Camera";
import Scene from "@/Scene";
import Vector3 from "@/Vector3";
import Face from "@/Face";

export type MeshAndFace = [Mesh, Face];

export default class QuadTree {
    static MAX_COUNT: number;

    private readonly root: QuadNode;

    static ofScene(scene: Scene, camera: Camera) {
        const qt = new QuadTree(camera);
        for (const mesh of scene) {
            qt.insert(mesh);
        }

        return qt;
    }

    constructor(public readonly camera: Camera) {

        const planeHeight = 2 * Math.tan((camera.fov / 2) * (Math.PI / 180)) * camera.near;
        const planeWidth = planeHeight * camera.aspectRatio;

        const forward = camera.target.norm(); 
        const right = camera.up.cross(forward).norm();
        const up = forward.cross(right).norm(); 
        const center = camera.position.add(forward.multScalar(camera.near));
        const halfUp = up.multScalar(planeHeight / 2);
        const halfRight = right.multScalar(planeWidth / 2);

        const topLeft = center.add(halfUp).sub(halfRight);
        const topRight = center.add(halfUp).add(halfRight);
        const bottomLeft = center.sub(halfUp).sub(halfRight);
        const bottomRight = center.sub(halfUp).add(halfRight);

        this.root = new QuadNode(this, [topRight, bottomRight, bottomLeft, topLeft]);
    }

    insert(mesh: Mesh) {
        for (const face of mesh.geometry.faces) {
            this.root.insert(mesh, face);
        }
    }

    *intersects(dir: Vector3): IterableIterator<MeshAndFace> {
        yield* this.root.intersects(dir);
    }

    print() {
        console.log(this.root.print());
    }
}