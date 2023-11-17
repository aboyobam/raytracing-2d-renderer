declare class Face {
    uN: Vector3;
    vN: Vector3;
    wN: Vector3;
    uvMap: Readonly<[Vector3, Vector3, Vector3]>;

    constructor(u: Vector3, v: Vector3, w: Vector3, normal: Vector3, material?: Material, name?: string);

    clone(): Face;
    getBoundingBox(): [Vector3, Vector3];
    translate(v: Vector3): void;
}