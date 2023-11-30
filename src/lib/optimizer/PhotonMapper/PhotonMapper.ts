import Scene from "@/Scene";
import Raytracer from "@/Raytracer";
import Vector3 from "@/Vector3";
import Photon from "./Photon";
import Light from "@/Light";
import magicSpiral from "./magicSpiral";
import intersectsBounds from "@/intersects-bounds";

interface PhotonMapperConfig {
    maxSize: number;
    maxDepth: number;
    hasAlpha: boolean;
    gridGap: number;
    strengthDivider: number;
    offset?: number;
    skip?: number;
}

export default class PhotonMapper {
    readonly photons: Photon[] = [];

    constructor(private readonly scene: Scene, private readonly rc: Raytracer, private readonly config: PhotonMapperConfig) {
        this.build();
    }

    private build() {
        for (const light of this.scene.lights) {
            if (light.ignoreIndirect) {
                continue;
            }

            const pos = light.worldPosition;
            for (const dir of magicSpiral(this.config.gridGap * 1_000_000, this.config.offset, this.config.skip)) {
                if (!intersectsBounds(pos, dir, ...this.scene.boundingBox)) {
                    continue;
                }

                const photonIter = this.trackLight(light, pos, dir, {
                    backfaces: "none",
                    depth: 0,
                    distance: 0,
                    strength: 1
                });

                for (const photon of photonIter) {
                    this.photons.push(photon);
                }
            }
        }
    }

    private *trackLight(light: Light, origin: Vector3, dir: Vector3, opts: TracklightConfig): Iterable<Photon> {
        if (opts.strength < 0.001) {
            return;
        }

        const [hit] = this.rc.intersectOrder(origin, dir, opts.backfaces);

        if (!hit) {
            return;
        }

        const distance = hit.distance + opts.distance;
        
        if (opts.depth > 0) {
            if (opts.backfaces == "none") {
                const distStrength = light.intensity / Math.pow(1 + (distance / light.distance), light.decay);
                const totalStrength = (opts.strength * distStrength) / this.config.strengthDivider * hit.face.material.alpha;
                
                if (totalStrength > 0.001) {
                    yield new Photon(hit.point, [
                        light.color[0] * totalStrength,
                        light.color[1] * totalStrength,
                        light.color[2] * totalStrength
                    ]);
                }
            }
        }

        if (opts.depth < this.config.maxDepth) {

            // alpha
            if (hit.face.material.alpha < 1) {
                const entering = opts.backfaces == "none";
                const n1 = entering ? 1.0 : hit.face.material.refractiveIndex;
                const n2 = entering ? hit.face.material.refractiveIndex : 1.0;
                const normal = entering ? hit.normal : hit.normal.neg();
                const incidenceDir = dir.neg();
                const cosineThetaI = incidenceDir.dot(normal);
                const sin2ThetaI = Math.max(0, 1 - cosineThetaI * cosineThetaI);
                const sin2ThetaT = (n1 / n2) * (n1 / n2) * sin2ThetaI;
    
                if (sin2ThetaT < 1) {
                    const cosineThetaT = Math.sqrt(1 - sin2ThetaT);
                    const alphaDir = incidenceDir.multScalar(n1 / n2).sub(normal.multScalar((n1 / n2) * cosineThetaI + cosineThetaT));
                    yield* this.trackLight(light, hit.point, alphaDir, {
                        distance,
                        backfaces: entering ? "only" : "none",
                        depth: opts.depth + 1,
                        strength: opts.strength * (1 - hit.face.material.alpha)
                    });
                }
            }

            // illusive
            if (hit.face.material.illusive > 0) {
                yield* this.trackLight(light, hit.point, hit.outDir, {
                    distance,
                    backfaces: "none",
                    depth: opts.depth + 1,
                    strength: opts.strength * hit.face.material.illusive
                });
            }
        }
    }

    /*private build() {
        let offset = this.config.offset;

        for (const mesh of this.scene) {
            for (const face of mesh.geometry.faces) {
                if (!face.material.illusive) {
                    continue;
                }

                if ((offset++ % this.config.skip) !== 0) {
                    continue;
                }

                for (const light of this.scene.lights) {
                    for (const dir of createScanSamples(face, light.position, this.config.gridGap)) {
                        const [hit] = this.rc.intersectOrder(light.position, dir);

                        if (hit?.face !== face) {
                            continue;
                        }

                        const angleStrength = Math.max(dir.angleTo(hit.normal.neg()), 0);
                        for (const photon of this.trackLight(light, hit.point, hit.outDir, angleStrength * face.material.specular * face.material.alpha, hit.distance)) {
                            this.tree.add(photon);
                        }
                    }
                }
            }
        }
    }

    private *trackLight(light: Light, from: Vector3, dir: Vector3, strength: number, distance: number, depth = 0): Iterable<Photon> {
        const [hit] = this.rc.intersectOrder(from, dir);
        if (!hit) {
            return;
        }

        const angleStrength = Math.max(dir.angleTo(hit.normal.neg()), 0);
        const intensity = angleStrength * strength * light.intensity / Math.pow(1 + ((distance + hit.distance) / light.distance), light.decay);
        yield new Photon(hit.point, [
            light.color[0] * intensity / this.config.strengthDivider,
            light.color[1] * intensity / this.config.strengthDivider,
            light.color[2] * intensity / this.config.strengthDivider
        ]);

        if (depth < this.config.maxDepth) {
            if (hit.face.material.illusive) {
                yield* this.trackLight(
                    light, 
                    hit.point,
                    hit.outDir,
                    strength * hit.face.material.illusive * hit.face.material.alpha,
                    distance + hit.distance,
                    depth + 1
                );
            }

            if (this.config.hasAlpha && hit.face.material.alpha < 1) {
                const n1 = 1;
                const n2 = hit.face.material.refractiveIndex;
                const normal = hit.normal;
                const incidenceDir = dir.neg();
                const cosineThetaI = incidenceDir.dot(normal);
                const sin2ThetaI = Math.max(0, 1 - cosineThetaI * cosineThetaI);
                const sin2ThetaT = (n1 / n2) * (n1 / n2) * sin2ThetaI;
    
                if (sin2ThetaT < 1) {
                    const cosineThetaT = Math.sqrt(1 - sin2ThetaT);
                    const refractedDirection = incidenceDir.multScalar(n1 / n2).sub(normal.multScalar((n1 / n2) * cosineThetaI + cosineThetaT));
               
                    yield* this.trackLight(
                        light, 
                        hit.point,
                        refractedDirection,
                        strength * (1 - hit.face.material.illusive) * (1 - hit.face.material.alpha),
                        distance + hit.distance,
                        depth + 1
                    );
                }
            }
        }
    }*/
}

interface TracklightConfig {
    distance: number;
    strength: number;
    depth: number;
    backfaces: "none" | "only";
}