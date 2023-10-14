import { RendererConstructor } from "./Renderer";
import Raytracer, { Intersection } from "@/Raytracer";
import Light from "@/Light";
import Vector3 from "@/Vector3";
import Material from "@/Material";
import BaseRenderer from "./BaseRenderer";

class AlphaRenderer extends BaseRenderer {
    protected calulatePixel(origin: Vector3, dir: Vector3): [number, number, number, number] {
        const hits = this.rc.intersectOrder(origin, dir);
                
        if (!hits.length) {
            return;
        }

        const colors: [Intersection, number][] = [];
        let strength = 0;
        for (const hit of hits) {
            const localAlpha = hit.face.material.a / 255;
            const localStrength = (1 - strength) * localAlpha;
            strength += localStrength;
            colors.push([hit, localStrength]);

            if (strength > 0.999) {
                break;
            }
        }

        const { r, g, b, a }: Material = colors.reduce((acc, [hit, s]) => {
            const [r, g, b] = hit.face.material.getColorAt(hit.face, hit.point);
            const q = hit.angle / 180;
            acc.r += r * q * s; 
            acc.g += g * q * s; 
            acc.b += b * q * s; 
            acc.a += s * 255;
            return acc;
        }, new Material(0, 0, 0, 0));

        return [r, g, b, a];
    }
}

export default AlphaRenderer satisfies RendererConstructor;