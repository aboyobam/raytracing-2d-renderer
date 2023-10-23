import express from "express";
import path from "node:path";
import fs from "fs";

const app = express();

const publicDir = path.resolve("dist");

app.get("/api/gltf-files", (_req, res) => {
    const files = fs.readdirSync(path.join(publicDir, "models")).filter(file => file.endsWith(".gltf"));
    return res.json(files);
});

app.use((_req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
}, express.static(publicDir));

app.listen(9000);
