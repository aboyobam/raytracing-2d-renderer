import Face from "@/Face";
import Vector3 from "@/Vector3";
import Octree from "./Octree";
import intersectsBounds from "@/intersects-bounds";

type DoubleOcnode = [Ocnode, Ocnode];

export default class Ocnode {
    private children: DoubleOcnode[][];
    private readonly entries: Face[] = [];

    constructor(public readonly position: Vector3, public readonly size: number, private readonly depth: number = 0) {}

    add(face: Face) {
        // matches children + no children
        if (!this.children && this.depth < Octree.MAX_DEPTH) {
            const [min, max] = face.getBoundingBox();

            for (const x of [0, 1]) {
                const bx = this.position.x - this.size;
                if (min.x < (bx + this.size * x) || max.x > (bx + this.size * (x + 1))) {
                    continue;
                }

                for (const y of [0, 1]) {
                    const by = this.position.y - this.size;
                    if (min.y < (by + this.size * y) || max.y > (by + this.size * (y + 1))) {
                        continue;
                    }

                    for (const z of [0, 1]) {
                        const bz = this.position.z - this.size;
                        if (min.z < (bz + this.size * z) || max.z > (bz + this.size * (z + 1))) {
                            continue;
                        }

                        this.subdivide();
                        this.children[x][y][z].add(face);
                        return;
                    }
                }
            }
        }

        // has children
        for (const child of this.getAllChildren()) {
            if (child.fullFit(face)) {
                child.add(face);
                return;
            }
        }

        // it goes in here
        this.entries.push(face);
    }

    *intersects(origin: Vector3, dir: Vector3): IterableIterator<Face> {
        const scalarSize = Vector3.ONE.multScalar(this.size);
        if (!intersectsBounds(origin, dir, this.position.sub(scalarSize), this.position.add(scalarSize))) {
            return;
        }

        yield* this.entries;

        for (const child of this.getAllChildren()) {
            yield* child.intersects(origin, dir);
        }
    }

    private subdivide() {
        const children: DoubleOcnode[][] = [];
        for (const x of [0, 1]) {
            const row: DoubleOcnode[] = [];

            for (const y of [0, 1]) {
                const col: Partial<DoubleOcnode> = [];

                for (const z of [0, 1]) {
                    const newPos = this.position.add(new Vector3((x - 0.5) * this.size, (y - 0.5) * this.size, (z - 0.5) * this.size));
                    col.push(new Ocnode(newPos, this.size / 2, this.depth + 1));
                }

                row.push(col as DoubleOcnode);
            }

            children.push(row);
        }

        this.children = children;
    }

    private fullFit(face: Face) {
        const [min, max] = face.getBoundingBox();

        if (min.x < (this.position.x - this.size) || max.x > (this.position.x + this.size)) {
            return false;
        }

        if (min.y < (this.position.y - this.size) || max.y > (this.position.y + this.size)) {
            return false;
        }

        if (min.z < (this.position.z - this.size) || max.z > (this.position.z + this.size)) {
            return false;
        }

        return true;
    }

    private *getAllChildren(): IterableIterator<Ocnode> {
        if (!this.children) {
            return;
        }

        for (const row of this.children) {
            for (const col of row) {
                for (const entry of col) {
                    if (entry) {
                        yield entry;
                    }
                }
            }
        }
    }

    print(indent = 0) {
        const sep = "\t";
        const parts: string[] = [];
        
        parts.push(sep.repeat(indent) + `Position: (${this.position.x.toFixed(3)}, ${this.position.y.toFixed(3)}, ${this.position.z.toFixed(3)})`);
        parts.push(sep.repeat(indent) + "Size: " + this.size.toFixed(3));

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
        
        if (this.children) {
            parts.push(sep.repeat(indent) + "Children:");
            for (const child of this.getAllChildren()) {
                parts.push(...child.print(indent + 1));
            }
        }

        return parts;
    }
}