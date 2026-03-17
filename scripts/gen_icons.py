from PIL import Image, ImageDraw
import os

def make_icon(size, path):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fondo verde redondeado
    radius = size // 5
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=(22, 163, 74, 255))

    cx, cy = size // 2, size // 2

    # Tallo
    stem_w = max(2, size // 25)
    draw.rectangle(
        [cx - stem_w, cy - size // 6, cx + stem_w, cy + size // 3],
        fill=(255, 255, 255, 255)
    )

    # Hoja izquierda
    leaf_r = size // 5
    off = size // 10
    draw.ellipse(
        [cx - leaf_r * 2, cy - leaf_r - off, cx, cy + leaf_r // 2 - off],
        fill=(255, 255, 255, 200)
    )

    # Hoja derecha
    draw.ellipse(
        [cx, cy - leaf_r - off, cx + leaf_r * 2, cy + leaf_r // 2 - off],
        fill=(255, 255, 255, 200)
    )

    # Brote superior
    bud_r = size // 9
    draw.ellipse(
        [cx - bud_r, cy - size // 3 - bud_r, cx + bud_r, cy - size // 3 + bud_r],
        fill=(255, 255, 255, 255)
    )

    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path)
    print(f"Saved {path} ({size}x{size})")


make_icon(192, '/Users/o019115/BBVA/HUERTO_APP/public/icons/icon-192.png')
make_icon(512, '/Users/o019115/BBVA/HUERTO_APP/public/icons/icon-512.png')
