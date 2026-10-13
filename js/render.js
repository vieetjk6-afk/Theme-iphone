// Vẽ icon và hình nền dưới dạng SVG, rồi chuyển sang PNG bằng <canvas>.
window.TIS = window.TIS || {};

(function () {
  // ---------- Màu ----------
  function hexToRgb(hex) {
    let h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgbToHex(rgb) {
    return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
  }
  // Trộn hai màu, t = 0 -> a, t = 1 -> b.
  function mix(a, b, t) {
    const x = hexToRgb(a);
    const y = hexToRgb(b);
    return rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Số ngẫu nhiên có hạt giống: cùng seed -> cùng họa tiết hình nền.
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const f = (n) => Math.round(n * 100) / 100;

  // ---------- Biểu tượng bên trong icon ----------
  // glyph là tên trong TIS.GLYPHS, hoặc "text:<chữ/emoji>".
  function glyphMarkup(glyph, icon, box) {
    const color = icon.glyph;
    if (glyph && glyph.startsWith('text:')) {
      const text = glyph.slice(5).trim() || '?';
      const len = Array.from(text).length;
      const size = box * (len > 2 ? 0.5 : len > 1 ? 0.66 : 0.92);
      return (
        `<text x="50" y="50" text-anchor="middle" dominant-baseline="central" ` +
        `font-family="-apple-system, 'SF Pro Rounded', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" ` +
        `font-weight="700" font-size="${f(size)}" fill="${color}">${esc(text)}</text>`
      );
    }
    const g = TIS.GLYPHS[glyph] || TIS.GLYPHS.star;
    // Logo thương hiệu vẽ sát mép khung 24px nên thu nhỏ lại cho cân với icon nét.
    const size = g.t === 'f' ? box * 0.86 : box;
    const o = 50 - size / 2;
    const tf = `translate(${f(o)} ${f(o)}) scale(${f(size / 24)})`;
    if (g.t === 'f') return `<g transform="${tf}" fill="${color}">${g.b}</g>`;
    return (
      `<g transform="${tf}" fill="none" stroke="${color}" stroke-width="${icon.stroke}" ` +
      `stroke-linecap="round" stroke-linejoin="round">${g.b}</g>`
    );
  }

  // ---------- Icon ----------
  // Vẽ kín cả hình vuông: iOS tự bo góc icon, phần trong suốt sẽ bị tô đen.
  function iconSVG(glyph, icon, px) {
    const { style, bg1, bg2, glyph: gc } = icon;
    let defs = '';
    let body = '';
    let box = 100 * icon.scale;

    if (style === 'solid') {
      body = `<rect width="100" height="100" fill="${bg1}"/>`;
    } else if (style === 'ring') {
      defs =
        `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>`;
      body =
        `<rect width="100" height="100" fill="url(#bg)"/>` +
        `<circle cx="50" cy="50" r="35" fill="none" stroke="${gc}" stroke-width="2.4" opacity="0.9"/>`;
      box *= 0.8;
    } else if (style === 'neon') {
      defs =
        `<radialGradient id="bg" cx="0.5" cy="0.45" r="0.75">` +
        `<stop offset="0" stop-color="${bg2}"/><stop offset="1" stop-color="${bg1}"/></radialGradient>` +
        `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">` +
        `<feGaussianBlur stdDeviation="2.4" result="b"/>` +
        `<feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
      body = `<rect width="100" height="100" fill="url(#bg)"/>`;
    } else if (style === 'glass') {
      // Kính: nền dọc, vệt sáng phía trên, viền sáng mảnh, biểu tượng có bóng nhẹ.
      defs =
        `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>` +
        `<radialGradient id="hl" cx="0.5" cy="0" r="0.9">` +
        `<stop offset="0" stop-color="#fff" stop-opacity="0.32"/><stop offset="0.6" stop-color="#fff" stop-opacity="0.05"/>` +
        `<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
        `<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.08"/>` +
        `<stop offset="1" stop-color="#fff" stop-opacity="0.28"/></linearGradient>` +
        `<filter id="ds" x="-30%" y="-30%" width="160%" height="160%">` +
        `<feDropShadow dx="0" dy="1.2" stdDeviation="1.4" flood-color="#000" flood-opacity="0.35"/></filter>`;
      body =
        `<rect width="100" height="100" fill="url(#bg)"/><rect width="100" height="100" fill="url(#hl)"/>` +
        `<rect x="2.5" y="2.5" width="95" height="95" rx="20" fill="none" stroke="url(#rim)" stroke-width="1.8"/>`;
    } else {
      // gradient (mặc định)
      defs =
        `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
        `<stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>` +
        `<radialGradient id="sheen" cx="0.3" cy="0.15" r="0.8">` +
        `<stop offset="0" stop-color="#fff" stop-opacity="0.28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
      body = `<rect width="100" height="100" fill="url(#bg)"/><rect width="100" height="100" fill="url(#sheen)"/>`;
    }

    let glyphPart = glyphMarkup(glyph, icon, box);
    if (style === 'neon') glyphPart = `<g filter="url(#glow)">${glyphPart}</g>`;
    if (style === 'glass') glyphPart = `<g filter="url(#ds)">${glyphPart}</g>`;

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 100 100">` +
      (defs ? `<defs>${defs}</defs>` : '') +
      body +
      glyphPart +
      `</svg>`
    );
  }

  // ---------- Hình nền ----------
  function wallpaperSVG(wp, W, H, seed) {
    const rand = rng(seed);
    const { c1, c2, c3 } = wp;
    let defs = '';
    let body = '';

    if (wp.style === 'gradient') {
      defs =
        `<linearGradient id="lg" x1="0" y1="0" x2="0.3" y2="1">` +
        `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
        `<radialGradient id="g1"><stop offset="0" stop-color="${c3}" stop-opacity="0.55"/>` +
        `<stop offset="1" stop-color="${c3}" stop-opacity="0"/></radialGradient>`;
      body =
        `<rect width="${W}" height="${H}" fill="url(#lg)"/>` +
        `<circle cx="${f(W * (0.15 + rand() * 0.7))}" cy="${f(H * (0.1 + rand() * 0.2))}" r="${f(W * 0.9)}" fill="url(#g1)"/>` +
        `<circle cx="${f(W * (0.15 + rand() * 0.7))}" cy="${f(H * (0.75 + rand() * 0.2))}" r="${f(W * 0.7)}" fill="url(#g1)" opacity="0.6"/>`;
    } else if (wp.style === 'waves') {
      defs =
        `<linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${mix(c1, c2, 0.35)}"/></linearGradient>`;
      body = `<rect width="${W}" height="${H}" fill="url(#lg)"/>`;
      const N = 4;
      for (let i = 0; i < N; i++) {
        const base = H * (0.5 + i * 0.12);
        const amp = H * (0.025 + rand() * 0.025);
        const freq = 1 + rand() * 1.2;
        const phase = rand() * Math.PI * 2;
        let d = `M0 ${H} L0 ${f(base)}`;
        for (let s = 0; s <= 48; s++) {
          const x = (W * s) / 48;
          const y = base + Math.sin((s / 48) * Math.PI * 2 * freq + phase) * amp;
          d += ` L${f(x)} ${f(y)}`;
        }
        d += ` L${W} ${H} Z`;
        body += `<path d="${d}" fill="${mix(c2, c3, i / (N - 1))}" opacity="${f(0.55 + i * 0.15)}"/>`;
      }
    } else if (wp.style === 'dots') {
      const s = W / 14;
      defs =
        `<linearGradient id="lg" x1="0" y1="0" x2="0.4" y2="1">` +
        `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` +
        `<pattern id="dots" width="${f(s)}" height="${f(s)}" patternUnits="userSpaceOnUse">` +
        `<circle cx="${f(s / 2)}" cy="${f(s / 2)}" r="${f(s * 0.08)}" fill="${c3}" opacity="0.3"/></pattern>` +
        `<radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity="0.5"/>` +
        `<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
      body =
        `<rect width="${W}" height="${H}" fill="url(#lg)"/>` +
        `<rect width="${W}" height="${H}" fill="url(#dots)"/>` +
        `<circle cx="${f(W * (0.2 + rand() * 0.6))}" cy="${f(H * (0.15 + rand() * 0.3))}" r="${f(W * 0.8)}" fill="url(#glow)"/>`;
    } else if (wp.style === 'mist') {
      // Sương mù: tối ở trên, sáng dần xuống dưới, một quầng sáng mềm và viền tối nhẹ.
      const gx = 0.35 + rand() * 0.3;
      const gy = 0.58 + rand() * 0.1;
      defs =
        `<linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${c1}"/><stop offset="0.3" stop-color="${mix(c1, c2, 0.35)}"/>` +
        `<stop offset="0.75" stop-color="${c2}"/><stop offset="1" stop-color="${mix(c2, c1, 0.3)}"/></linearGradient>` +
        `<radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="${f(W * gx)}" cy="${f(H * gy)}" r="${f(W * 0.95)}" ` +
        `gradientTransform="translate(${f(W * gx)} ${f(H * gy)}) scale(1.1 0.75) translate(${f(-W * gx)} ${f(-H * gy)})">` +
        `<stop offset="0" stop-color="${c3}" stop-opacity="0.38"/><stop offset="0.5" stop-color="${c3}" stop-opacity="0.14"/>` +
        `<stop offset="1" stop-color="${c3}" stop-opacity="0"/></radialGradient>` +
        `<radialGradient id="vig" cx="0.5" cy="0.5" r="0.8">` +
        `<stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></radialGradient>`;
      body =
        `<rect width="${W}" height="${H}" fill="url(#lg)"/>` +
        `<rect width="${W}" height="${H}" fill="url(#glow)"/>` +
        `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
    } else if (wp.style === 'ink') {
      // Vệt mực: nền than chì, vân đá mờ, giọt mực bóng xếp thành vòng quanh giữa màn hình.
      defs =
        `<radialGradient id="rg" cx="0.5" cy="0.42" r="0.8">` +
        `<stop offset="0" stop-color="${mix(c1, c3, 0.18)}"/><stop offset="1" stop-color="${c1}"/></radialGradient>` +
        `<filter id="soft"><feGaussianBlur stdDeviation="${f(W * 0.0012)}"/></filter>`;
      let veins = '';
      for (let v = 0; v < 6; v++) {
        let x = rand() * W;
        let y = rand() * H;
        let a = rand() * Math.PI * 2;
        let d = `M${f(x)} ${f(y)}`;
        for (let s = 0; s < 10; s++) {
          a += (rand() - 0.5) * 1.2;
          const len = W * (0.05 + rand() * 0.07);
          x += Math.cos(a) * len;
          y += Math.sin(a) * len;
          d += ` L${f(x)} ${f(y)}`;
        }
        veins += `<path d="${d}" stroke-width="${f(W * (0.0012 + rand() * 0.0013))}"/>`;
      }
      let drops = '';
      for (let i = 0; i < 150; i++) {
        let cx;
        let cy;
        if (rand() < 0.55) {
          const ang = rand() * Math.PI * 2;
          const rad = W * (0.26 + (rand() - 0.5) * 0.14);
          cx = W / 2 + Math.cos(ang) * rad;
          cy = H * 0.46 + Math.sin(ang) * rad * 1.15;
        } else {
          cx = rand() * W;
          cy = rand() * H;
        }
        const r = W * (0.0018 + 0.016 * rand() ** 3);
        drops += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${c2}" opacity="${f(0.75 + rand() * 0.25)}"/>`;
        if (r > W * 0.006) {
          drops += `<circle cx="${f(cx - r * 0.3)}" cy="${f(cy - r * 0.35)}" r="${f(r * 0.32)}" fill="${c3}" opacity="0.35"/>`;
        }
      }
      body =
        `<rect width="${W}" height="${H}" fill="url(#rg)"/>` +
        `<g fill="none" stroke="${c3}" stroke-linecap="round" opacity="0.1" filter="url(#soft)">${veins}</g>` +
        drops;
    } else {
      // blobs (mặc định): các mảng màu lớn làm mờ, kiểu "mesh gradient".
      defs =
        `<filter id="blur" filterUnits="userSpaceOnUse" x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}">` +
        `<feGaussianBlur stdDeviation="${f(W * 0.13)}"/></filter>`;
      const colors = [c2, c3, mix(c2, c3, 0.5), c2, c3];
      let circles = '';
      colors.forEach((c, i) => {
        const cx = W * (rand() * 1.1 - 0.05);
        const cy = H * (i / (colors.length - 1)) * 1.05 + H * (rand() - 0.5) * 0.15;
        const r = W * (0.32 + rand() * 0.3);
        circles += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${c}" opacity="0.85"/>`;
      });
      body = `<rect width="${W}" height="${H}" fill="${c1}"/><g filter="url(#blur)">${circles}</g>`;
    }

    // Dòng chữ tùy chọn ở giữa màn hình.
    const text = String(wp.text || '').trim();
    if (text) {
      const spacing = W * 0.025;
      body +=
        `<text x="${f(W / 2 + spacing / 2)}" y="${f(H * 0.5)}" text-anchor="middle" dominant-baseline="central" ` +
        `font-family="-apple-system, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" ` +
        `font-weight="700" font-size="${f(W * 0.06)}" letter-spacing="${f(spacing)}" fill="${c3}" opacity="0.6">${esc(text)}</text>`;
    }

    // Hạt nhiễu mịn cho nền xám, để ảnh không bị sọc màu.
    if (wp.style === 'mist' || wp.style === 'ink') {
      defs +=
        `<filter id="grain" x="0" y="0" width="100%" height="100%">` +
        `<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" seed="${seed % 1000}"/>` +
        `<feColorMatrix type="saturate" values="0"/></filter>`;
      body += `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.06"/>`;
    }

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      `<defs>${defs}</defs>${body}</svg>`
    );
  }

  // ---------- SVG -> PNG ----------
  function svgDataURL(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Trình duyệt không vẽ được ảnh SVG.'));
      img.src = src;
    });
  }

  async function rasterize(svg, w, h) {
    const img = await loadImage(svgDataURL(svg));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    // Safari đôi khi vẽ thiếu hiệu ứng mờ ở lần đầu, nên vẽ lại sau một nhịp.
    await new Promise((r) => setTimeout(r, 30));
    ctx.drawImage(img, 0, 0, w, h);
    return canvas;
  }

  function canvasToBlob(canvas, type = 'image/png', quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Không xuất được ảnh.'))), type, quality);
    });
  }

  TIS.render = { mix, esc, iconSVG, wallpaperSVG, svgDataURL, rasterize, canvasToBlob };
})();
