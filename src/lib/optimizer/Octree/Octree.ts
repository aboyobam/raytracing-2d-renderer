import Decimal from "decimal.js";
import Ocnode from "./Ocnode";
import Vector3 from "@/Vector3";
import Scene from "@/Scene";
import Face from "@/Face";
import Mesh from "@/Mesh";

export type MeshAndFace = [Mesh, Face];

export default class Octree {
    static MAX_DEPTH: number;

    private readonly root: Ocnode;

    constructor(scene: Scene) {
        const [min, max] = scene.boundingBox;

        this.root = new Ocnode(
            Vector3.midpoint(min, max),
            Decimal.max(max.x.sub(min.x), max.y.sub(min.y), max.z.sub(min.z)).div(2)
        );

        for (const mesh of scene) {
            for (const face of mesh.geometry.faces) {
                this.root.add(mesh, face);
            }
        }
    }

    *intersects(origin: Vector3, dir: Vector3): IterableIterator<MeshAndFace> {
        yield* this.root.intersects(origin, dir);
    }

    print() {
        console.log(this.root.print().join("\n"));
    }
}