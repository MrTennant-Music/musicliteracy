from pathlib import Path

from PIL import Image
from pypdf import PdfReader, PdfWriter


SOURCE = Path("output/pdf/higher-music-literacy-assessment.pdf")
OUTPUT = Path("output/pdf/higher-music-literacy-assessment-revised.pdf")
PREVIEW_DIR = Path("tmp/pdfs/line-spacing-edit")
PAGE_IMAGE = PREVIEW_DIR / "page-2-spaced.png"

# Insert extra white space immediately before each written-answer line. Moving
# all following content with the line preserves the existing spacing between
# questions while giving pupils a clearer writing area.
LINE_START_ROWS = [342, 692, 1005, 1142]
EXTRA_SPACE = 22
FOOTER_START = 1700


reader = PdfReader(SOURCE)
page_image_file = next(image for image in reader.pages[1].images if image.name == "I1.png")
source_image = page_image_file.image.convert("RGB")
width, height = source_image.size
spaced_image = Image.new("RGB", (width, height), "white")

source_top = 0
destination_top = 0
for line_start in LINE_START_ROWS:
    band = source_image.crop((0, source_top, width, line_start))
    spaced_image.paste(band, (0, destination_top))
    destination_top += band.height + EXTRA_SPACE
    source_top = line_start

remaining = source_image.crop((0, source_top, width, FOOTER_START))
spaced_image.paste(remaining, (0, destination_top))
footer = source_image.crop((0, FOOTER_START, width, height))
spaced_image.paste(footer, (0, FOOTER_START))

PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
spaced_image.save(PAGE_IMAGE)

writer = PdfWriter()
writer.clone_document_from_reader(reader)
writer_page_image = next(image for image in writer.pages[1].images if image.name == "I1.png")
writer_page_image.replace(spaced_image)
with OUTPUT.open("wb") as stream:
    writer.write(stream)
