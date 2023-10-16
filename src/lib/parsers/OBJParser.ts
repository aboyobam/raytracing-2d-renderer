import Face from "@/Face";
import Geometry from "@/Geometry";
import Material from "@/Material";
import Vector3 from "@/Vector3";

export default class OBJParser {
    static async parse(url: string): Promise<Geometry> {
        const response = await fetch("/models/" + url);
        if (!response.ok) {
            throw new Error(`Failed to load OBJ file from ${url}: ${response.statusText}`);
        }

        const objText = await response.text();
        const lines = objText.split('\n');

        const vertices: Vector3[] = [];
        const normals: Vector3[] = [];
        const uvs: Vector3[] = [];  // UV coordinates array
        const faces: Face[] = [];

        let currentMaterial: Material | null = null;
        const materials: Record<string, Material> = {};

        for (const line of lines) {
            const tokens = line.split(/\s+/);
            const command = tokens[0];

            if (command === 'mtllib') {
                await this.loadMaterials(tokens[1], materials);                
            }

            if (command === 'usemtl') {
                currentMaterial = materials[tokens[1]] || null;
            }

            switch (command) {
                case 'v':
                    vertices.push(new Vector3(
                        parseFloat(tokens[1]),
                        parseFloat(tokens[2]),
                        parseFloat(tokens[3])
                    ));
                    break;

                case 'vn':
                    normals.push(new Vector3(
                        parseFloat(tokens[1]),
                        parseFloat(tokens[2]),
                        parseFloat(tokens[3])
                    ));
                    break;

                case 'vt':
                    uvs.push(new Vector3(
                        parseFloat(tokens[1]),
                        parseFloat(tokens[2]),
                        0  // the w component is not used for 2D UVs
                    ));
                    break;

                case 'f':
                    const vertexIndices: number[] = [];
                    const normalIndices: number[] = [];
                    const uvIndices: number[] = [];  // UV indices array
                    tokens.slice(1).forEach(token => {
                        const [vertexIndex, uvIndex, normalIndex] = token.split('/').map(Number);
                        vertexIndices.push(vertexIndex - 1);
                        uvIndices.push(uvIndex - 1);
                        normalIndices.push(normalIndex - 1);
                    });

                    // Triangulate the face if it has more than 3 vertices
                    for (let i = 1; i < vertexIndices.length - 1; i++) {
                        const faceVertices = [
                            vertices[vertexIndices[0]],
                            vertices[vertexIndices[i]],
                            vertices[vertexIndices[i + 1]]
                        ];
                        const faceUVs = [
                            uvs[uvIndices[0]],
                            uvs[uvIndices[i]],
                            uvs[uvIndices[i + 1]]
                        ] as const;

                        const faceNormal = normals[normalIndices[0]]; 
                        const face = new Face(faceVertices[0], faceVertices[1], faceVertices[2], faceNormal, currentMaterial);
                        face.uvMap = faceUVs;
                        faces.push(face);
                    }
                    break;
            }
        }

        return new Geometry(faces.filter(f => f.u && f.v && f.w && f.uvMap));
    }

    static async loadMaterials(url: string, materials: Record<string, Material>): Promise<void> {
        const response = await fetch("/models/" + url);
        if (!response.ok) {
            console.error(`Failed to load MTL file from ${url}: ${response.statusText}`);
            return;
        }
    
        const mtlText = await response.text();
        const lines = mtlText.split('\n');
        let currentMaterialName: string | null = null;
        let currentMaterial: Material | null = null; // Used to assign the texture to the material
    
        for (const line of lines) {
            const tokens = line.split(/\s+/);
            const command = tokens[0];
    
            switch (command) {
                case 'newmtl':
                    currentMaterialName = tokens[1];
                    if (!materials[currentMaterialName]) {
                        // Provide default values for r, g, b, a and name
                        currentMaterial = new Material(255, 255, 255, currentMaterialName);
                        materials[currentMaterialName] = currentMaterial;
                    } else {
                        currentMaterial = materials[currentMaterialName];
                    }
                    break;
                case 'Kd':
                    if (currentMaterial) {
                        const r = Math.floor(parseFloat(tokens[1]) * 255);
                        const g = Math.floor(parseFloat(tokens[2]) * 255);
                        const b = Math.floor(parseFloat(tokens[3]) * 255);
                        Object.assign(currentMaterial, { r, g, b });
                    }
                    break;
                case 'map_Kd':
                    if (currentMaterial) {
                        const imagePath = "/models/" + tokens[1];  // Compute path relative to the .mtl file
                        const imageResponse = await fetch(imagePath);
                        const blob = await imageResponse.blob();
                        const bmp = await createImageBitmap(blob, { imageOrientation: "flipY" });
                        const offscreen = new OffscreenCanvas(bmp.width, bmp.height);
                        const ctx = offscreen.getContext("2d");
                        ctx.drawImage(bmp, 0, 0, offscreen.width, offscreen.height);
                        currentMaterial.texture = ctx.getImageData(0, 0, offscreen.width, offscreen.height);;
                    }
                    break;
            }
        }
    }    
}
