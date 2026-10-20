"""Bundle FET Lab into one self-contained HTML file: dist/fetlab.html

Usage:  python tools/build.py

The result has every stylesheet and script inlined, so it can be uploaded as a single
file (CMS media library, intranet, USB stick) and opened without a server.
Only the Google Fonts link stays external; the page falls back to system fonts offline.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / "index.html").read_text(encoding="utf-8")


def inline_css(m):
    href = m.group(1)
    css = (ROOT / href).read_text(encoding="utf-8")
    return f"<style>\n{css}\n</style>"


def inline_js(m):
    path = ROOT / m.group(1)
    if not path.exists():
        print(f"  skip (missing): {m.group(1)}")
        return ""
    js = path.read_text(encoding="utf-8").replace("</script", "<\\/script")
    return f"<script>/* {m.group(1)} */\n{js}\n</script>"


out = re.sub(r'<link rel="stylesheet" href="(assets/[^"]+)">', inline_css, src)
out = re.sub(r'<script src="([^"]+\.js)"></script>', inline_js, out)

dist = ROOT / "dist"
dist.mkdir(exist_ok=True)
target = dist / "fetlab.html"
target.write_text(out, encoding="utf-8")
print(f"wrote {target.relative_to(ROOT)}  ({target.stat().st_size / 1024:.0f} KB)")
