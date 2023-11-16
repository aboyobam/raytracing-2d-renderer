import { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { LightReflectRendererSetup } from "@/config";
import { Intersection } from "@/Raytracer";
import rendererConfig from "@/rendererConfig";

class LightReflectRenderer extends BaseRenderer {
    declare protected readonly localConfig: LightReflectRendererSetup;
    static readonly usesPhotonMapper = true;

    protected calulatePixel(origin: Vector3, dir: Vector3, depth = 0): ColorLike {
        const [hit] = this.rc.intersectOrder(origin, dir);

        if (!hit) {
            return;
        }

        const [qr, qg, qb] = this.calculateLight(hit);
        const [br, bg, bb] = hit.face.material.getColorAt(hit.face, hit.point);
        const baseColor: ColorLike = [br * qr, bg * qg, bb * qb];

        if (depth < this.localConfig.maxReflectionDepth) {
            if (hit.face.material.specular) {
                const newStrengh = hit.face.material.specular;
                const oldStrength = 1 - newStrengh;
                
                const target = this.calulatePixel(hit.point, hit.outDir, depth + 1);

                let nr: number, ng: number, nb: number;
                if (target) {
                    [nr, ng, nb] = target;
                } else {
                    nr = 0.53 * 255;
                    ng = 0.81 * 255;
                    nb = 0.92 * 255;
                }

                return [
                    baseColor[0] * oldStrength + nr * newStrengh,
                    baseColor[1] * oldStrength + ng * newStrengh,  
                    baseColor[2] * oldStrength + nb * newStrengh                    
                ];
            }
        }

        return baseColor;
    }

    private calculateLight(hit: Intersection): ColorLike {
        const lightStrength: ColorLike = [0.2, 0.2, 0.2];

        // direct lumination
        for (const light of this.scene.lights) {
            const lightDir = hit.point.sub(light.worldPosition).norm();
            const [lightHit, ...rest] = this.rc.intersectOrder(light.worldPosition, lightDir);

            if (!lightHit) {
                continue;
            }

            if (lightHit.face !== hit.face) {
                let foundElse = false;
                
                for (const other of rest) {
                    if ((other.distance - lightHit.distance) > this.localConfig.lightInpercisionEpsilon) {
                        break;
                    }
                    
                    if (other.face === hit.face) {
                        foundElse = true;
                        break;
                    }
                }

                if (!foundElse) {
                    continue;
                }
            }
            
            const angleStrength = Math.max(lightDir.angleTo(lightHit.normal.neg()), 0);
            const strength = angleStrength * light.intensity / Math.pow(1 + (lightHit.distance / light.distance), light.decay);
            lightStrength[0] += strength * light.color[0];
            lightStrength[1] += strength * light.color[1];
            lightStrength[2] += strength * light.color[2];
        }
        

        if (rendererConfig.photonMapperSetup.enabled) {
            const delta = rendererConfig.photonMapperSetup.delta;
            const photons = Array.from(LightReflectRenderer.photonTree.get(hit.point, delta));
            if (photons.length) {
                const indirects = photons.map((p) => {
                    const lengthStrength = delta / (delta + hit.point.sub(p.position).len());
                    return p.color.map(c => c * lengthStrength) as ColorLike;
                });
                const indirect = indirects.reduce((acc, s) => {
                    acc[0] += s[0];
                    acc[1] += s[1];
                    acc[2] += s[2];
                    return acc;
                }, [0, 0, 0] satisfies ColorLike);
                
                lightStrength[0] += indirect[0];
                lightStrength[1] += indirect[1];
                lightStrength[2] += indirect[2];
            }
        }

        return lightStrength;
    }
}

export type TLightReflectRenderer = LightReflectRenderer;

export default LightReflectRenderer satisfies RendererConstructor;