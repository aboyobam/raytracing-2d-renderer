declare class Scene {
    readonly meshes: Mesh[];
    readonly boundingBox: [Vector3, Vector3];
    readonly lights: Light[];
    readonly cameras: Camera[];

    constructor();
    add(...meshes: Mesh[]): void;
    addLight(light: Light): void;
}