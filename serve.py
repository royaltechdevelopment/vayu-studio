"""Local preview server with GitHub Pages-style clean URLs.

Usage: python3 serve.py   then open http://127.0.0.1:8000/
/team serves team.html, /login serves login.html, and / serves index.html.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


class CleanURLHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = path.split('?', 1)[0].split('#', 1)[0]
        path = os.path.normpath(path).lstrip('/')
        if not path or path.endswith('/'):
            path = os.path.join(path, 'index.html')
        elif not os.path.splitext(path)[1]:
            candidate = path + '.html'
            if os.path.isfile(os.path.join(ROOT, candidate)):
                path = candidate
        return super().translate_path('/' + path)


if __name__ == '__main__':
    os.chdir(ROOT)
    ThreadingHTTPServer(('127.0.0.1', 8000), CleanURLHandler).serve_forever()
