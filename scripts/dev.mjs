import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT || 3000);
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = resolve(root, `.${path}`);
    if (!file.startsWith(root)) throw new Error("Invalid path");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": `${types[extname(file)] || "application/octet-stream"}; charset=utf-8` });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
