import { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { AllRendererSetup } from "@/config";
import { Intersection } from "@/Raytracer";
import rendererConfig from "@/rendererConfig";

class AllRenderer extends BaseRenderer {
    declare protected readonly localConfig: AllRendererSetup;
    static readonly usesPhotonMapper = true;

    protected calulatePixel(origin: Vector3, dir: Vector3, depth = 0, backface: "none" | "only" | "both" = "none"): ColorLike {
        const [hit] = this.rc.intersectOrder(origin, dir, backface);

        if (!hit) {
            return;
        }

        const entering = dir.dot(hit.normal) < 0;
        const [lightStrength, gloss]: [ColorLike, ColorLike] = entering ? this.calculateLight(hit) : ([[0, 0, 0], [0, 0, 0]]);
        const [qr, qg, qb] = lightStrength;
        const [br, bg, bb] = hit.face.material.getColorAt(hit.face, hit.point);

        const baseColor: ColorLike = [br * qr + gloss[0], bg * qg + gloss[1], bb * qb + gloss[2]];

        if (depth < this.localConfig.maxReflectionDepth) {
            const newStrengh = hit.face.material.specular;
            const oldStrength: ColorLike = [1 - newStrengh[0], 1 - newStrengh[1], 1 - newStrengh[2]];
            const oldAlpha = hit.face.material.alpha;
            const newAlpha = 1 - oldAlpha;

            let refractedDirection = null;

            if (newAlpha) {
                const n1 = entering ? 1.0 : hit.face.material.refractiveIndex;
                const n2 = entering ? hit.face.material.refractiveIndex : 1.0;
                const normal = entering ? hit.normal : hit.normal.neg();
                const incidenceDir = dir.neg();
                const cosineThetaI = incidenceDir.dot(normal);
                const sin2ThetaI = Math.max(0, 1 - cosineThetaI * cosineThetaI);
                const sin2ThetaT = (n1 / n2) * (n1 / n2) * sin2ThetaI;
    
                if (sin2ThetaT < 1) {
                    const cosineThetaT = Math.sqrt(1 - sin2ThetaT);
                    refractedDirection = incidenceDir.multScalar(n1 / n2).sub(normal.multScalar((n1 / n2) * cosineThetaI + cosineThetaT));
                }
            }

            const specularTarget = entering && (newStrengh[0] > 0 && newStrengh[1] > 0 && newStrengh[2] > 0) && this.calulatePixel(hit.point, hit.outDir, depth + 1);
            const alphaTarget = refractedDirection && this.calulatePixel(hit.point, refractedDirection, depth + 1, backface == "none" ? "only" : "none");

            const [nr, ng, nb] = specularTarget || Array(3).fill(240);
            const [ar, ag, ab] = alphaTarget || Array(3).fill(240);

            return [
                (baseColor[0] * oldStrength[0] * oldAlpha) + (nr * newStrengh[0]) + (ar * newAlpha),
                (baseColor[1] * oldStrength[1] * oldAlpha) + (ng * newStrengh[1]) + (ag * newAlpha),  
                (baseColor[2] * oldStrength[2] * oldAlpha) + (nb * newStrengh[2]) + (ab * newAlpha)
            ];
        }

        return baseColor;
    }

    private calculateLight(hit: Intersection): [ColorLike, ColorLike] {
        const lightStrength: ColorLike = [hit.face.material.ambient[0], hit.face.material.ambient[1], hit.face.material.ambient[2]];
        const gloss: ColorLike = [0, 0, 0];

        // direct lumination
        for (const light of this.scene.lights) {
            const lightDir = hit.point.sub(light.worldPosition).norm();
            const [lightHit] = this.rc.intersectOrder(light.worldPosition, lightDir);

            if (!lightHit || lightHit.face !== hit.face) {
                continue;
            }

            // gloss
            if (hit.face.material.glossyness) {
                const cos = hit.outDir.angleTo(lightDir) ** hit.face.material.glossyness;
                gloss[0] += cos * light.color[0] * 100;
                gloss[1] += cos * light.color[1] * 100;
                gloss[2] += cos * light.color[2] * 100;
            }
            
            const angleStrength = Math.max(lightDir.angleTo(lightHit.normal.neg()), 0);
            const strength = angleStrength * light.intensity / Math.pow(1 + (lightHit.distance / light.distance), light.decay);
            lightStrength[0] += strength * light.color[0];
            lightStrength[1] += strength * light.color[1];
            lightStrength[2] += strength * light.color[2];
        }

        // indirect lumination
        if (rendererConfig.photonMapperSetup.enabled) {
            const delta = rendererConfig.photonMapperSetup.delta;
            const photons = Array.from(AllRenderer.photonTree.get(hit.point, delta));
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
                
                const sqrtLen = Math.sqrt(photons.length);
                lightStrength[0] += indirect[0] / sqrtLen;
                lightStrength[1] += indirect[1] / sqrtLen;
                lightStrength[2] += indirect[2] / sqrtLen;
            }
        }

        return [lightStrength, gloss];
    }
}

export type TLightReflectRenderer = AllRenderer;

export default AllRenderer satisfies RendererConstructor;