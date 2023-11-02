import Face from "./Face";
import Vector3 from "./Vector3";
import serializable from "./serializable";

@serializable("Material")
export default class Material {
    static readonly all: Record<string, Material> = {};

    static get WHITE() {
        return Material.all["white"] || new Material(255, 255, 255, "white");
    }
    static get RED() { 
        return Material.all["red"] || new Material(255, 0, 0, "red");
    }
    static get GREEN() { 
        return Material.all["green"] || new Material(0, 255, 0, "green");
    }
    static get BLUE() { 
        return Material.all["blue"] || new Material(0, 0, 255, "blue");
    }
    static get NONE() { 
        return Material.all["none"] || new Material(127, 127, 127, "none");
    }

    private static materialCounter = 0;
    
    texture?: ImageData;
    specular: number = 0;
    illusive: number = 0;
    alpha: number = 1;
    refractiveIndex = 1;
    doubleSided: boolean;

    constructor(public r = 255, public g = 255, public b = 255, public readonly name?: string, alpha?: number) {
        if (!this.name) {
            this.name = "Material.auto." + Material.materialCounter++;
        }

        Material.all[this.name] = this;

        if (typeof alpha === "number") {
            this.alpha = alpha;
        }
    };

    getColorAt(face: Face, point: Vector3) {
        if (!this.texture || !face.uvMap) {
            return [this.r, this.g, this.b] as const;
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

        const pixelX = Math.floor(interpolatedU * face.material.texture.width);
        const pixelY = Math.floor(interpolatedV * face.material.texture.height);

        const index = (pixelY * face.material.texture.width + pixelX) * 4;
        return [
            face.material.texture.data[index],
            face.material.texture.data[index + 1],
            face.material.texture.data[index + 2]
        ] as const;
    }

    clone() {
        const newMat = new Material(this.r, this.g, this.b, this.name + "_cloned");
        newMat.specular = this.specular;
        newMat.texture = this.texture;
        return newMat;
    }
}