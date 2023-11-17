declare class Geometry {
    faces: Face[];

    constructor(faces: Face[]);

    getBoundingBox(): [Vector3, Vector3];
}