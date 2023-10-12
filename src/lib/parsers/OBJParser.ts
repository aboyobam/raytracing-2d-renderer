import Face from "@/Face";
import Geometry from "@/Geometry";
import Material from "@/Material";
import Vector3 from "@/Vector3";

export default class OBJParser {
    static async parse(url: string): Promise<Geometry> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load OBJ file from ${url}: ${response.statusText}`);
        }

        const objText = await response.text();
        const lines = objText.split('\n');

        const vertices: Vector3[] = [];
        const normals: Vector3[] = [];
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

                case 'f':
                    const vertexIndices: number[] = [];
                    const normalIndices: number[] = [];
                    tokens.slice(1).forEach(token => {
                        const [vertexIndex, , normalIndex] = token.split('/').map(Number);
                        vertexIndices.push(vertexIndex - 1);
                        normalIndices.push(normalIndex - 1);
                    });
                
                    // Triangulate the face if it has more than 3 vertices
                    for (let i = 1; i < vertexIndices.length - 1; i++) {
                        const faceVertices = [
                            vertices[vertexIndices[0]],
                            vertices[vertexIndices[i]],
                            vertices[vertexIndices[i + 1]]
                        ];
                        const faceNormal = normals[normalIndices[0]]; // Adjust this as needed to handle per-vertex normals
                        faces.push(new Face(faceVertices[0], faceVertices[1], faceVertices[2], faceNormal, currentMaterial));
                    }
                    break;
            }
        }

        return new Geometry(vertices, faces.filter(f => f.u && f.v && f.w));
    }

    static async loadMaterials(url: string, materials: Record<string, Material>): Promise<void> {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to load MTL file from ${url}: ${response.statusText}`);
            return;
        }

        const mtlText = await response.text();
        const lines = mtlText.split('\n');
        let currentMaterialName: string | null = null;

        for (const line of lines) {
            const tokens = line.split(/\s+/);
            const command = tokens[0];

            switch (command) {
                case 'newmtl':
                    currentMaterialName = tokens[1];
                    break;
                case 'Kd':
                    if (currentMaterialName) {
                        const r = Math.floor(parseFloat(tokens[1]) * 255);
                        const g = Math.floor(parseFloat(tokens[2]) * 255);
                        const b = Math.floor(parseFloat(tokens[3]) * 255);
                        const a = 255;  // alpha is always 255 for now
                        materials[currentMaterialName] = new Material(r, g, b, a, currentMaterialName);
                    }
                    break;
            }
        }
    }
}