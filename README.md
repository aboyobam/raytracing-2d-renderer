# Raytracing 2D Renderer
![](https://github.com/aboyobam/raytracing-2d-renderer/blob/master/blender/render.png)

Animated Cube | Suzanne
:-:|:-:
![](https://github.com/aboyobam/raytracing-2d-renderer/blob/master/preview.gif) | ![](https://github.com/aboyobam/raytracing-2d-renderer/blob/master/preview2.gif)

Written in strict typescript.

It uses multithreading with WebWorkers and a SharedArrayBuffer as the storage for the pixels accross all threads.
With planar projection of all faces into a quad tree, it can handle hundreds of vertecies without any performance penalty; but it is still slow. 

## How to run
First install all build dependencies.
```sh
npm install
```

Then start the webpack bundeling
```sh
npm run build
```

Then start the static file server
```sh
node serve.mjs
```

Open http://localhost:9000
There you see the userinterface

It uses no runtime dependencies and is only 4.7kb (with gzip, no 3D models)
