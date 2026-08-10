from pathlib import Path

from PIL import Image


root = Path(__file__).resolve().parents[1]
source = root / "assets/images/icon.png"
targets = {
    "assets/images/icon.png": 1024,
    "assets/images/splash-icon.png": 768,
    "assets/images/favicon.png": 256,
    "assets/images/android-icon-foreground.png": 768,
}

with Image.open(source) as original:
    rgb = original.convert("RGB")
    for relative_path, size in targets.items():
        resized = rgb.resize((size, size), Image.Resampling.LANCZOS)
        quantized = resized.quantize(colors=192, method=Image.Quantize.MEDIANCUT)
        quantized.save(root / relative_path, optimize=True, compress_level=9)
