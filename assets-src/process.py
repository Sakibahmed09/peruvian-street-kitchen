#!/usr/bin/env python3
"""Process PSK brand + generated assets into web-ready files."""
from PIL import Image
import os

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(SRC, "..", "site", "assets", "img")
os.makedirs(OUT, exist_ok=True)

def webp(name, src_file, width, quality=82):
    im = Image.open(os.path.join(SRC, src_file)).convert("RGB")
    if im.width > width:
        h = round(im.height * width / im.width)
        im = im.resize((width, h), Image.LANCZOS)
    im.save(os.path.join(OUT, name), "WEBP", quality=quality, method=6)
    print(f"{name}: {im.width}x{im.height} {os.path.getsize(os.path.join(OUT,name))//1024}KB")

# Food photography
webp("hero-box.webp", "gen-hero-rice-box.png", 1100, 84)
webp("rice-box.webp", "gen-rice-box-card.png", 820)
webp("chips-box.webp", "gen-chips-box.png", 900)
webp("sauce-pour.webp", "gen-green-sauce-pour.png", 1100, 84)
webp("bun.webp", "gen-peruvian-bun.png", 820)
webp("wings.webp", "gen-wings.png", 820)
webp("sauce-trio.webp", "gen-sauce-trio.png", 1200, 84)
webp("dessert.webp", "gen-dessert.png", 820)

# Logo: trim transparent padding, then split letters-only crop
logo = Image.open(os.path.join(SRC, "PSK_logo_transparent.png"))
alpha = logo.getchannel("A")
bbox = alpha.getbbox()
logo_trim = logo.crop(bbox)
logo_trim.save(os.path.join(OUT, "logo-full.png"))
print(f"logo-full: {logo_trim.size}")

# Letters-only: crop off the wordmark strip at the bottom (~bottom 18% of trimmed height)
w, h = logo_trim.size
letters = logo_trim.crop((0, 0, w, int(h * 0.80)))
lb = letters.getchannel("A").getbbox()
letters = letters.crop(lb)
letters.save(os.path.join(OUT, "logo-mark.png"))
print(f"logo-mark: {letters.size}")

# Downscale header copies (2x for retina at ~44px and ~120px display heights)
for name, src, target_h in [("logo-mark-sm.png", letters, 96), ("logo-full-md.png", logo_trim, 320)]:
    r = target_h / src.height
    im = src.resize((round(src.width * r), target_h), Image.LANCZOS)
    im.save(os.path.join(OUT, name))
    print(f"{name}: {im.size} {os.path.getsize(os.path.join(OUT,name))//1024}KB")

# Favicon: ink square + letters centered
for size, name in [(512, "icon-512.png"), (192, "icon-192.png"), (48, "favicon-48.png")]:
    canvas = Image.new("RGBA", (size, size), (19, 19, 18, 255))
    m = int(size * 0.12)
    box = (size - 2 * m, size - 2 * m)
    r = min(box[0] / letters.width, box[1] / letters.height)
    im = letters.resize((round(letters.width * r), round(letters.height * r)), Image.LANCZOS)
    canvas.paste(im, ((size - im.width) // 2, (size - im.height) // 2), im)
    canvas.save(os.path.join(OUT, name))
print("icons done")

# OG image 1200x630 from frontbag art (logo on black), center-weighted crop
bag = Image.open(os.path.join(SRC, "frontbag.png")).convert("RGB")
bw, bh = bag.size
target = (1200, 630)
ar = target[0] / target[1]
# crop widest possible 1200:630 region centered on the logo (logo sits around 42-55% height)
cw = bw
ch = round(cw / ar)
cy = max(0, int(bh * 0.48 - ch / 2))
og = bag.crop((0, cy, cw, min(bh, cy + ch))).resize(target, Image.LANCZOS)
og.save(os.path.join(OUT, "og.jpg"), "JPEG", quality=88)
print(f"og.jpg: {og.size} {os.path.getsize(os.path.join(OUT,'og.jpg'))//1024}KB")
