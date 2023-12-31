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
            shadeSmoothing: data.shadeSmooth,
            keepAspectRatio: data.keepAspectRatio,
            cameraFov: 45,
            cameraNear: 2,
            autoClose: data.autoClose,
            renderer: rendererConfigs[data.renderer as keyof typeof rendererConfigs],
            optimizer: {
                maxDepth: 25
            },
            photonMapperSetup: {
                delta: data.lightDelta,
                maxDepth: data.lightMaxDepth,
                maxSize: 2000,
                hasAlpha: true,
                gridGap: data.lightSampleGap,
                strengthDivider: data.lightDivider,
                enabled: data.indirectLight
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
            canvas.onclick = () => {
                canvas.requestFullscreen({ navigationUI: "hide" });
            }
            
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
                // ctx.textAlign = "end";
                // ctx.textBaseline = "top";
                // ctx.fillStyle = "black";
                // ctx.font = (canvas.height / 40) + "px Arial";
                // ctx.fillText(hintTxt.join(", "), canvas.width - 10, 10);
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