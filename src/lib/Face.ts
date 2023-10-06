import Material from "./Material";
import Vector3 from "./Vector3";

export default class Face {
    private static counter = 0;
    readonly name: string;

    constructor(
        public readonly u: Vector3,
        public readonly v: Vector3,
        public readonly w: Vector3,
        public readonly normal: Vector3,
        public readonly material?: Material,
        name?: string
    ) {
        this.name = (Face.counter++) + "_" + (name || "Face");
    };

    clone() {
        return new Face(
            this.u.clone(),
            this.v.clone(),
            this.w.clone(),
            this.normal,
            this.material,
            this.name + "_cloned"
        );
    }

    getBoundingBox(): [Vector3, Vector3] {
        return [
            new Vector3(Math.min(this.u.x, this.v.x, this.w.x), Math.min(this.u.y, this.v.y, this.w.y), Math.min(this.u.z, this.v.z, this.w.z)),
            new Vector3(Math.max(this.u.x, this.v.x, this.w.x), Math.max(this.u.y, this.v.y, this.w.y), Math.max(this.u.z, this.v.z, this.w.z))
        ];
    }

    translate(v: Vector3) {
        for (const s of this) {
            for (const d of 'xyz') {
                // @ts-ignore
                s[d] += v[d]; 
            }
        }
        return this;
    }

    *[Symbol.iterator]() {
        yield this.u;
        yield this.v;
        yield this.w;
    }
}