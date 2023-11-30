import Vector3 from "@/Vector3";
import Scene from "@/Scene";
import Face from "@/Face";
import intersectsBounds from "@/intersects-bounds";
import Optimizer from "../Optimizer";

export default class BVHOptimizer implements Optimizer {
    private readonly root: BVHNode;

    constructor(scene: Scene) {
        let faces: Face[] = [];

        for (const mesh of scene) {
            faces = faces.concat(mesh.geometry.faces);
        }

        this.root = new BVHNode(faces, scene.boundingBox);
    }

    *intersects(origin: Vector3, dir: Vector3): IterableIterator<Face> {
        yield* this.root.intersects(origin, dir);
    }

    print() {
        console.log(this.root.print().join("\n"));
    }
}

class BVHNode {
    private left?: BVHNode;
    private right?: BVHNode;
    private readonly entries: Face[] = [];

    constructor(faces: Face[], private readonly boundingBox?: [Vector3, Vector3]) {
        if (!boundingBox) {
            this.boundingBox = this.computeBoundingBox(faces);
        }

        if (faces.length <= 2) {
            this.entries = faces;
        } else {
            const axis = this.getLargestAxis();
            const sortedFaces = faces.sort((a, b) => Vector3.midpoint(...a.getBoundingBox())[axis] - Vector3.midpoint(...b.getBoundingBox())[axis]);
            const mid = Math.floor(sortedFaces.length / 2);
            this.left = new BVHNode(sortedFaces.slice(0, mid));
            this.right = new BVHNode(sortedFaces.slice(mid));
        }
    }

    private computeBoundingBox(faces: Face[]): [Vector3, Vector3] {
        let min = new Vector3(Infinity, Infinity, Infinity);
        let max = new Vector3(-Infinity, -Infinity, -Infinity);

        for (const face of faces) {
            const [faceMin, faceMax] = face.getBoundingBox();
            min = Vector3.min(min, faceMin);
            max = Vector3.max(max, faceMax);
        }

        return [min, max];
    }

    private getLargestAxis(): 'x' | 'y' | 'z' {
        const size = this.boundingBox[1].clone().sub(this.boundingBox[0]);
        if (size.x > size.y && size.x > size.z) {
            return 'x';
        } else if (size.y > size.z) {
            return 'y';
        } else {
            return 'z';
        }
    }

    *intersects(origin: Vector3, dir: Vector3): IterableIterator<Face> {
        if (!intersectsBounds(origin, dir, this.boundingBox[0], this.boundingBox[1])) {
            return;
        }

        yield* this.entries;

        if (this.left) {
            yield* this.left.intersects(origin, dir);
        }

        if (this.right) {
            yield* this.right.intersects(origin, dir);
        }
    }

    print(indent = 0) {
        const sep = "\t";
        const parts: string[] = [];

        parts.push(sep.repeat(indent) + `BoundingBox: (${this.boundingBox[0].toString()}, ${this.boundingBox[1].toString()})`);

        if (this.entries.length) {
            if (this.entries.length > 10) {
                parts.push(sep.repeat(indent) + "Entries: " + this.entries.length);
            } else {
                parts.push(sep.repeat(indent) + "Entries:");
                for (const entry of this.entries) {
                    parts.push(sep.repeat(indent + 1) + "-" + entry.name);
                }
            }
        }

        if (this.left) {
            parts.push(sep.repeat(indent) + "Left:");
            parts.push(...this.left.print(indent + 1));
        }

        if (this.right) {
            parts.push(sep.repeat(indent) + "Right:");
            parts.push(...this.right.print(indent + 1));
        }

        return parts;
    }
}
