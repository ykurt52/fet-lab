"""Copy the FET Lab app into another static site (e.g. an Astro site's public/ folder).

Usage:
    python tools/export_site.py <destination folder>
    python tools/export_site.py E:/myWorkspace/portfolio/astro/public/fet-lab/app
    python tools/export_site.py build/web          # staging folder for the desktop app

The destination is replaced with: index.html, embed.js, assets/, pages/.
Docs, build tools and dist/ are not copied. This repository stays the single source;
run the script again after every change.
"""
import pathlib
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ITEMS = ["index.html", "embed.js", "assets", "pages"]

if len(sys.argv) != 2:
    sys.exit(__doc__)
dest = pathlib.Path(sys.argv[1])
if not dest.is_absolute():
    dest = ROOT / dest
dest = dest.resolve()
BUILD = ROOT / "build"
# inside the repository only build/ is allowed (used by the desktop app build)
if dest == ROOT or (ROOT in dest.parents and BUILD not in dest.parents and dest != BUILD):
    sys.exit("destination must be outside this repository or under build/")

if dest.exists():
    # only clear folders that look like a previous export
    if not (dest / "index.html").exists() and any(dest.iterdir()):
        sys.exit(f"{dest} is not empty and does not look like a FET Lab export; refusing to overwrite")
    shutil.rmtree(dest)
dest.mkdir(parents=True)

count = 0
for item in ITEMS:
    src = ROOT / item
    if src.is_dir():
        shutil.copytree(src, dest / item)
        count += sum(1 for p in (dest / item).rglob("*") if p.is_file())
    else:
        shutil.copy2(src, dest / item)
        count += 1
print(f"copied {count} files to {dest}")
