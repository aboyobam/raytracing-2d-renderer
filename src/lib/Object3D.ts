import Vector3 from "./Vector3";

export default class Object3D {
    parent?: Object3D;

    public readonly position = new Vector3(0, 0, 0);

    get worldPosition(): Vector3 {
        if (this.parent) {
            return this.parent.worldPosition.add(this.position);
        } else {
            return this.position;
        }
    }
} 