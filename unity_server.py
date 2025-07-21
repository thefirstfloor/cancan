#!/usr/bin/env python
import SimpleHTTPServer
import SocketServer
import os

class UnityHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)

    def guess_type(self, path):
        mime_type, encoding = SimpleHTTPServer.SimpleHTTPRequestHandler.guess_type(self, path)
        
        # Handle Brotli compressed files
        if path.endswith('.br'):
            if '.js.br' in path:
                mime_type = 'application/javascript'
            elif '.wasm.br' in path:
                mime_type = 'application/wasm'
            elif '.data.br' in path:
                mime_type = 'application/octet-stream'
            encoding = 'br'
        
        return mime_type, encoding

PORT = 8000

Handler = UnityHTTPRequestHandler
httpd = SocketServer.TCPServer(("", PORT), Handler)

print("Unity WebGL server running at http://localhost:{}".format(PORT))
print("Press Ctrl+C to stop the server")

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped")
    httpd.shutdown()
