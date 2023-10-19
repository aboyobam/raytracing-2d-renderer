import Light from "@/Light";
import Material from "@/Material";
import Mesh from "@/Mesh";
import Vector3 from "@/Vector3";
import PlaneGeometry from "@/geometries/PlaneGeometry";
import OBJParser from "@/parsers/OBJParser";
import setup from "@/setup";

setup(async ({ scene, camera }) => {
    const porsche = await OBJParser.parse("mclarren.obj");
    
    const mesh = new Mesh(porsche, new Material());
    mesh.position.set(0, 0, 6);

    scene.add(mesh);
    camera.position.set(0, 3, 0);
    camera.lookAt(mesh.position);

    const floor = PlaneGeometry.asFloor(mesh, 1);
    scene.add(new Mesh(floor, Material.WHITE));

    const [fmin, fmax] = floor.getBoundingBox();

    left: {
        const light = new Light(1.0, 10, 1.5);
        light.position.set(fmin.x, fmin.y + 4, Vector3.midpoint(fmin, fmax).z);
        scene.addLight(light);
    }

    right: {
        const light = new Light(1.5, 10, 1.5);
        light.position.set(fmax.x, fmin.y + 4, Vector3.midpoint(fmin, fmax).z);
        scene.addLight(light);
    }

    front: {
        const light = new Light(1.5, 10, 1.5);
        light.position.set(Vector3.midpoint(fmin, fmax).x, fmin.y + 4, fmin.z);
        scene.addLight(light);
    }

    back: {
        const light = new Light(1.5, 10, 1.5);
        light.position.set(Vector3.midpoint(fmin, fmax).x, fmin.y + 4, fmax.z);
        scene.addLight(light);
    }
});