import Vector3 from "./Vector3";

export default class Camera {
    public readonly position = new Vector3(0, 0, 0);
    public readonly target = new Vector3(0, 0, 0);
    public readonly up = new Vector3(0, 1, 0);

    constructor(public fov: number, public aspectRatio: number, public near: number) {}
}