declare class Material {
    texture?: ImageData;
    specular: number;
    illusive: number;
    alpha: number;
    refractiveIndex: number;
    glossyness: number;
    doubleSided: boolean;

    constructor(r: number, g: number, b: number, name?: string, alpha?: number);

    clone(): Material;
    getColorAt(face: Face, point: Vector3): [number, number, number];
}