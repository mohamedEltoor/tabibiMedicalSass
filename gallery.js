const http = require('http');
const fs = require('fs');
const path = require('path');

const rawDir = path.join(__dirname, 'docs', 'screenshots', 'raw');

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        let files = fs.readdirSync(rawDir).filter(f => f.endsWith('.png'));
        
        // Sort files by creation time
        files.sort((a, b) => {
            return fs.statSync(path.join(rawDir, a)).mtime.getTime() - fs.statSync(path.join(rawDir, b)).mtime.getTime();
        });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        let html = `<html><body style="font-family: Arial; padding: 20px;">
        <h2>Gallery of Raw Screenshots</h2>
        <p>This page displays all screenshots found in the raw directory so the AI subagent can visually analyze them.</p>
        <div style="display: flex; flex-wrap: wrap; gap: 20px;">`;
        
        files.forEach((f, idx) => {
            html += `<div style="width: 350px; border: 2px solid #333; padding: 10px; text-align: center; background: #f9f9f9;">
                <h3 style="margin: 0 0 10px 0;">ID: ${idx}</h3>
                <img src="/image/${encodeURIComponent(f)}" style="max-width: 100%; height: auto; max-height: 300px; display: block; margin: 0 auto 10px; border: 1px solid #ccc;">
                <code style="word-wrap: break-word; font-size: 14px; font-weight: bold; background: #eee; padding: 5px;">${f}</code>
            </div>`;
        });

        html += `</div></body></html>`;
        res.end(html);
    } else if (req.method === 'GET' && req.url.startsWith('/image/')) {
        const fileName = decodeURIComponent(req.url.replace('/image/', ''));
        const filePath = path.join(rawDir, fileName);
        if (fs.existsSync(filePath)) {
            res.writeHead(200, { 'Content-Type': 'image/png' });
            res.end(fs.readFileSync(filePath));
        } else {
            res.writeHead(404);
            res.end();
        }
    }
});

server.listen(4001, () => {
    console.log('Gallery server running on http://localhost:4001');
});
