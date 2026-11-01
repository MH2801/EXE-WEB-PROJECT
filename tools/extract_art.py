"""Extract Day 1 art layers from the storyboard PDF into WebP + layout.json."""
import io, json, sys
import pymupdf
from PIL import Image

PDF = "docs/source/day-1-storyboard.pdf"
OUT = "public/assets"
LAYOUT = "src/content/layout.json"
W, H = 1672, 941

# name: (xref, page number 1-based or None, is_background)
ITEMS = {
    "bg_title": (32, None, True), "bg_market": (56, None, True),
    "bg_fruit_empty": (145, None, True), "bg_memory": (45, None, True),
    "fg_leaf_a": (146, 15, False), "fg_leaf_b": (147, 15, False),
    "fg_banner": (148, 15, False), "fg_emblem": (149, 15, False),
    "fg_bush": (160, 15, False), "fg_planter": (161, 15, False),
    "stall_lemon": (150, 15, False), "stall_apple": (152, 15, False),
    "stall_banana": (154, 15, False), "stall_grape": (156, 15, False),
    "stall_orange": (158, 15, False),
    "fruit_lemon": (151, 15, False), "fruit_apple": (153, 15, False),
    "fruit_banana": (155, 15, False), "fruit_grape": (157, 15, False),
    "fruit_orange": (159, 15, False),
    "mimi_idle": (59, 5, False), "mimi_happy": (74, None, False),
    "mimi_think": (67, None, False), "mimi_puzzled": (357, None, False),
    "mimi_surprised": (387, None, False),
    "mom": (50, 5, False), "npc": (58, 5, False), "idea_bubble": (68, None, False),
}

doc = pymupdf.open(PDF)
layout = {}
for name, (xref, page, bg) in ITEMS.items():
    info = doc.extract_image(xref)
    if not info:
        sys.exit(f"BLOCKED: xref {xref} ({name}) not extractable")
    img = Image.open(io.BytesIO(info["image"])).convert("RGBA")
    sm = info.get("smask") or 0
    if sm:
        mask = Image.open(io.BytesIO(doc.extract_image(sm)["image"])).convert("L")
        if mask.size != img.size:
            mask = mask.resize(img.size)
        img.putalpha(mask)
    if bg:
        img.convert("RGB").save(f"{OUT}/{name}.webp", quality=82)
    else:
        img.save(f"{OUT}/{name}.webp", quality=90)
    if page:
        p = doc[page - 1]
        rects = p.get_image_rects(xref)
        if not rects:
            sys.exit(f"BLOCKED: xref {xref} ({name}) not on page {page}")
        r = rects[0]
        sx, sy = W / p.rect.width, H / p.rect.height
        layout[name] = {"x": round((r.x0 + r.x1) / 2 * sx, 1), "y": round((r.y0 + r.y1) / 2 * sy, 1),
                        "w": round(r.width * sx, 1), "h": round(r.height * sy, 1)}
with open(LAYOUT, "w", encoding="utf-8") as f:
    json.dump(layout, f, indent=2)
print(len(ITEMS), "images,", len(layout), "layout entries")
