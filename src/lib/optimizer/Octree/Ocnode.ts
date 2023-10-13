import Decimal from "decimal.js";
import Face from "@/Face";
import Vector3 from "@/Vector3";
import Octree, { MeshAndFace } from "./Octree";
import Mesh from "@/Mesh";

type DoubleOcnode = [Ocnode, Ocnode];

export default class Ocnode {
    private children: DoubleOcnode[][];
    private readonly entries: MeshAndFace[] = [];

    constructor(public readonly position: Vector3, public readonly size: Decimal, private readonly depth: number = 0) {}

    add(mesh: Mesh, face: Face) {
        // matches children + no children
        if (!this.children && this.depth < Octree.MAX_DEPTH) {
            const [min, max] = face.getBoundingBox();

            for (const x of [0, 1]) {
                const bx = this.position.x.sub(this.size);
                if (min.x.lt(bx.add(this.size.mul(x))) || max.x.gt(bx.add(this.size.mul(x + 1)))) {
                    continue;
                }

                for (const y of [0, 1]) {
                    const by = this.position.y.sub(this.size);
                    if (min.y.lt(by.add(this.size.mul(y))) || max.y.gt(by.add(this.size.mul(y + 1)))) {
                        continue;
                    }

                    for (const z of [0, 1]) {
                        const bz = this.position.z.sub(this.size);
                        if (min.z.lt(bz.add(this.size.mul(z))) || max.z.gt(bz.add(this.size.mul(z + 1)))) {
                            continue;
                        }

                        this.subdivide();
                        this.children[x][y][z].add(mesh, face);
                        return;
                    }
                }
            }
        }

        // has children
        for (const child of this.getAllChildren()) {
            if (child.fullFit(face)) {
                child.add(mesh, face);
                return;
            }
        }

        // it goes in here
        this.entries.push([mesh, face]);
    }

    *intersects(origin: Vector3, dir: Vector3): IterableIterator<MeshAndFace> {
        let tMin = new Decimal(-Infinity);
        let tMax = new Decimal(Infinity);
    
        const bounds = [
            this.position.x.sub(this.size),
            this.position.x.add(this.size),
            this.position.y.sub(this.size),
            this.position.y.add(this.size),
            this.position.z.sub(this.size),
            this.position.z.add(this.size),
        ];
    
        const direction = ['x', 'y', 'z'] as const;

        for (let i = 0; i < direction.length; i++) {
            const localDir = direction[i];

            if (dir[localDir].abs().lt(Number.EPSILON)) {
                if (origin[localDir].lt(bounds[i * 2]) || origin[localDir].gt(bounds[i * 2 + 1])) {
                    return;
                }
            } else {
                let t1 = bounds[i * 2].sub(origin[localDir]).div(dir[localDir]);
                let t2 = bounds[i * 2 + 1].sub(origin[localDir]).div(dir[localDir]);
    
                if (t1.gt(t2)) {
                    const temp = t1;
                    t1 = t2;
                    t2 = temp;
                };
    
                tMin = t1.gt(tMin) ? t1 : tMin;
                tMax = t2.lt(tMax) ? t2 : tMax;
    
                if (tMin.gt(tMax)) {
                    return;
                }
            }
        }
    
        if (tMin.lt(0) && tMax.lt(0)) {
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
                    const newPos = this.position.add(new Vector3(this.size.mul(x - 0.5), this.size.mul(y - 0.5), this.size.mul(z - 0.5)));
                    col.push(new Ocnode(newPos, this.size.div(2), this.depth + 1));
                }

                row.push(col as DoubleOcnode);
            }

            children.push(row);
        }

        this.children = children;
    }

    private fullFit(face: Face) {
        const [min, max] = face.getBoundingBox();

        if (min.x.lt(this.position.x.sub(this.size)) || max.x.gt(this.position.x.add(this.size))) {
            return false;
        }

        if (min.y.lt(this.position.y.sub(this.size)) || max.y.gt(this.position.y.add(this.size))) {
            return false;
        }

        if (min.z.lt(this.position.z.sub(this.size)) || max.z.gt(this.position.z.add(this.size))) {
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
                    parts.push(sep.repeat(indent + 1) + "-" + entry[1].name);
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