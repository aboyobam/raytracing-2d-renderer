import { RendererConstructor } from "./Renderer";
import Vector3 from "@/Vector3";
import BaseRenderer from "./BaseRenderer";
import { LightReflectRendererSetup } from "@/config";
import Face from "@/Face";

class LightReflectRenderer extends BaseRenderer {
    declare protected readonly localConfig: LightReflectRendererSetup;

    private reflectiveFaces: Face[];

    protected beforeRender(): void {
        this.reflectiveFaces = [];

        for (const mesh of this.scene) {
            for (const face of mesh.geometry.faces) {
                if (face.material.specular) {
                    this.reflectiveFaces.push(face);
                }
            }
        }
    }

    protected calulatePixel(origin: Vector3, dir: Vector3, lightStrength = 0, depth = 0): [number, number, number, number] {
        const [hit] = this.rc.intersectOrder(origin, dir);

        if (!hit) {
            return;
        }

        /*for (const light of this.scene.lights) {
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
            
            lightStrength += light.intensity / Math.pow(1 + (lightHit.distance / light.distance), light.decay);
            lightStrength += this.calcLight(hit.point);
        }*/

        const localLight = this.calcLight(hit.point);
        lightStrength += localLight;

        const q = (hit.angle / 180) * lightStrength;
        const [br, bg, bb] = hit.face.material.getColorAt(hit.face, hit.point);
        const baseColor = [br * q, bg * q, bb * q, 255] as [number, number, number, number];

        if (depth < this.localConfig.maxReflectionDepth) {
            if (hit.face.material.specular) {
                const newStrengh = hit.face.material.specular;
                const oldStrength = 1 - newStrengh;
                
                const target = this.calulatePixel(hit.point, hit.outDir, lightStrength, depth + 1);

                let nr: number, ng: number, nb: number;
                if (target) {
                    [nr, ng, nb] = target;
                } else {
                    nr = ng = nb = 255;
                }

                return [
                    baseColor[0] * oldStrength + nr * newStrengh,
                    baseColor[1] * oldStrength + ng * newStrengh,  
                    baseColor[2] * oldStrength + nb * newStrengh,
                    255
                ];
            }
        }

        return baseColor;
    }

    private findReflectivePointOnFace(from: Vector3, to: Vector3, face: Face): Vector3 {
        const dir = to.sub(from);
        const r = dir.sub(face.normal.multScalar(2 * dir.dot(face.normal)));
        return from.sub(r);
    }

    private calcLight(point: Vector3, origin: Vector3 = point, strength = 1, distance = 0, depth = 0): number {
        let totalIllumination = 0;
    
        // Direct lighting calculation
        for (const light of this.scene.lights) {
            const dirToLight = light.worldPosition.sub(point);
            const hits = this.rc.intersectOrder(point, dirToLight.norm());
    
            if (hits.length === 0) {
                const dist = distance + dirToLight.len();
                totalIllumination += strength * light.intensity / Math.pow(1 + (dist / light.distance), light.decay);
            }
        }
    
        // Indirect lighting from reflections
        if (depth < this.localConfig.maxLightBounce) {
            for (const face of this.reflectiveFaces) {
                // Find the reflection point on this face that would direct light towards our point
                const reflectionPoint = this.findReflectivePointOnFace(point, origin, face);
        
                if (reflectionPoint) {
                    // Check if there's a direct path from the reflection point on the face to our original point
                    const dirToReflection = reflectionPoint.sub(point);
                    const hits = this.rc.intersectOrder(point, dirToReflection.norm());
        
                    if (hits.length === 0) {
                        // No obstructions or the first hit is the reflection point on the face
                        totalIllumination += this.calcLight(
                            reflectionPoint,
                            point,
                            strength * face.material.specular,
                            distance + dirToReflection.len(),
                            depth + 1
                        ); // Recursive call
                    }
                }
            }
        }
    
        return totalIllumination;
    }
}

export default LightReflectRenderer satisfies RendererConstructor;