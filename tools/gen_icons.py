# 生成 tabBar 图标：81x81，4 倍超采样抗锯齿
# 运行：python tools/gen_icons.py
import math
import os

from PIL import Image, ImageDraw

SIZE = 81
SS = 4
BIG = SIZE * SS

GRAY = (156, 161, 174, 255)   # #9CA1AE
BLUE = (76, 125, 255, 255)    # #4C7DFF
CLEAR = (0, 0, 0, 0)

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'tabbar')


def canvas():
    img = Image.new('RGBA', (BIG, BIG), CLEAR)
    return img, ImageDraw.Draw(img)


def save(img, name):
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    path = os.path.join(OUT, name)
    img.save(path)
    print('saved', path)


def icon_today(color):
    """时钟"""
    img, d = canvas()
    cx = cy = BIG // 2
    r = 30 * SS
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=5 * SS)
    d.line([cx, cy, cx, cy - 16 * SS], fill=color, width=5 * SS)
    d.line([cx, cy, cx + 12 * SS, cy + 6 * SS], fill=color, width=5 * SS)
    return img


def icon_week(color):
    """课程表"""
    img, d = canvas()
    x0, y0, x1, y1 = 12 * SS, 20 * SS, 69 * SS, 70 * SS
    d.rounded_rectangle([x0, y0, x1, y1], radius=8 * SS, outline=color, width=5 * SS)
    d.line([x0 + 3 * SS, y0 + 14 * SS, x1 - 3 * SS, y0 + 14 * SS], fill=color, width=4 * SS)
    for x in (27 * SS, 54 * SS):
        d.line([x, 10 * SS, x, 26 * SS], fill=color, width=5 * SS)
    for gx in (32 * SS, 50 * SS):
        for gy in (42 * SS, 58 * SS):
            r2 = 3 * SS
            d.ellipse([gx - r2, gy - r2, gx + r2, gy + r2], fill=color)
    return img


def icon_settings(color):
    """齿轮"""
    img, d = canvas()
    cx = cy = BIG // 2
    r = 22 * SS
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=6 * SS)
    for k in range(8):
        a = math.pi / 4 * k
        d.line(
            [
                cx + math.cos(a) * 27 * SS, cy + math.sin(a) * 27 * SS,
                cx + math.cos(a) * 34 * SS, cy + math.sin(a) * 34 * SS
            ],
            fill=color, width=7 * SS
        )
    r2 = 9 * SS
    d.ellipse([cx - r2, cy - r2, cx + r2, cy + r2], fill=CLEAR)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in (('today', icon_today), ('week', icon_week), ('settings', icon_settings)):
        save(fn(GRAY), name + '.png')
        save(fn(BLUE), name + '-active.png')


if __name__ == '__main__':
    main()
