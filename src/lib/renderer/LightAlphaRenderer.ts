import { RendererConstructor } from "./Renderer";
import Raytracer, { Intersection } from "@/Raytracer";
import Light from "@/Light";
import Vector3 from "@/Vector3";
import Material from "@/Material";
import BaseRenderer from "./BaseRenderer";

class LightAlphaRenderer extends BaseRenderer {
    protected calulatePixel(origin: Vector3, dir: Vector3): [number, number, number, number] {
        const hits = this.rc.intersectOrder(origin, dir);
                
        if (!hits.length) {
            return;
        }

        const lightAlpha = Array(hits.length).fill(0);

        for (let index = 0; index < hits.length; index++) {
            const hit = hits[index];
            let lightStrength = 0;

            for (const light of this.scene.lights) {
                const lightDir = hit.point.sub(light.worldPosition);
                const lightHits = this.rc.intersectOrder(light.worldPosition, lightDir);

                let strength = 0;
                for (const lightHit of lightHits) {
                    const localStrength = (1 - strength) * hit.face.material.alpha;
                    strength += localStrength;
                    
                    if (lightHit.face === hit.face) {
                        const dist = light.worldPosition.sub(lightHit.point).len();
                        lightStrength = localStrength * light.intensity / Math.pow(1 + (dist / light.distance), light.decay);;
                        break;
                    }

                    if (strength > 0.999) {
                        break;
                    }
                }
            }

            lightAlpha[index] = lightStrength;
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

        const { r, g, b, alpha }: Material = colors.reduce((acc, [hit, s], i) => {
            const [r, g, b] = hit.face.material.getColorAt(hit.face, hit.point);
            const q = hit.angle / 180;
            acc.r += r * q * s * lightAlpha[i]; 
            acc.g += g * q * s * lightAlpha[i]; 
            acc.b += b * q * s * lightAlpha[i]; 
            acc.alpha += s * 255;
            return acc;
        }, new Material(0, 0, 0, null, 5));

        return [r, g, b, alpha];
    }
}

export default LightAlphaRenderer satisfies RendererConstructor;