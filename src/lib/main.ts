import rendererConfigs from "../config";
import AppConfig from "./config";

window.onmessage = ({ data }) => {
    if (data.type !== "config") {
        return;
    }

    const config: AppConfig = {
        file: data.file,
        threads: data.threads,
        renderer: {
            gltf: data.gltf,
            width: data.width,
            height: data.height,
            keepAspectRatio: data.keepAspectRatio,
            cameraFov: 45,
            cameraNear: 2,
            autoClose: false,
            renderer: rendererConfigs[data.renderer as keyof typeof rendererConfigs],
            optimizer: {
                maxDepth: 25
            },
            photonMapperSetup: {
                samples: 200_000,
                maxDepth: 5,
                maxSize: 2000,
                hasAlpha: false,
                enabled: false
            }
        }
    }
    
    const worker = new Worker("/js/scenes/" + config.file + ".bundle.js");
    worker.postMessage({
        type: "config",
        data: {
            threads: config.threads,
            config: config.renderer
        }
    });
    
    let hintTxt: string[] = [];
    
    worker.onmessage = ({ data }) => {
        if (data.type == "time") {
            hintTxt.push(`Renderer: ${data.renderer}`);
            hintTxt.push(`Faces: ${data.faces}`);
            hintTxt.push(`Lights: ${data.lights}`);
            hintTxt.push(`Time: ${data.time.toFixed(0)}ms`);
        } else if (data.type == "aspect") {
            const canvas = document.createElement("canvas");
            canvas.width = config.renderer.width;
            canvas.height = config.renderer.height;
            const ctx = canvas.getContext("2d");
            
            if (config.renderer.keepAspectRatio) {
                canvas.height = Math.round(canvas.width / data.aspect);
            }

            const viewBuffer = new SharedArrayBuffer(canvas.width * canvas.height * 4);
            const pixels = new Uint8ClampedArray(viewBuffer);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            document.body.appendChild(canvas);

            function draw() {
                imageData.data.set(pixels);
                ctx.putImageData(imageData, 0, 0);
                ctx.textAlign = "end";
                ctx.textBaseline = "top";
                ctx.fillStyle = "black";
                ctx.font = (canvas.height / 30) + "px Arial";
                ctx.fillText(hintTxt.join(", "), canvas.width - 10, 10);
                requestAnimationFrame(draw);
            }
            requestAnimationFrame(draw);

            worker.postMessage({
                type: "render",
                data: {
                    width: canvas.width,
                    height: canvas.height,
                    buffer: viewBuffer
                }
            });

            parent.postMessage(data, "*");
        }
    }
};