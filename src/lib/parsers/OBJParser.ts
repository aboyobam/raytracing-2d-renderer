import Face from "@/Face";
import Geometry from "@/Geometry";
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

        for (const line of lines) {
            const tokens = line.split(/\s+/);
            const command = tokens[0];

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
                        faces.push(new Face(faceVertices[0], faceVertices[1], faceVertices[2], faceNormal));
                    }
                    break;
            }
        }

        return new Geometry(vertices, faces.filter(f => f.u && f.v && f.w));
    }
}