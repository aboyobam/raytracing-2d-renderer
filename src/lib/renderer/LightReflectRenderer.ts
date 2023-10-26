import { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { LightReflectRendererSetup } from "@/config";
import { Intersection } from "@/Raytracer";

class LightReflectRenderer extends BaseRenderer {
    declare protected readonly localConfig: LightReflectRendererSetup;
    static readonly usesPhotonMapper = true;

    protected calulatePixel(origin: Vector3, dir: Vector3, depth = 0): ColorLike {
        const [hit] = this.rc.intersectOrder(origin, dir);

        if (!hit) {
            return;
        }

        const lightStrength = this.calculateLight(hit);

        const q = hit.angle / 180 * lightStrength;
        const [br, bg, bb] = hit.face.material.getColorAt(hit.face, hit.point);
        const baseColor: ColorLike = [br * q, bg * q, bb * q];

        if (depth < this.localConfig.maxReflectionDepth) {
            if (hit.face.material.specular) {
                const newStrengh = hit.face.material.specular;
                const oldStrength = 1 - newStrengh;
                
                const target = this.calulatePixel(hit.point, hit.outDir, depth + 1);

                let nr: number, ng: number, nb: number;
                if (target) {
                    [nr, ng, nb] = target;
                } else {
                    nr = ng = nb = 255;
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

    private calculateLight(hit: Intersection): number {
        let lightStrength = 0;

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
            
            const angleStrength = lightDir.angleTo(hit.face.normal) / Math.PI;
            lightStrength += angleStrength * light.intensity / Math.pow(1 + (lightHit.distance / light.distance), light.decay);
        }
        

        // indirect lumination
        if (this.localConfig.indirectIllumination) {
            const delta = this.localConfig.indirectIlluminationDelta;
            const photons = Array.from(LightReflectRenderer.photonMapper.get(hit.point, delta));
            if (photons.length) {
                const indirects = photons.map((p) => {
                    const angleStrength = p.position.angleTo(hit.face.normal.neg()) / Math.PI;
                    const lengthStrength = delta / (delta + hit.point.sub(p.position).len());
                    return p.intensity * angleStrength * lengthStrength;
                });
                const indirect = indirects.reduce((acc, s) => acc + s, 0) / this.localConfig.indirectIlluminationDivider;
                lightStrength += indirect;
                
            }
        }

        return lightStrength;
    }
}

export type TLightReflectRenderer = LightReflectRenderer;

export default LightReflectRenderer satisfies RendererConstructor;