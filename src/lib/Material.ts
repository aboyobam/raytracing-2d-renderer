import Decimal from "decimal.js";
import Face from "./Face";
import Vector3 from "./Vector3";

export default class Material {
    static readonly all: Record<string, Material> = {};
    
    texture?: ImageData;
    specular: number = 0;

    static readonly NONE = new Material(127, 127, 127, 256, "none");

    constructor(public r = 256, public g = 256, public b = 256, public a = 256, public readonly name?: string) {
        if (name) {
            Material.all[name] = this;
        }
    };

    getColorAt(face: Face, point: Vector3) {
        if (!this.texture || !face.uvMap) {
            return [this.r, this.g, this.b];
        }

        const [a, b, c] = face;
        const v0 = b.sub(a);
        const v1 = c.sub(a);
        const v2 = point.sub(a);

        const d00 = v0.dot(v0);
        const d01 = v0.dot(v1);
        const d11 = v1.dot(v1);
        const d20 = v2.dot(v0);
        const d21 = v2.dot(v1);
        const denom = d00.mul(d11).sub(d01.mul(d01));

        const v = (d11.mul(d20).sub(d01.mul(d21))).div(denom);
        const w = (d00.mul(d21).sub(d01.mul(d20))).div(denom);
        const u = new Decimal(1).sub(v).sub(w);

        const interpolatedU = face.uvMap[0].x.mul(u).add(face.uvMap[1].x.mul(v)).add(face.uvMap[2].x.mul(w));
        const interpolatedV = face.uvMap[0].y.mul(u).add(face.uvMap[1].y.mul(v)).add(face.uvMap[2].y.mul(w));

        // Convert UV coordinates to pixel coordinates
        const pixelX = interpolatedU.mul(face.material.texture.width).floor();
        const pixelY = interpolatedV.mul(face.material.texture.height).floor();

        // Get pixel data
        const index = (pixelY.mul(face.material.texture.width).add(pixelX)).mul(4).round().toNumber();  // RGBA has 4 components
        return [
            face.material.texture.data[index],
            face.material.texture.data[index + 1],
            face.material.texture.data[index + 2]
        ];
    }
}