import qSqrt from "./qSqrt";
import serializable from "./serializable";

@serializable("Vector3")
export default class Vector3 {
    static get ZERO() {
        return new Vector3();
    }

    static get ONE() {
        return new Vector3(1, 1, 1);
    }

    static midpoint(a: Vector3, b: Vector3): Vector3 {
        return a.add(b).multScalar(1 / 2);
    }

    static min(...vertecies: Vector3[]): Vector3 {
        return new Vector3(
            Math.min(...vertecies.map(v => v.x)),
            Math.min(...vertecies.map(v => v.y)),
            Math.min(...vertecies.map(v => v.z))
        );
    }

    static max(...vertecies: Vector3[]): Vector3 {
        return new Vector3(
            Math.max(...vertecies.map(v => v.x)),
            Math.max(...vertecies.map(v => v.y)),
            Math.max(...vertecies.map(v => v.z))
        );
    }
    
    constructor(public x: number = 0, public y: number = 0, public z: number = 0) {};

    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v: Vector3) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
    }

    neg() {
        return this.multScalar(-1);
    }

    add(v: Vector3) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v: Vector3) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }


    mult(v: Vector3) {
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    multScalar(s: number) {
        return new Vector3(this.x * s, this.y * s, this.z * s);
    }

    lenSq() {
        return this.x ** 2 + this.y ** 2 + this.z ** 2;
    }

    len() {
        return Math.sqrt(this.lenSq());
    }

    dot(v: Vector3) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    angleTo(v: Vector3) {
        return this.dot(v) / (this.len() * v.len());
    }
    
    cross(v: Vector3) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        return new Vector3(x, y, z);
    }

    norm() {
        /*const length = this.len();
        if (length === 0) return new Vector3();

        if (length === 1) {
            return this;
        }
        
        return new Vector3(this.x / length, this.y / length, this.z / length);*/
        const mul = qSqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
        return this.clone().multScalar(mul);
    }

    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
        yield this.z;
    }

    pretty(fixed = 3) {
        return `Vector3(x = ${this.x.toFixed(fixed)}, y = ${this.y.toFixed(fixed)}, z = ${this.z.toFixed(fixed)})`;
    }
}