declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    add(v: Vector3): Vector3;
    sub(v: Vector3): Vector3;
    mult(v: Vector3): Vector3;
    multScalar(n: number): Vector3;
    dot(v: Vector3): number;
    cross(v: Vector3): Vector3;
    angleTo(v: Vector3): number;
    norm(): Vector3;
    copy(v: Vector3): void;
    clone(): Vector3;
    neg(): Vector3;
    len(): number;
    lenSq(): number;
}