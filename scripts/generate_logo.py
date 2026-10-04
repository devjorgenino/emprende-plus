"""
Emprende+ logo generator.

Renders the brand mark + full icon set using Pillow + numpy with
supersampled anti-aliasing, then writes every asset referenced by app.json.

Brand mark: an ascending "growth" arrow made of three staggered rounded bars
forming a stylized rocket/growth arrow. Colors follow src/constants/colors.ts:
  primary  #6366F1 (Indigo)
  primaryDark #4F46E5
  secondary #10B981 (Emerald)
  accent violet #8B5CF6

Outputs (all under assets/):
  icon.png                     1024x1024  (full-bleed app icon)
  splash-icon.png               1024x1024  (transparent logo for splash)
  favicon.png                    64x64     (web favicon, transparent)
  android-icon-foreground.png    1024x1024 (adaptive foreground, transparent)
  android-icon-background.png    1024x1024 (adaptive background, indigo gradient)
  android-icon-monochrome.png    1024x1024 (monochrome white glyph, transparent)
  logo-mark.png                 1024x1024  (transparent mark, reusable)
"""

import math
import os

import numpy as np
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(OUT, exist_ok=True)

# ---- Brand palette ---------------------------------------------------------
INDIGO = (99, 102, 241)        # #6366F1 primary
INDIGO_DARK = (79, 70, 229)    # #4F46E5 primaryDark
VIOLET = (139, 92, 246)        # #8B5CF6 accent
EMERALD = (16, 185, 129)       # #10B981 secondary
WHITE = (255, 255, 255, 255)

SUPERSAMPLE = 4  # render at 4x then box-downsample for smooth edges


def smoothstep(edge0, edge1, x):
    """Hermite smoothstep used for anti-aliased coverage."""
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def rounded_rect_mask(h, w, cx, cy, rw, rh, radius, inside=True):
    """Return a float mask (0..1) of a rounded rectangle centered at (cx,cy)."""
    y, x = np.mgrid[0:h, 0:w].astype(float)
    # bounding box in image coords
    x0, x1 = cx - rw / 2.0, cx + rw / 2.0
    y0, y1 = cy - rh / 2.0, cy + rh / 2.0
    r = max(radius, 0.0)
    # signed distance-ish field for rounded rect
    qx = np.abs(x - cx) - (rw / 2.0 - r)
    qy = np.abs(y - cy) - (rh / 2.0 - r)
    outside = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2)
    outside -= r
    dist = -outside  # negative outside, positive inside
    inside_rect = (np.abs(x - cx) <= rw / 2.0) & (np.abs(y - cy) <= rh / 2.0)
    # distance to rounded rect boundary
    d = np.where(
        (np.abs(x - cx) < rw / 2.0 - r) & (np.abs(y - cy) < rh / 2.0 - r),
        min(rh, rw) / 2.0,  # positive -> clearly inside
        dist,
    )
    # coverage: 1 when fully inside, 0 fully outside
    cov = smoothstep(-0.5, 0.5, d)
    if not inside:
        cov = 1.0 - cov
    return cov


def canvas(size, background=None):
    """Return a float RGBA HxWx4 array."""
    h = w = size
    arr = np.zeros((h, w, 4), dtype=np.float64)
    if background is not None:
        arr[..., 0] = background[0]
        arr[..., 1] = background[1]
        arr[..., 2] = background[2]
        arr[..., 3] = 255.0
    return arr


def blend_rgba(base, top):
    """Alpha-composite top over base (both HxWx4 float)."""
    a_top = top[..., 3:4] / 255.0
    a_base = base[..., 3:4] / 255.0
    out_a = a_top + a_base * (1.0 - a_top)
    # shapes: [...,3:4] is HxWx1, [...,c] is HxW -> expand to HxWx1
    out = np.empty_like(base)
    for c in range(3):
        top_c = top[..., c, None]
        base_c = base[..., c, None]
        out[..., c:c + 1] = (
            top_c * a_top + base_c * a_base * (1.0 - a_top)
        ) / np.maximum(out_a, 1e-6)
    out[..., 3:4] = out_a * 255.0
    return out


def gradient_horizontal(size, c0, c1):
    """Return a top-left->bottom-right diagonal gradient canvas (RGBA float)."""
    h = w = size
    x = np.linspace(0, 1, w)[None, :]
    y = np.linspace(0, 1, h)[:, None]
    t = (x + y) / 2.0  # diagonal
    arr = np.zeros((h, w, 4), dtype=np.float64)
    for c in range(3):
        arr[..., c] = c0[c] + (c1[c] - c0[c]) * t
    arr[..., 3] = 255.0
    return arr


def render_mark(size, mode="color"):
    """
    Render the transparent brand mark on a `size`x`size` canvas (float RGBA).

    The mark: three ascending rounded bars (growth) whose top carries a "+"
    (the Emprende+ "+"), plus a thin upward arc underlining momentum.

    mode:
      "color" -> bars in brand colors (indigo/violet/emerald), plus+arc white
      "white" -> entire mark rendered in white (for colored icon backgrounds)
      "mono"  -> single-color glyph (uses white; caller may flatten)
    """
    arr = canvas(size)
    S = size

    # ---- Growth bars ------------------------------------------------------
    # The three bars climb left->right. Each bar is a rounded rectangle.
    # We offset bars so they stagger like a staircase/growth chart.
    bar_w = S * 0.155
    radius = S * 0.06
    base_y = S * 0.78  # bottom of the tallest bar (leaves bottom margin)

    # Bar x positions (three columns)
    xs = [S * 0.22, S * 0.44, S * 0.66]
    # Bar heights growing up (tallest reaches ~0.13*S, leaves top margin)
    hs = [S * 0.30, S * 0.46, S * 0.62]
    if mode == "color":
        colors = [INDIGO, VIOLET, EMERALD]
    else:
        colors = [WHITE, WHITE, WHITE]

    for x, hh, col in zip(xs, hs, colors):
        top = base_y - hh
        # rounded rect from top..top+hh (centered horizontally)
        mask = rounded_rect_mask(
            S, S, cx=x + bar_w / 2.0, cy=top + hh / 2.0,
            rw=bar_w, rh=hh, radius=radius,
        )
        layer = np.zeros((S, S, 4), dtype=np.float64)
        layer[..., 0] = col[0]
        layer[..., 1] = col[1]
        layer[..., 2] = col[2]
        layer[..., 3] = mask * 255.0
        arr = blend_rgba(arr, layer)

    # ---- "Plus" formed by a vertical stem on the tallest (rightmost) bar ----
    # A bright white "+" on the emerald bar top-right = Emprende+ "+"
    plus_x = xs[2] + bar_w / 2.0
    plus_top = base_y - hs[2]
    stem_w = S * 0.075
    stem_h = S * 0.15
    stem_r = S * 0.028
    # vertical stem rising above the tallest bar
    vmask = rounded_rect_mask(
        S, S, cx=plus_x, cy=plus_top - stem_h / 2.0,
        rw=stem_w, rh=stem_h, radius=stem_r,
    )
    # horizontal stem crossing the emerald bar top (forms the +)
    hmask = rounded_rect_mask(
        S, S, cx=plus_x, cy=plus_top - S * 0.015,
        rw=S * 0.22, rh=stem_w, radius=stem_r,
    )
    plus_mask = np.clip(vmask + hmask, 0, 1)
    layer = np.zeros((S, S, 4), dtype=np.float64)
    layer[..., 0] = WHITE[0]
    layer[..., 1] = WHITE[1]
    layer[..., 2] = WHITE[2]
    layer[..., 3] = plus_mask * 255.0
    arr = blend_rgba(arr, layer)

    # ---- Growth arc (thin upward arc under the bars) -----------------------
    # A subtle arc suggesting upward trajectory / rocket path.
    arc = _render_arc(S, white=(mode != "color"))
    arr = blend_rgba(arr, arc)

    return arr


def _render_arc(size, white=False):
    """Render a thin upward-sloping arc behind/around the bars."""
    S = size
    layer = np.zeros((S, S, 4), dtype=np.float64)
    # parametric arc from bottom-left to top-right, curving up
    n = 400
    x0, y0 = S * 0.10, S * 0.78
    x1, y1 = S * 0.92, S * 0.24
    t = np.linspace(0, 1, n)
    x = x0 + (x1 - x0) * t
    # quadratic bezier with control point above
    ctrl_x = (x0 + x1) / 2.0
    ctrl_y = S * 0.30
    y = (
        (1 - t) ** 2 * y0
        + 2 * (1 - t) * t * ctrl_y
        + t**2 * y1
    )
    # stroke width
    sw = S * 0.035
    yy, xx = np.mgrid[0:S, 0:S].astype(float)
    # distance from each pixel to the curve (approx via sampling nearest point)
    dist = np.full((S, S), 1e9, dtype=np.float64)
    for i in range(n):
        d = np.sqrt((xx - x[i]) ** 2 + (yy - y[i]) ** 2)
        np.minimum(dist, d, out=dist)
    cov = 1.0 - smoothstep(sw / 2.0 - 0.8, sw / 2.0 + 0.8, dist)
    # gentle white, mostly under the bars
    col = (255, 255, 255, 255)
    layer[..., 0] = col[0]
    layer[..., 1] = col[1]
    layer[..., 2] = col[2]
    layer[..., 3] = cov * 255.0 * 0.9
    return layer


def save_float_rgba(arr, path):
    """Convert float RGBA array to an 8-bit PNG and save."""
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    img.save(path)
    print(f"  wrote {path} ({img.size[0]}x{img.size[1]})")


def downscale(arr, factor):
    """Box downsample float array by integer factor."""
    h, w = arr.shape[:2]
    nh, nw = h // factor, w // factor
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    img = img.resize((nw, nh), Image.BOX)
    return np.asarray(img, dtype=np.float64)


def squircle_mask(size, radius_frac=0.20):
    """Rounded-square (squircle-ish) mask, inset a bit, for full-bleed icons."""
    S = size
    y, x = np.mgrid[0:S, 0:S].astype(float)
    r = S * radius_frac
    x0, x1 = S * 0.08, S * 0.92
    y0, y1 = S * 0.08, S * 0.92
    cx, cy = S / 2, S / 2
    rw, rh = x1 - x0, y1 - y0
    # rounded rect coverage
    qx = np.abs(x - cx) - (rw / 2.0 - r)
    qy = np.abs(y - cy) - (rh / 2.0 - r)
    dist = -np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2)
    inside_rr = (np.abs(x - cx) <= rw / 2.0) & (np.abs(y - cy) <= rh / 2.0)
    # distance for pixels inside the straight middle
    d = np.where(
        (np.abs(x - cx) < rw / 2.0 - r) & (np.abs(y - cy) < rh / 2.0 - r),
        -1.0,
        dist,
    )
    cov = 1.0 - smoothstep(-0.5, 0.5, d)
    cov[(x < x0) | (x > x1) | (y < y0) | (y > y1)] = 0.0
    return np.clip(cov, 0, 1)


def main():
    print("Rendering Emprende+ logo set...")

    # Render the transparent brand mark at high resolution (supersampled).
    SS = 2048
    mark = render_mark(SS, mode="color")
    white_mark = render_mark(SS, mode="white")

    # ---- 1. App icon (full-bleed, indigo diagonal gradient + WHITE mark) ---
    grad = gradient_horizontal(SS, INDIGO, VIOLET)
    # subtle emerald glow at bottom-right corner
    glow = canvas(SS)
    yy, xx = np.mgrid[0:SS, 0:SS].astype(float)
    gd = np.sqrt((xx - SS * 1.05) ** 2 + (yy - SS * 1.05) ** 2)
    g_cov = 1.0 - smoothstep(SS * 0.15, SS * 1.3, gd)
    glow[..., 0] = EMERALD[0]
    glow[..., 1] = EMERALD[1]
    glow[..., 2] = EMERALD[2]
    glow[..., 3] = g_cov * 255.0 * 0.30
    bg = blend_rgba(grad, glow)

    # white mark on the gradient background for strong contrast
    icon = blend_rgba(bg, white_mark)
    save_float_rgba(downscale(icon, 2), os.path.join(OUT, "icon.png"))

    # ---- 2. splash-icon: transparent mark on transparent bg --------------
    # Splash background is indigo (#6366F1) in app.json, so use the WHITE mark.
    splash = downscale(white_mark, 2)  # 1024
    save_float_rgba(splash, os.path.join(OUT, "splash-icon.png"))

    # ---- 3. favicon (transparent) ----------------------------------------
    fav = downscale(mark, SS // 64)
    save_float_rgba(fav, os.path.join(OUT, "favicon.png"))

    # ---- 4. Android adaptive foreground (white mark, centered in safe zone)
    # Background is solid indigo, so use the WHITE mark for contrast.
    fg = canvas(1024)
    _paste_scaled(fg, white_mark, scale=0.72)
    save_float_rgba(fg, os.path.join(OUT, "android-icon-foreground.png"))

    # ---- 5. Android adaptive background (indigo->violet diagonal gradient) --
    bg_img = gradient_horizontal(1024, INDIGO, VIOLET)
    save_float_rgba(bg_img, os.path.join(OUT, "android-icon-background.png"))

    # ---- 6. Android monochrome (single-color mark on transparent) ----------
    mono = canvas(1024)
    _paste_scaled(mono, white_mark, scale=0.72)
    # flatten to pure white glyph (keep alpha shape)
    alpha = mono[..., 3:4] / 255.0
    mono[..., 0:3] = 255.0
    mono[..., 3:4] = alpha * 255.0
    save_float_rgba(mono, os.path.join(OUT, "android-icon-monochrome.png"))

    # ---- 7. Reusable logo-mark (transparent, 1024) -------------------------
    save_float_rgba(downscale(mark, 2), os.path.join(OUT, "logo-mark.png"))

    print("Done.")


def _paste_scaled(canvas_arr, mark_arr, scale):
    """Paste a downscaled copy of mark_arr centered into canvas_arr."""
    from PIL import Image as _I
    S = canvas_arr.shape[0]
    size = int(S * scale)
    mimg = _I.fromarray(np.clip(mark_arr, 0, 255).astype(np.uint8), "RGBA")
    mimg = mimg.resize((size, size), Image.LANCZOS)
    marr = np.asarray(mimg, dtype=np.float64)
    ox, oy = (S - size) // 2, (S - size) // 2
    canvas_arr[oy:oy + size, ox:ox + size] = marr


if __name__ == "__main__":
    main()
