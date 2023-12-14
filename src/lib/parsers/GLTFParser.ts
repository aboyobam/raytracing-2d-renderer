import Camera from "@/Camera";
import Face from "@/Face";
import Geometry from "@/Geometry";
import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Scene from "@/Scene";
import Vector3 from "@/Vector3";
import rendererConfig from "@/rendererConfig";

export default class GLTFParser {
    static async parse(file: string) {
        const gltf: any = await fetch("/models/" + file).then(res => res.json());
    
        const scene = new Scene();
        const gltfScene = gltf.scenes[gltf.scene];

        for (const nodeIndex of gltfScene.nodes) {
            const gltfNode = gltf.nodes[nodeIndex];

            if ("mesh" in gltfNode) {
                const mesh = await GLTFParser.parseMesh(gltf, gltfNode);

                if (gltfNode.children?.length) {
                    for (const childIndex of gltfNode.children) {
                        const childNode = gltf.nodes[childIndex];
                        
                        if (typeof childNode.mesh === "number") {
                            const child = await GLTFParser.parseMesh(gltf, childNode);
                            mesh.add(child);
                        }
                    }
                }
                scene.add(mesh);

                continue;
            }

            if ("extensions" in gltfNode) {
                if (gltfNode.extensions.KHR_lights_punctual) {
                    const gltfLight = gltf.extensions.KHR_lights_punctual.lights[gltfNode.extensions.KHR_lights_punctual.light];

                    const { intensity, distance, decay } = gltfLight.extras || {};
                    if (typeof intensity == "number" && typeof distance === "number" && typeof decay === "number") {
                        const light = new Light(intensity, distance, decay);
                        light.position.set(gltfNode.translation[0], gltfNode.translation[1], gltfNode.translation[2]);
                        light.color = gltfLight.color;
                        scene.addLight(light);
                    }
                }
                continue;
            }

            if ("camera" in gltfNode) {
                const gltfCam = gltf.cameras[gltfNode.camera].perspective;
                const degFOV = 2 * gltfCam.yfov / Math.PI * 180;
                const cam = new Camera(degFOV, gltfCam.aspectRatio, gltfCam.znear);
                const [x, y, z] = gltfNode.translation;
                cam.position.set(x, y, z);

                rotate: {
                    const [qx, qy, qz, qw] = gltfNode.rotation;
            
                    const angleInRadians = 2 * Math.acos(qw);
                    const angleInDegrees = (angleInRadians * 180) / Math.PI;
                
                    const denominator = Math.sqrt(1 - qw * qw);
                    const axis = denominator !== 0 ? new Vector3(qx / denominator, qy / denominator, qz / denominator) : new Vector3(1, 0, 0);
                
                    const defaultLookDirection = new Vector3(0, 0, -1);
                    Mesh.applyRotation(axis, angleInDegrees, defaultLookDirection);
                    cam.target.copy(defaultLookDirection.norm());

                    const defaultUp = new Vector3(0, 1, 0);
                    Mesh.applyRotation(axis, angleInDegrees, defaultUp);
                    cam.up.copy(defaultUp.norm());
                }
            
                scene.cameras.push(cam);
            }
        }

        return scene;
    }

    private static async parseMesh(gltf: any, node: any): Promise<Mesh> {
        const gltfMesh = gltf.meshes[node.mesh];

        const [scaleX, scaleY, scaleZ] = node.scale || [1, 1, 1];

        gltf.buffers.forEach((gltfBuffer: any) => {
            const buffer = base64ToArrayBuffer(gltfBuffer.uri.split(",")[1]);
            gltfBuffer.buffer = buffer;
        });

        const faces: Face[] = [];

        for (const primitive of gltfMesh.primitives) {
            const uvAccessor = gltf.accessors[primitive.attributes.TEXCOORD_0];
            const uvView = uvAccessor && gltf.bufferViews[uvAccessor.bufferView];
            const uvBuffer = uvAccessor && gltf.buffers[uvView.buffer].buffer;
            const uvData = uvAccessor && new DataView(uvBuffer, uvView.byteOffset, uvView.byteLength);

            const uvs: Vector3[] = [];
            if (uvAccessor) {
                for (let i = 0; i < uvAccessor.count; i++) {
                    const u = uvData.getFloat32(i * 8, true);
                    const v = uvData.getFloat32(i * 8 + 4, true);
                    uvs.push(new Vector3(u, v));
                }
            }

            let material: Material;
            if (typeof primitive.material !== "undefined") {
                const gltfMaterial = gltf.materials[primitive.material];
                material = await GLTFParser.parseMaterial(gltf, gltfMaterial);
            }

            // positions
            const positionsAccessor = gltf.accessors[primitive.attributes.POSITION];
            const positionView = gltf.bufferViews[positionsAccessor.bufferView];
            const positionBuffer = gltf.buffers[positionView.buffer].buffer;
            const positionData = new DataView(positionBuffer, positionView.byteOffset, positionView.byteLength);
            
            // indecies
            const indicesAccessor = gltf.accessors[primitive.indices];
            const indeciesView = gltf.bufferViews[indicesAccessor.bufferView];
            const indeciesBuffer = gltf.buffers[indeciesView.buffer].buffer;
            const indeciesData = new DataView(indeciesBuffer, indeciesView.byteOffset, indeciesView.byteLength);
            
            // normals
            const normalsAccessor = gltf.accessors[primitive.attributes.NORMAL];
            const normalsView = gltf.bufferViews[normalsAccessor.bufferView];
            const normalsBuffer = gltf.buffers[normalsView.buffer].buffer;
            const normalsData = new DataView(normalsBuffer, normalsView.byteOffset, normalsView.byteLength);

            const normals: Vector3[] = [];
            for (let i = 0; i < normalsAccessor.count; i++) {
                const x = normalsData.getFloat32(i * 12, true);
                const y = normalsData.getFloat32(i * 12 + 4, true);
                const z = normalsData.getFloat32(i * 12 + 8, true);
                normals.push(new Vector3(x, y, z));
            }

            // Extract positions (vertices)
            const vertices: Vector3[] = [];
            for (let i = 0; i < positionsAccessor.count; i++) {
                const x = positionData.getFloat32(i * 12, true) * scaleX;
                const y = positionData.getFloat32(i * 12 + 4, true) * scaleY;
                const z = positionData.getFloat32(i * 12 + 8, true) * scaleZ;
                vertices.push(new Vector3(x, y, z));
            }

            // Extract indices
            const indices: number[] = [];
            const byteStride = indeciesView.byteStride || 2; // Defaulting to 2 bytes for UNSIGNED_SHORT
            for (let i = 0; i < indicesAccessor.count; i++) {
                const byteOffset = i * byteStride;
                const index = this.getIndexFromView(indeciesData, byteOffset, indicesAccessor.componentType);
                indices.push(index);
            }

            // Create faces using indices and vertices
            for (let i = 0; i < indices.length; i += 3) {
                const vertex1 = vertices[indices[i]];
                const vertex2 = vertices[indices[i + 1]];
                const vertex3 = vertices[indices[i + 2]];

                const normal1 = normals[indices[i]];
                const normal2 = normals[indices[i + 1]];
                const normal3 = normals[indices[i + 2]];

                const faceNormal = new Vector3(
                    (normal1.x + normal2.x + normal3.x) / 3,
                    (normal1.y + normal2.y + normal3.y) / 3,
                    (normal1.z + normal2.z + normal3.z) / 3
                );

                const face = new Face(vertex1, vertex2, vertex3, faceNormal, material);
                if (rendererConfig.shadeSmoothing) {
                    face.uN = normal1;
                    face.vN = normal2;
                    face.wN = normal3;
                }

                if (material && material.texture && uvAccessor) {
                    const uv1 = uvs[indices[i]];
                    const uv2 = uvs[indices[i + 1]];
                    const uv3 = uvs[indices[i + 2]];
                    face.uvMap = [uv1, uv2, uv3];
                }

                faces.push(face);
            }
        }
        
        const geo = new Geometry(faces);
        const material = Material.RED; // DUMMY
        const mesh = new Mesh(geo, material);

        if (node.translation) {
            mesh.position.set(node.translation[0], node.translation[1], node.translation[2]);
        }

        if (node.rotation) {
            const [x, y, z, w] = node.rotation;

            const angleInRadians = 2 * Math.acos(w);
            const angleInDegrees = (angleInRadians * 180) / Math.PI;
        
            const denominator = Math.sqrt(1 - w * w);
            const axis = denominator !== 0 ? new Vector3(x / denominator, y / denominator, z / denominator) : new Vector3(1, 0, 0); // Defaulting to the x-axis in case the quaternion is zero
        
            mesh.rotate(axis, angleInDegrees);
        }
        return mesh;
    }

    private static async parseMaterial(gltf: any, gltfMaterial: any): Promise<Material> {
        if (gltfMaterial.name in Material.all) {
            return Material.all[gltfMaterial.name];
        }

        let baseColor = [1.0, 1.0, 1.0, 1.0]; // Default to white
        let metallic = 1.0;
        let roughness = 1.0;
        const mat = new Material(0, 0, 0, gltfMaterial.name, 1);

        if (gltfMaterial.extras?.refractiveIndex) {
            mat.refractiveIndex = gltfMaterial.extras.refractiveIndex;
        }
    
        if (gltfMaterial.pbrMetallicRoughness) {
            if (gltfMaterial.pbrMetallicRoughness.baseColorFactor) {
                baseColor = gltfMaterial.pbrMetallicRoughness.baseColorFactor;
            }

            if (gltfMaterial.pbrMetallicRoughness.baseColorTexture) {
                const textureIndex = gltfMaterial.pbrMetallicRoughness.baseColorTexture.index;
                const textureInfo = gltf.textures[textureIndex];
                const imageInfo = gltf.images[textureInfo.source];
                const bufferViewInfo = gltf.bufferViews[imageInfo.bufferView];
                const buffer = gltf.buffers[bufferViewInfo.buffer].buffer;

                const imgData = new Uint8Array(buffer, bufferViewInfo.byteOffset, bufferViewInfo.byteLength);
                const blob = new Blob([imgData], { type: imageInfo.mimeType });
                
                const bmp = await createImageBitmap(blob);
                const offscreen = new OffscreenCanvas(bmp.width, bmp.height);
                const ctx = offscreen.getContext("2d");
                ctx.drawImage(bmp, 0, 0, offscreen.width, offscreen.height);
                mat.texture = ctx.getImageData(0, 0, offscreen.width, offscreen.height);;
            }

            metallic = gltfMaterial.pbrMetallicRoughness.metallicFactor || 0;
            roughness = gltfMaterial.pbrMetallicRoughness.roughnessFactor || 1.0;
        }
    
        const [r, g, b] = baseColor.map(b => b * 255);
        mat.r = r;
        mat.g = g;
        mat.b = b;
        mat.alpha = baseColor[3];
        mat.specular = [metallic, metallic, metallic];
        mat.illusive = metallic;
        return mat;
    }

    // Add the getIndexFromView method (as provided in previous messages)
    private static getIndexFromView(view: DataView, byteOffset: number, componentType: number): number {
        switch (componentType) {
            case 5120:  // BYTE
                return view.getInt8(byteOffset);
            case 5121:  // UNSIGNED_BYTE
                return view.getUint8(byteOffset);
            case 5122:  // SHORT
                return view.getInt16(byteOffset, true);
            case 5123:  // UNSIGNED_SHORT
                return view.getUint16(byteOffset, true);
            case 5125:  // UNSIGNED_INT
                return view.getUint32(byteOffset, true);
            default:
                throw new Error(`Unsupported componentType: ${componentType}`);
        }
    }
}

function base64ToArrayBuffer(base64: string) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}