#!/usr/bin/env python3
"""로컬 미리보기 서버.

`python3 -m http.server`는 Cache-Control을 보내지 않아 브라우저가 js/css를 캐시합니다.
그래서 파일을 고쳐도 화면이 그대로인 일이 생깁니다. 이 서버는 매 요청마다
no-store를 내려보내므로 새로고침만 하면 항상 최신 파일이 보입니다.

    python3 serve.py          # http://localhost:8000 (사용 중이면 다음 빈 포트)
    python3 serve.py 8080     # 포트 지정

어느 폴더에서 실행해도 이 파일이 있는 폴더(청첩장 루트)를 보여줍니다.
Range 요청을 지원하므로 Safari/iOS에서도 음악(mp3)이 재생됩니다.
"""

import errno
import os
import re
import sys
from functools import partial
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)$")


class NoCacheHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        # 조건부 요청을 지워 304(Not Modified)가 돌아오지 않게 합니다.
        for header in ("If-Modified-Since", "If-None-Match"):
            if header in self.headers:
                del self.headers[header]

        self._range = None
        path = self.translate_path(self.path)
        match = RANGE_RE.match(self.headers.get("Range", "").strip())
        if not match or os.path.isdir(path) or not os.path.isfile(path):
            return super().send_head()

        # Safari는 오디오/비디오를 Range(206) 응답으로만 재생합니다.
        size = os.path.getsize(path)
        start_s, end_s = match.groups()
        if start_s:
            start = int(start_s)
            end = min(int(end_s), size - 1) if end_s else size - 1
        elif end_s:
            start, end = max(size - int(end_s), 0), size - 1
        else:
            return super().send_head()
        if start >= size or start > end:
            self.send_response(HTTPStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None

        f = open(path, "rb")
        f.seek(start)
        self._range = (start, end)
        self.send_response(HTTPStatus.PARTIAL_CONTENT)
        self.send_header("Content-type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        return f

    def copyfile(self, source, outputfile):
        if not getattr(self, "_range", None):
            return super().copyfile(source, outputfile)
        remaining = self._range[1] - self._range[0] + 1
        while remaining > 0:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def send_header(self, keyword, value):
        # 부모 클래스가 붙이는 Last-Modified를 막아 304 응답을 없앱니다.
        if keyword == "Last-Modified":
            return
        super().send_header(keyword, value)


def start_server(port, fixed):
    handler = partial(NoCacheHandler, directory=ROOT)
    for candidate in [port] if fixed else range(port, port + 20):
        try:
            return ThreadingHTTPServer(("", candidate), handler)
        except OSError as e:
            if e.errno != errno.EADDRINUSE:
                raise
            print(f"포트 {candidate}은(는) 이미 사용 중입니다.", flush=True)
    sys.exit("빈 포트를 찾지 못했습니다. 이전에 켜 둔 serve.py를 Ctrl+C로 끄고 다시 실행하세요.")


if __name__ == "__main__":
    fixed = len(sys.argv) > 1
    server = start_server(int(sys.argv[1]) if fixed else 8000, fixed)
    port = server.server_address[1]
    print(f"미리보기: http://localhost:{port}  (Ctrl+C 로 종료)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n종료합니다.")
