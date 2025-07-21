const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html for root requests
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        
        let contentType = 'application/octet-stream';
        let contentEncoding = null;
        
        // Handle Brotli compressed files
        if (pathname.endsWith('.br')) {
            contentEncoding = 'br';
            
            if (pathname.endsWith('.js.br')) {
                contentType = 'application/javascript';
            } else if (pathname.endsWith('.wasm.br')) {
                contentType = 'application/wasm';
            } else if (pathname.endsWith('.data.br')) {
                contentType = 'application/octet-stream';
            }
        } else {
            // Regular files
            const ext = path.extname(pathname);
            contentType = mimeTypes[ext] || 'application/octet-stream';
        }
        
        const headers = {
            'Content-Type': contentType,
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        };
        
        if (contentEncoding) {
            headers['Content-Encoding'] = contentEncoding;
        }
        
        res.writeHead(200, headers);
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Unity WebGL server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});
