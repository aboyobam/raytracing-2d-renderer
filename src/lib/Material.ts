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
        const denom = d00 * d11 - d01 * d01;

        const v = (d11 * d20 - d01 * d21) / denom;
        const w = (d00 * d21 - d01 * d20) / denom;
        const u = 1.0 - v - w;

        const interpolatedU = face.uvMap[0].x * u + face.uvMap[1].x * v + face.uvMap[2].x * w;
        const interpolatedV = face.uvMap[0].y * u + face.uvMap[1].y * v + face.uvMap[2].y * w;

        // Convert UV coordinates to pixel coordinates
        const pixelX = Math.floor(interpolatedU * face.material.texture.width);
        const pixelY = Math.floor(interpolatedV * face.material.texture.height);

        // Get pixel data
        const index = (pixelY * face.material.texture.width + pixelX) * 4;  // RGBA has 4 components
        return [
            face.material.texture.data[index],
            face.material.texture.data[index + 1],
            face.material.texture.data[index + 2]
        ];
    }
}