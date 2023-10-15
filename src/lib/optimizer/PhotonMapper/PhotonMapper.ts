import Scene from "@/Scene";
import PhotonTree from "./PhotonTree";
import MonteCarloEstimator from "@/renderer/MonteCarloEstimator";
import Raytracer from "@/Raytracer";
import Vector3 from "@/Vector3";
import Photon from "./Photon";
import Light from "@/Light";

interface PhotonMapperConfig {
    maxSize: number;
    samples: number;
    maxDepth: number;
}

export default class PhotonMapper {
    private readonly tree: PhotonTree;

    constructor(private readonly scene: Scene, private readonly rc: Raytracer, private readonly config: PhotonMapperConfig) {
        this.tree = new PhotonTree(scene, config.maxSize);
        this.build();
    }

    get(point: Vector3, delta: number) {
        return this.tree.get(point, delta);
    }

    private build() {
        const monteCarlo = new MonteCarloEstimator(this.config.samples);
        
        for (const light of this.scene.lights) {
            for (const dir of monteCarlo) {
                for (const photon of this.trackLight(light, light.worldPosition, dir)) {
                    this.tree.add(photon);
                }
            }
        }
    }

    private *trackLight(light: Light, from: Vector3, dir: Vector3, strength = 1, distance = 0, depth = 0): Iterable<Photon> {
        const [hit] = this.rc.intersectOrder(from, dir);
        if (!hit) {
            return;
        }

        if (depth > 0) {
            const intensity = strength * light.intensity / Math.pow(1 + ((distance + hit.distance) / light.distance), light.decay);
            yield new Photon(hit.point, intensity);
        }

        if (!hit.face.material.illusive) {
            return;
        }

        if (depth < this.config.maxDepth) {
            yield* this.trackLight(
                light, 
                hit.point,
                hit.outDir,
                strength * hit.face.material.illusive,
                distance + hit.distance,
                depth + 1
            );
        }
    }
}