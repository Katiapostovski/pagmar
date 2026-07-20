/* =====================================================
   PAGMAR — Signal Field Visual Library
   10 procedural canvas drawing functions.
   All elements are dark, optical, poetic.
   No stars, no sparkles, no horoscope aesthetics.
   ===================================================== */

// ── Color Temperature Palettes ────────────────────────
const SEASON_PALETTES = {
    Spring: {
        primary:   [160, 220, 210],  // pale cyan-mint
        secondary: [120, 200, 180],  // soft green-blue
        accent:    [200, 240, 230],  // near white with green
        rgbR: [180, 240, 200], rgbG: [140, 220, 210], rgbB: [100, 180, 230]
    },
    Summer: {
        primary:   [220, 190, 120],  // warm gold
        secondary: [80,  120, 200],  // deep blue
        accent:    [240, 210, 150],  // pale gold
        rgbR: [240, 180, 80],  rgbG: [140, 200, 160], rgbB: [60, 100, 220]
    },
    Autumn: {
        primary:   [200, 140, 80],   // amber
        secondary: [140, 80,  180],  // violet
        accent:    [220, 160, 100],  // warm amber
        rgbR: [220, 120, 60],  rgbG: [160, 120, 100], rgbB: [120, 60, 180]
    },
    Winter: {
        primary:   [160, 180, 240],  // cold blue-silver
        secondary: [200, 210, 230],  // silver
        accent:    [220, 225, 245],  // near white cold
        rgbR: [200, 180, 240], rgbG: [180, 200, 230], rgbB: [120, 140, 255]
    }
};

function getPalette(season) {
    return SEASON_PALETTES[season] || SEASON_PALETTES.Winter;
}

function rgba(col, a) {
    return `rgba(${col[0]},${col[1]},${col[2]},${a})`;
}

// ── 1. LightFragment ──────────────────────────────────
// A short sharp refracted fragment. The basic atom of the field.
function LightFragment(ctx, { x, y, scale = 1, rotation = 0, opacity = 1, palette, reveal = 1, intensity = 1 }) {
    if (reveal <= 0 || opacity <= 0) return;
    const r = reveal;
    const len = (8 + scale * 14) * r;
    const w = (0.5 + scale * 0.8);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity * r;

    // Main fragment line
    ctx.strokeStyle = rgba(palette.primary, 0.85 * intensity);
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(-len * 0.5, 0);
    ctx.lineTo(len * 0.5, 0);
    ctx.stroke();

    // RGB split — chromatic aberration
    ctx.globalAlpha = opacity * r * 0.35;
    ctx.strokeStyle = rgba(palette.rgbR, 0.9);
    ctx.lineWidth = w * 0.6;
    ctx.beginPath();
    ctx.moveTo(-len * 0.5 + 1.2, -0.8);
    ctx.lineTo(len * 0.5 + 1.2, -0.8);
    ctx.stroke();

    ctx.strokeStyle = rgba(palette.rgbB, 0.9);
    ctx.beginPath();
    ctx.moveTo(-len * 0.5 - 1.2, 0.8);
    ctx.lineTo(len * 0.5 - 1.2, 0.8);
    ctx.stroke();

    ctx.restore();
}

// ── 2. ThinLightLine ─────────────────────────────────
// A delicate line, sometimes broken or fading at the end.
function ThinLightLine(ctx, { x1, y1, x2, y2, opacity = 1, palette, reveal = 1, broken = false }) {
    if (reveal <= 0 || opacity <= 0) return;

    const dx = x2 - x1, dy = y2 - y1;
    const ex = x1 + dx * reveal;
    const ey = y1 + dy * reveal;

    ctx.save();
    ctx.globalAlpha = opacity;

    if (broken) {
        // Draw as dashes
        ctx.setLineDash([3, 7 + Math.random() * 8]);
    }

    const grad = ctx.createLinearGradient(x1, y1, ex, ey);
    grad.addColorStop(0,   rgba(palette.primary, 0.7));
    grad.addColorStop(0.6, rgba(palette.secondary, 0.4));
    grad.addColorStop(1,   rgba(palette.primary, 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

// ── 3. DirectionalTrace ──────────────────────────────
// A longer diagonal trace. Suggests movement, direction, searching.
function DirectionalTrace(ctx, { x, y, angle = 0, length = 120, opacity = 1, palette, reveal = 1 }) {
    if (reveal <= 0 || opacity <= 0) return;

    const traceLen = length * reveal;
    const ex = x + Math.cos(angle) * traceLen;
    const ey = y + Math.sin(angle) * traceLen;

    ctx.save();
    ctx.globalAlpha = opacity;

    const grad = ctx.createLinearGradient(x, y, ex, ey);
    grad.addColorStop(0,    rgba(palette.accent, 0.0));
    grad.addColorStop(0.15, rgba(palette.primary, 0.65));
    grad.addColorStop(0.7,  rgba(palette.secondary, 0.3));
    grad.addColorStop(1,    rgba(palette.primary, 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Faint parallel offset line (chromatic aberration)
    ctx.globalAlpha = opacity * 0.2;
    ctx.strokeStyle = rgba(palette.rgbB, 0.8);
    ctx.lineWidth = 0.4;
    const perpX = Math.sin(angle) * 1.5;
    const perpY = -Math.cos(angle) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x + perpX, y + perpY);
    ctx.lineTo(ex + perpX, ey + perpY);
    ctx.stroke();

    ctx.restore();
}

// ── 4. LuminousIntersection ──────────────────────────
// A subtle optical joint where lines meet. Not a star.
function LuminousIntersection(ctx, { x, y, scale = 1, opacity = 1, palette, reveal = 1, intensity = 1 }) {
    if (reveal <= 0 || opacity <= 0) return;

    const r = scale * 14 * reveal;
    ctx.save();
    ctx.globalAlpha = opacity;

    // Core glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0,   rgba(palette.accent, 0.6 * intensity));
    glow.addColorStop(0.4, rgba(palette.primary, 0.18 * intensity));
    glow.addColorStop(1,   rgba(palette.primary, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Tiny bright center point
    ctx.globalAlpha = opacity * reveal * 0.9 * intensity;
    ctx.fillStyle = rgba(palette.accent, 1);
    ctx.beginPath();
    ctx.arc(x, y, scale * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Cross hair lines — very thin
    ctx.globalAlpha = opacity * reveal * 0.25;
    ctx.strokeStyle = rgba(palette.primary, 0.8);
    ctx.lineWidth = 0.5;
    const armLen = scale * 20 * reveal;
    [[1,0],[0,1],[0.7,0.7],[-0.7,0.7]].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(x - cx * armLen, y - cy * armLen);
        ctx.lineTo(x + cx * armLen, y + cy * armLen);
        ctx.stroke();
    });

    ctx.restore();
}

// ── 5. SoftHalo ──────────────────────────────────────
// A blurred area of light. Shows presence, memory, attention.
function SoftHalo(ctx, { x, y, radius = 60, opacity = 1, palette, intensity = 0.5 }) {
    if (opacity <= 0) return;
    ctx.save();
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0,   rgba(palette.primary, 0.12 * intensity));
    glow.addColorStop(0.5, rgba(palette.secondary, 0.05 * intensity));
    glow.addColorStop(1,   rgba(palette.primary, 0));
    ctx.fillStyle = glow;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ── 6. RGBShard ──────────────────────────────────────
// A small prismatic fragment with spectral edges. Light diffraction.
function RGBShard(ctx, { x, y, scale = 1, rotation = 0, opacity = 1, palette, reveal = 1 }) {
    if (reveal <= 0 || opacity <= 0) return;

    const s = scale * reveal;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity * reveal;

    // Three offset rectangles — R G B
    const offsets = [
        { col: palette.rgbR, dx: -1.5, dy: -1.0 },
        { col: palette.rgbG, dx:  0.5, dy:  0.5 },
        { col: palette.rgbB, dx:  1.5, dy: -0.5 },
    ];
    offsets.forEach(({ col, dx, dy }) => {
        ctx.globalAlpha = opacity * reveal * 0.4;
        ctx.fillStyle = rgba(col, 0.85);
        const hw = s * 2.5, hh = s * 6;
        ctx.fillRect(dx - hw, dy - hh, hw * 2, hh * 2);
    });

    // White center
    ctx.globalAlpha = opacity * reveal * 0.7;
    ctx.fillStyle = rgba(palette.accent, 0.9);
    ctx.fillRect(-s, -s * 3, s * 2, s * 6);

    ctx.restore();
}

// ── 7. BrokenPath ────────────────────────────────────
// A dotted/fragmented path made of thin lines and small shards.
function BrokenPath(ctx, { points, opacity = 1, palette, reveal = 1 }) {
    if (reveal <= 0 || opacity <= 0 || points.length < 2) return;

    const totalSegs = points.length - 1;
    const revealedSegs = reveal * totalSegs;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.setLineDash([4, 10, 2, 14]);
    ctx.strokeStyle = rgba(palette.primary, 0.4);
    ctx.lineWidth = 0.6;

    for (let i = 0; i < totalSegs; i++) {
        const segReveal = clamp(revealedSegs - i, 0, 1);
        if (segReveal <= 0) break;
        const p1 = points[i], p2 = points[i + 1];
        const ex = p1.x + (p2.x - p1.x) * segReveal;
        const ey = p1.y + (p2.y - p1.y) * segReveal;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
}

// ── 8. VerticalLightCut ──────────────────────────────
// A thin vertical slit of light. A reveal marker, an opening.
function VerticalLightCut(ctx, { x, y, height = 40, opacity = 1, palette, reveal = 1 }) {
    if (reveal <= 0 || opacity <= 0) return;

    const h = height * reveal;
    ctx.save();
    ctx.globalAlpha = opacity;

    const grad = ctx.createLinearGradient(x, y - h / 2, x, y + h / 2);
    grad.addColorStop(0,   rgba(palette.primary, 0));
    grad.addColorStop(0.5, rgba(palette.accent, 0.8));
    grad.addColorStop(1,   rgba(palette.primary, 0));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x, y + h / 2);
    ctx.stroke();

    // Tiny horizontal cross at center
    ctx.globalAlpha = opacity * reveal * 0.4;
    ctx.strokeStyle = rgba(palette.accent, 0.6);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - 6 * reveal, y);
    ctx.lineTo(x + 6 * reveal, y);
    ctx.stroke();

    ctx.restore();
}

// ── 9. ResidualTrace ─────────────────────────────────
// A fading trail left by movement. Shows the user was here.
function ResidualTrace(ctx, { points, opacity = 1, palette }) {
    if (!points || points.length < 2 || opacity <= 0) return;
    ctx.save();
    for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const age = p1.age; // 0 = fresh, 1 = old
        ctx.globalAlpha = opacity * (1 - age) * 0.35;
        ctx.strokeStyle = rgba(palette.secondary, 0.7);
        ctx.lineWidth = 0.5 * (1 - age);
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
    }
    ctx.restore();
}

// ── 10. TextWhisper ──────────────────────────────────
// A short, quiet piece of poetic text near a revealed area.
function TextWhisper(ctx, { x, y, text, opacity = 1, fontSize = 11 }) {
    if (opacity <= 0 || !text) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = `300 ${fontSize}px 'SimplerMono', 'Inconsolata', monospace`;
    ctx.fillStyle = `rgba(200, 210, 225, ${opacity})`;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.1em';
    // Draw line by line
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        ctx.fillText(line, x, y + i * (fontSize * 1.6));
    });
    ctx.restore();
}
