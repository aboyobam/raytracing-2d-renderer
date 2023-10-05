import Material from "./Material";
import Vector3 from "./Vector3";

export default class Face {
    constructor(
        public readonly u: Vector3,
        public readonly v: Vector3,
        public readonly w: Vector3,
        public readonly normal: Vector3,
        public readonly material?: Material
    ) {};

    clone() {
        return new Face(
            this.u.clone(),
            this.v.clone(),
            this.w.clone(),
            this.normal,
            this.material
        );
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