import Material from "./Material";
import Vector3 from "./Vector3";

export default class Face {
    private static counter = 0;
    private boundingBox: [Vector3, Vector3];
    readonly name: string;

    uvMap: Readonly<[Vector3, Vector3, Vector3]>;
    private _uvNormals: [number, number, number];

    constructor(
        public u: Vector3,
        public v: Vector3,
        public w: Vector3,
        public readonly normal: Vector3,
        public material?: Material,
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
        if (this.boundingBox) {
            return this.boundingBox;
        }

        this.boundingBox = [
            Vector3.min(...this),
            Vector3.max(...this)
        ];

        return this.boundingBox;
    }

    translate(v: Vector3) {
        this.u = this.u.add(v);
        this.v = this.v.add(v);
        this.w = this.w.add(v);

        this.boundingBox = null;

        return this;
    }

    *[Symbol.iterator]() {
        yield this.u;
        yield this.v;
        yield this.w;
    }
}