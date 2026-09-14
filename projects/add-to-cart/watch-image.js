// -------- generative watch illustrations, driven entirely by product data --------
// No image files: every product's picture is built at render time from its
// category / color / material / specifications / description in db.json.

const _watchImageCache = new Map();

function generateWatchImage(product) {
    if (!product) return "";
    const cacheKey = product.id ?? JSON.stringify(product);
    if (_watchImageCache.has(cacheKey)) return _watchImageCache.get(cacheKey);

    const svg = _buildWatchSvg(product);
    const dataUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    _watchImageCache.set(cacheKey, dataUri);
    return dataUri;
}

// ---------------- color handling ----------------

const _COLOR_HEX = {
    black: "#1a1a1a", white: "#ffffff", silver: "#c0c0c0", gold: "#d4af37",
    blue: "#2e4a7a", green: "#3f6b52", red: "#c23b3b", tan: "#d2b48c",
    graphite: "#4a4e55", slate: "#5c636b", brown: "#6b3e26", "rose gold": "#b76e79",
    purple: "#5c3a72", copper: "#a15c33", grey: "#808080", gray: "#808080",
    olive: "#556b2f", navy: "#1f2d4a", cream: "#f4ecd8", orange: "#c9752f",
    yellow: "#d4b83a", pink: "#c97a9a",
};
const _CHROMATIC = ["blue", "green", "red", "tan", "cream", "brown", "olive", "navy", "purple", "copper", "orange", "yellow", "pink"];

function _isChromatic(name) {
    if (!name) return false;
    const n = name.toLowerCase();
    return _CHROMATIC.some((c) => n.includes(c));
}

function _colorToHex(name) {
    if (!name) return "#8a8f97";
    const key = name.toLowerCase().trim();
    if (_COLOR_HEX[key]) return _COLOR_HEX[key];
    const found = Object.keys(_COLOR_HEX).find((k) => key.includes(k));
    return found ? _COLOR_HEX[found] : "#8a8f97";
}

function _hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4;
        }
        h /= 6;
    }
    return [h, s, l];
}

function _hslToHex(h, s, l) {
    const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function _shade(hex, amount) {
    const [h, s, l] = _hexToHsl(hex);
    return _hslToHex(h, s, Math.min(1, Math.max(0, l + amount)));
}

function _luminance(hex) {
    const [, , l] = _hexToHsl(hex);
    return l;
}

function _contrastFor(hex) {
    return _luminance(hex) > 0.55 ? "#20242b" : "#f1f3f5";
}

// ---------------- product data -> visual profile ----------------

function _resolvePalette(product) {
    const primary = product.color || "Silver";
    const secondary = (product.colors || []).find((c) => c !== primary);

    let caseColorName;
    if (_isChromatic(primary) && secondary && !_isChromatic(secondary)) {
        caseColorName = secondary;
    } else if (!_isChromatic(primary)) {
        caseColorName = primary;
    } else {
        caseColorName = "Silver";
    }

    const dialColorName = (product.specifications && product.specifications.dialColor) || primary;

    return {
        caseHex: _colorToHex(caseColorName),
        dialHex: _colorToHex(dialColorName),
        strapPrimaryHex: _colorToHex(primary),
    };
}

function _detectStrapStyle(product) {
    const strapMat = ((product.specifications && product.specifications.strapMaterial) || product.material || "").toLowerCase();
    if (strapMat.includes("mesh")) return "mesh";
    if (strapMat.includes("nylon")) return "nato";
    if (strapMat.includes("silicone") || strapMat.includes("rubber") || strapMat.includes("resin")) return "rubber-holes";
    if (strapMat.includes("steel") || strapMat.includes("titanium") || strapMat.includes("bracelet")) return "metal";
    return "leather";
}

function _detectProfile(product) {
    const text = [
        product.name, product.description, product.material,
        (product.keyPoints || []).join(" "),
    ].join(" ").toLowerCase();

    const category = (product.category || "").toLowerCase();
    const hasDisplaySpec = !!(product.specifications && product.specifications.display);
    const isSmart = category === "smart";
    const isHybrid = hasDisplaySpec && !isSmart && /analog-digital|hybrid/.test(text);
    const isDigital = hasDisplaySpec && !isSmart && !isHybrid;
    const isTank = /\btank\b|rectangular case/.test(text) && !isSmart;
    const isDive = /\bdive|diver|bezel|submariner|promaster\b/.test(text);
    const isChrono = /chronograph|chrono\b/.test(text);

    let shape = "round";
    if (isSmart) shape = /apple/.test((product.brand || "").toLowerCase()) ? "square-smart" : "round-smart";
    else if (isHybrid) shape = "hybrid";
    else if (isDigital) shape = "digital";
    else if (isTank) shape = "tank";

    return { shape, isDive, isChrono };
}

// ---------------- shared strap + tick markup ----------------

function _strapMarkup(style, color, accent) {
    const top = { x: 160, y: 20, w: 80, h: 150 };
    const bot = { x: 160, y: 330, w: 80, h: 150 };
    const rects = [
        `<rect x="${bot.x}" y="${bot.y}" width="${bot.w}" height="${bot.h}" rx="14" fill="${color}"/>`,
        `<rect x="${top.x}" y="${top.y}" width="${top.w}" height="${top.h}" rx="14" fill="${color}"/>`,
    ];

    if (style === "leather") {
        rects.push(
            `<rect x="172" y="35" width="56" height="1.5" fill="${accent}"/><rect x="172" y="150" width="56" height="1.5" fill="${accent}"/>`,
            `<rect x="172" y="350" width="56" height="1.5" fill="${accent}"/><rect x="172" y="465" width="56" height="1.5" fill="${accent}"/>`
        );
    } else if (style === "metal") {
        for (let y = 30; y < 165; y += 14) rects.push(`<rect x="160" y="${y}" width="80" height="3" fill="${accent}"/>`);
        for (let y = 335; y < 475; y += 14) rects.push(`<rect x="160" y="${y}" width="80" height="3" fill="${accent}"/>`);
        rects.push(`<rect x="197" y="20" width="6" height="150" fill="${accent}" opacity="0.5"/>`);
        rects.push(`<rect x="197" y="330" width="6" height="150" fill="${accent}" opacity="0.5"/>`);
    } else if (style === "mesh") {
        for (let y = 26; y < 168; y += 8) rects.push(`<rect x="164" y="${y}" width="72" height="2" fill="${accent}" opacity="0.6"/>`);
        for (let y = 336; y < 478; y += 8) rects.push(`<rect x="164" y="${y}" width="72" height="2" fill="${accent}" opacity="0.6"/>`);
    } else if (style === "rubber-holes") {
        for (let i = 0; i < 4; i++) {
            rects.push(`<circle cx="200" cy="${55 + i * 25}" r="4" fill="${accent}"/>`);
            rects.push(`<circle cx="200" cy="${350 + i * 25}" r="4" fill="${accent}"/>`);
        }
    } else if (style === "nato") {
        [50, 90, 130].forEach((y) => rects.push(`<rect x="160" y="${y}" width="80" height="8" fill="${accent}"/>`));
        [360, 400, 440].forEach((y) => rects.push(`<rect x="160" y="${y}" width="80" height="8" fill="${accent}"/>`));
    }

    return rects.join("");
}

function _ticksMarkup(cx, cy, outer, ticks) {
    return Array.from({ length: 12 })
        .map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const inner = i % 3 === 0 ? outer - 16 : outer - 10;
            const x1 = cx + outer * Math.sin(angle);
            const y1 = cy - outer * Math.cos(angle);
            const x2 = cx + inner * Math.sin(angle);
            const y2 = cy - inner * Math.cos(angle);
            return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ticks}" stroke-width="${i % 3 === 0 ? 4 : 2.5}" stroke-linecap="round"/>`;
        })
        .join("");
}

// ---------------- svg templates ----------------

function _svgWrap(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
  <defs>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#soft)">${inner}</g>
</svg>`;
}

function _roundWatch({ strapHex, strapStyle, caseHex, dialHex, bezel, chrono }) {
    const cx = 200, cy = 250, caseR = 112;
    const hand = _contrastFor(dialHex);
    const ticks = hand;
    const caseLight = _shade(caseHex, 0.22), caseDark = _shade(caseHex, -0.18);
    const dialLight = _shade(dialHex, 0.1), dialDark = _shade(dialHex, -0.12);
    const strapAccent = _luminance(strapHex) > 0.5 ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.15)";
    const hasBezel = !!bezel;
    const dialR = hasBezel ? 86 : 96;
    const bezelHex = hasBezel ? _shade(dialHex, -0.3) : null;

    const bezelMarkup = hasBezel
        ? `<circle cx="${cx}" cy="${cy}" r="${caseR - 2}" fill="${bezelHex}"/>
           <circle cx="${cx}" cy="${cy}" r="${dialR + 6}" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5" stroke-dasharray="2 6"/>
           <polygon points="${cx - 7},${cy - caseR + 16} ${cx + 7},${cy - caseR + 16} ${cx},${cy - caseR + 2}" fill="#fff"/>`
        : "";

    const chronoMarkup = chrono
        ? `<circle cx="${cx - 30}" cy="${cy + 15}" r="15" fill="none" stroke="${ticks}" stroke-width="2" opacity="0.8"/>
           <line x1="${cx - 30}" y1="${cy + 15}" x2="${cx - 30}" y2="${cy + 5}" stroke="${ticks}" stroke-width="2"/>
           <circle cx="${cx + 30}" cy="${cy + 15}" r="15" fill="none" stroke="${ticks}" stroke-width="2" opacity="0.8"/>
           <line x1="${cx + 30}" y1="${cy + 15}" x2="${cx + 34}" y2="${cy + 26}" stroke="${ticks}" stroke-width="2"/>
           <circle cx="${cx}" cy="${cy - 32}" r="13" fill="none" stroke="${ticks}" stroke-width="2" opacity="0.8"/>`
        : "";

    return _svgWrap(`
    ${_strapMarkup(strapStyle, strapHex, strapAccent)}
    <circle cx="${cx}" cy="${cy}" r="${caseR}" fill="${caseHex}"/>
    <circle cx="${cx - 30}" cy="${cy - 40}" r="${caseR - 20}" fill="${caseLight}" opacity="0.35"/>
    <circle cx="${cx}" cy="${cy}" r="${caseR}" fill="none" stroke="${caseDark}" stroke-width="3"/>
    <rect x="392" y="235" width="14" height="30" rx="4" fill="${caseDark}"/>
    ${bezelMarkup}
    <circle cx="${cx}" cy="${cy}" r="${dialR}" fill="${dialHex}"/>
    <circle cx="${cx - 20}" cy="${cy - 25}" r="${dialR - 20}" fill="${dialLight}" opacity="0.25"/>
    ${_ticksMarkup(cx, cy, dialR - 4, ticks)}
    ${chronoMarkup}
    <line x1="${cx}" y1="${cy}" x2="${cx - 14}" y2="${cy - 46}" stroke="${hand}" stroke-width="6" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${cx + 38}" y2="${cy + 20}" stroke="${hand}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="7" fill="${hand}"/>
  `);
}

function _roundSmartWatch({ strapHex, strapStyle, caseHex }) {
    const cx = 200, cy = 250;
    const accent = _shade(caseHex, 0.55);
    const screen = _shade(caseHex, -0.32);
    const strapAccent = _luminance(strapHex) > 0.5 ? "rgba(0,0,0,.3)" : "rgba(255,255,255,.15)";

    return _svgWrap(`
    ${_strapMarkup(strapStyle, strapHex, strapAccent)}
    <circle cx="${cx}" cy="${cy}" r="112" fill="${caseHex}"/>
    <circle cx="${cx}" cy="${cy}" r="112" fill="none" stroke="${_shade(caseHex, -0.2)}" stroke-width="3"/>
    <rect x="392" y="235" width="10" height="26" rx="3" fill="${_shade(caseHex, -0.2)}"/>
    <circle cx="${cx}" cy="${cy}" r="94" fill="${screen}"/>
    <circle cx="${cx}" cy="${cy - 20}" r="18" fill="none" stroke="${accent}" stroke-width="3"/>
    <rect x="${cx - 44}" y="${cy + 10}" width="88" height="8" rx="4" fill="${accent}" opacity="0.85"/>
    <rect x="${cx - 44}" y="${cy + 26}" width="60" height="8" rx="4" fill="${accent}" opacity="0.5"/>
    <rect x="${cx - 44}" y="${cy + 50}" width="88" height="26" rx="6" fill="${accent}" opacity="0.15"/>
  `);
}

function _squareSmartWatch({ strapHex, caseHex }) {
    const accent = _shade(caseHex, 0.55);
    const screen = _shade(caseHex, -0.32);
    return _svgWrap(`
    <rect x="165" y="15" width="70" height="160" rx="18" fill="${strapHex}"/>
    <rect x="165" y="325" width="70" height="160" rx="18" fill="${strapHex}"/>
    <rect x="120" y="150" width="160" height="200" rx="34" fill="${caseHex}"/>
    <rect x="120" y="150" width="160" height="200" rx="34" fill="none" stroke="${_shade(caseHex, -0.2)}" stroke-width="3"/>
    <rect x="136" y="166" width="128" height="168" rx="22" fill="${screen}"/>
    <circle cx="200" cy="215" r="16" fill="none" stroke="${accent}" stroke-width="3"/>
    <rect x="156" y="248" width="88" height="8" rx="4" fill="${accent}" opacity="0.85"/>
    <rect x="156" y="264" width="60" height="8" rx="4" fill="${accent}" opacity="0.5"/>
    <rect x="156" y="290" width="88" height="30" rx="6" fill="${accent}" opacity="0.15"/>
    <rect x="288" y="225" width="10" height="26" rx="3" fill="${_shade(caseHex, -0.2)}"/>
  `);
}

function _digitalWatch({ strapHex, strapStyle, caseHex }) {
    const strapAccent = "rgba(0,0,0,.3)";
    return _svgWrap(`
    ${_strapMarkup(strapStyle, strapHex, strapAccent)}
    <rect x="118" y="168" width="164" height="164" rx="26" fill="${caseHex}"/>
    <rect x="118" y="168" width="164" height="164" rx="26" fill="none" stroke="${_shade(caseHex, -0.2)}" stroke-width="3"/>
    <rect x="98" y="228" width="18" height="30" rx="4" fill="${_shade(caseHex, -0.2)}"/>
    <rect x="284" y="228" width="18" height="30" rx="4" fill="${_shade(caseHex, -0.2)}"/>
    <rect x="140" y="192" width="120" height="116" rx="8" fill="#8fae6b"/>
    <text x="200" y="245" font-family="monospace" font-size="30" font-weight="700" fill="#1c1f16" text-anchor="middle">10:08</text>
    <text x="200" y="270" font-family="monospace" font-size="14" fill="#1c1f16" text-anchor="middle" opacity="0.8">TUE 12</text>
    <rect x="155" y="285" width="90" height="6" fill="#1c1f16" opacity="0.5"/>
  `);
}

function _hybridDigital({ strapHex, caseHex, dialHex }) {
    const cx = 200, cy = 250;
    const accent = _contrastFor(_shade(dialHex, -0.4));
    return _svgWrap(`
    ${_strapMarkup("rubber-holes", strapHex, "rgba(0,0,0,.35)")}
    <polygon points="200,120 272,150 300,222 280,300 240,368 160,368 120,300 100,222 128,150" fill="${caseHex}"/>
    <polygon points="200,120 272,150 300,222 280,300 240,368 160,368 120,300 100,222 128,150" fill="none" stroke="${_shade(caseHex, -0.2)}" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="88" fill="${_shade(dialHex, -0.35)}"/>
    ${_ticksMarkup(cx, cy, 82, accent)}
    <rect x="170" y="270" width="60" height="20" rx="4" fill="${accent}" opacity="0.9"/>
    <line x1="${cx}" y1="${cy}" x2="${cx - 10}" y2="${cy - 36}" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${cx + 28}" y2="${cy + 14}" stroke="${accent}" stroke-width="4" stroke-linecap="round"/>
  `);
}

function _tankWatch({ strapHex, caseHex, dialHex }) {
    const hand = _contrastFor(dialHex);
    return _svgWrap(`
    <rect x="172" y="10" width="56" height="165" rx="10" fill="${strapHex}"/>
    <rect x="172" y="325" width="56" height="165" rx="10" fill="${strapHex}"/>
    <rect x="150" y="150" width="100" height="200" rx="16" fill="${caseHex}"/>
    <rect x="150" y="150" width="100" height="200" rx="16" fill="none" stroke="${_shade(caseHex, -0.2)}" stroke-width="3"/>
    <rect x="164" y="164" width="72" height="172" rx="4" fill="${dialHex}"/>
    <line x1="200" y1="180" x2="200" y2="196" stroke="${hand}" stroke-width="3"/>
    <line x1="200" y1="304" x2="200" y2="320" stroke="${hand}" stroke-width="3"/>
    <line x1="178" y1="250" x2="190" y2="250" stroke="${hand}" stroke-width="3"/>
    <line x1="210" y1="250" x2="222" y2="250" stroke="${hand}" stroke-width="3"/>
    <line x1="200" y1="250" x2="200" y2="215" stroke="${hand}" stroke-width="5" stroke-linecap="round"/>
    <line x1="200" y1="250" x2="222" y2="260" stroke="${hand}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="200" cy="250" r="5" fill="${hand}"/>
  `);
}

// ---------------- entry point ----------------

function _buildWatchSvg(product) {
    const { caseHex, dialHex, strapPrimaryHex } = _resolvePalette(product);
    const strapStyle = _detectStrapStyle(product);
    const profile = _detectProfile(product);
    const strapHex = strapStyle === "metal" ? caseHex : strapPrimaryHex;

    switch (profile.shape) {
        case "square-smart":
            return _squareSmartWatch({ strapHex, caseHex });
        case "round-smart":
            return _roundSmartWatch({ strapHex, strapStyle, caseHex });
        case "hybrid":
            return _hybridDigital({ strapHex, caseHex, dialHex });
        case "digital":
            return _digitalWatch({ strapHex, strapStyle, caseHex });
        case "tank":
            return _tankWatch({ strapHex, caseHex, dialHex });
        default:
            return _roundWatch({ strapHex, strapStyle, caseHex, dialHex, bezel: profile.isDive, chrono: profile.isChrono });
    }
}
