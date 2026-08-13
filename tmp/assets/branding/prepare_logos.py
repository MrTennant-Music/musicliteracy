from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


SOURCES = {
    "School Logo greyscale.png": Path(
        "/Users/bobbytennant/Library/CloudStorage/OneDrive-GlowScotland/Other/School Logo.png"
    ),
    "Believe Achieve Logo greyscale.png": Path(
        "/Users/bobbytennant/Library/CloudStorage/OneDrive-GlowScotland/Other/Believe Achieve Logo.png"
    ),
}


def prepare(source, output_name):
    image = Image.open(source).convert("RGBA")
    alpha = image.getchannel("A")
    grey = ImageOps.grayscale(image.convert("RGB"))
    grey = ImageOps.autocontrast(grey, cutoff=0.2)
    grey = ImageEnhance.Contrast(grey).enhance(1.05)
    output = Image.merge("RGBA", (grey, grey, grey, alpha))
    output.save(Path(__file__).with_name(output_name), dpi=(300, 300))


for output_name, source in SOURCES.items():
    prepare(source, output_name)
