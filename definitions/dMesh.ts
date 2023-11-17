declare class Mesh {
    geometry: Geometry;
    material: Material;
    children: Mesh[];

    constructor(g: Geometry, m: Material);

    // angle in degrees
    rotate(axis: Vector3, angle: number): void; 
}