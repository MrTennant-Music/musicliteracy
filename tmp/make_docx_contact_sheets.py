from pathlib import Path
from PIL import Image, ImageDraw, ImageStat


source = Path("tmp/docx_render_v5_2148")
out_dir = source / "contact_sheets"
out_dir.mkdir(exist_ok=True)
pages = sorted(source.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))

metrics = []
for path in pages:
    im = Image.open(path).convert("L")
    small = im.resize((max(1, im.width // 8), max(1, im.height // 8)))
    pixels = list(small.getdata())
    dark = sum(1 for value in pixels if value < 245)
    metrics.append((int(path.stem.split("-")[-1]), dark / len(pixels), im.size))

print("LOW_INK", [(n, round(r, 5)) for n, r, _ in metrics if r < 0.012])
print("PAGE_COUNT", len(pages), "SIZE", metrics[0][2] if metrics else None)

per_sheet = 8
cols = 2
thumb_w = 420
thumb_h = 594
label_h = 28
rows = per_sheet // cols
for start in range(0, len(pages), per_sheet):
    subset = pages[start : start + per_sheet]
    sheet = Image.new("RGB", (cols * (thumb_w + 20) + 20, rows * (thumb_h + label_h + 20) + 20), (215, 215, 215))
    draw = ImageDraw.Draw(sheet)
    for idx, path in enumerate(subset):
        im = Image.open(path).convert("RGB")
        im.thumbnail((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = 20 + (idx % cols) * (thumb_w + 20)
        y = 20 + (idx // cols) * (thumb_h + label_h + 20)
        draw.text((x, y), f"Page {int(path.stem.split('-')[-1])}", fill="black")
        sheet.paste(im, (x, y + label_h))
    sheet.save(out_dir / f"sheet-{start + 1:03d}-{start + len(subset):03d}.png")
