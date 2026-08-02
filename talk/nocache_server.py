#!/usr/bin/env python3
"""Static server that refuses to let the browser cache.

python -m http.server sends Last-Modified and no Cache-Control, so a browser
happily serves a stale deck after you have edited it — which looks exactly like
"my changes did not save". This sends no-store instead.

    python3 talk/nocache_server.py 4830
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4830
    print(f"serving {__file__.rsplit('/', 1)[0]} on http://localhost:{port} (no-cache)")
    ThreadingHTTPServer(("127.0.0.1", port), NoCache).serve_forever()
