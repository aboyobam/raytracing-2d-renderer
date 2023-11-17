declare class Camera {
    position: Vector3;
    target: Vector3;
    up: Vector3;
    fov: number;
    aspectRatio: number;
    neat: number;

    constructor(fov: number, aspectRatio: number, near: number);

    lookAt(v: Vector3): void;
}