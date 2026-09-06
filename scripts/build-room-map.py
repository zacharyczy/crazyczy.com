"""Build the room map from public-domain Natural Earth 1:50m land data.
Run manually with Python + Pillow; the website only loads the committed PNG.
https://www.naturalearthdata.com/about/terms-of-use/
"""
import json
from pathlib import Path
from urllib.request import urlopen
from PIL import Image, ImageDraw, ImageFilter

SOURCE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson"
WIDTH, HEIGHT = 432, 204

def project(lon, lat):
    return ((lon + 180) / 360 * WIDTH, (85 - lat) / 170 * HEIGHT)

def build():
    with urlopen(SOURCE, timeout=45) as response:
        data = json.load(response)
    mask = Image.new("L", (WIDTH, HEIGHT), 0)
    land = ImageDraw.Draw(mask)
    polygons = []
    for feature in data["features"]:
        geometry = feature["geometry"]
        polygons.extend(geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]])
    for polygon in polygons:
        land.polygon([project(*point) for point in polygon[0]], fill=255)
        for hole in polygon[1:]:
            land.polygon([project(*point) for point in hole], fill=0)
    image = Image.new("RGB", (WIDTH, HEIGHT), "#668b86")
    grid = ImageDraw.Draw(image)
    for lon in range(-150, 180, 30):
        x, _ = project(lon, 0)
        grid.line((x, 0, x, HEIGHT), fill="#7c9e94")
    for lat in range(-60, 90, 30):
        _, y = project(0, lat)
        grid.line((0, y, WIDTH, y), fill="#7c9e94")
    image.paste("#435e50", mask=mask.filter(ImageFilter.MaxFilter(3)))
    image.paste("#ccb578", mask=mask)
    pixels = image.load()
    bits = mask.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            if bits[x, y] and (x * 17 + y * 29) % 19 == 0:
                pixels[x, y] = (187, 167, 108)
    # This is a schematic eastern-mainland marker, not the owner's precise location.
    pin = project(117, 32)
    assert bits[int(pin[0]), int(pin[1])] > 0, "Marker must be on mainland land."
    output = Path(__file__).resolve().parents[1] / "public" / "maps"
    output.mkdir(parents=True, exist_ok=True)
    image.save(output / "world-land.png", optimize=True)
    (output / "SOURCE.txt").write_text("Natural Earth 1:50m land, public domain.\n" + SOURCE + "\nEquirectangular; longitude -180..180, latitude -85..85.\n", encoding="utf-8")
    print(f"Built {WIDTH}x{HEIGHT} map; {len(polygons)} land polygons; eastern marker verified on land.")

if __name__ == "__main__":
    build()
