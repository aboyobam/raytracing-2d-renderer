import { RendererConstructor } from "./Renderer";
import { Intersection } from "@/Raytracer";
import Vector3 from "@/Vector3";
import Material from "@/Material";
import BaseRenderer from "./BaseRenderer";

class AlphaRenderer extends BaseRenderer {
    protected calulatePixel(origin: Vector3, dir: Vector3): ColorLike {
        const hits = this.rc.intersectOrder(origin, dir);
                
        if (!hits.length) {
            return;
        }

        const colors: [Intersection, number][] = [];
        let strength = 0;
        for (const hit of hits) {
            const localStrength = (1 - strength) * hit.face.material.alpha;
            strength += localStrength;
            colors.push([hit, localStrength]);

            if (strength > 0.999) {
                break;
            }
        }

        const { r, g, b, alpha }: Material = colors.reduce((acc, [hit, s]) => {
            const [r, g, b] = hit.face.material.getColorAt(hit.face, hit.point);
            const q = hit.angle / 180;
            acc.r += r * q * s; 
            acc.g += g * q * s; 
            acc.b += b * q * s; 
            acc.alpha += s * 255;
            return acc;
        }, new Material(0, 0, 0, null, 0));

        return [r, g, b];
    }
}

export default AlphaRenderer satisfies RendererConstructor;