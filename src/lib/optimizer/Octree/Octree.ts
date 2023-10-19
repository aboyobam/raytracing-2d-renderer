import Ocnode from "./Ocnode";
import Vector3 from "@/Vector3";
import Scene from "@/Scene";
import Face from "@/Face";
import Mesh from "@/Mesh";

export default class Octree {
    static MAX_DEPTH: number;

    private readonly root: Ocnode;

    constructor(scene: Scene) {
        const [min, max] = scene.boundingBox;

        this.root = new Ocnode(
            Vector3.midpoint(min, max),
            Math.max(max.x - min.x, max.y - min.y, max.z - min.z) / 2
        );

        for (const mesh of scene) {
            for (const face of mesh.geometry.faces) {
                this.root.add(face);
            }
        }
    }

    *intersects(origin: Vector3, dir: Vector3): IterableIterator<Face> {
        yield* this.root.intersects(origin, dir);
    }

    print() {
        console.log(this.root.print().join("\n"));
    }
}