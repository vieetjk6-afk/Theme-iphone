// Giao diện Theme iPhone Studio: lưu lựa chọn, vẽ xem trước, xuất file.
(function () {
  const R = TIS.render;
  const X = TIS.exporter;
  const STORE_KEY = 'theme-iphone-studio:v1';
  const BLANK_LABEL = '⠀'; // ký tự chữ nổi trống: iOS hiện như không có tên
  const PROFILE_PX = 180; // cỡ Apple khuyên dùng cho icon web clip
  const SHORTCUT_PX = 512;
  const $ = (id) => document.getElementById(id);

  // ---------- Trạng thái ----------
  function defaults() {
    const p = TIS.PRESETS[0];
    return {
      preset: p.id,
      name: p.name,
      icon: { ...p.icon },
      wallpaper: { ...p.wallpaper },
      seed: 7,
      device: '1206x2622',
      hideLabels: false,
      widgets: !!p.widgets,
      selected: Object.fromEntries(TIS.APPS.map((a) => [a.id, !!a.on])),
      labels: {},
      schemes: {},
      custom: [],
    };
  }

  function load() {
    const d = defaults();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return d;
      const s = JSON.parse(raw);
      return {
        ...d,
        ...s,
        icon: { ...d.icon, ...s.icon },
        wallpaper: { ...d.wallpaper, ...s.wallpaper },
        selected: { ...d.selected, ...s.selected },
      };
    } catch (e) {
      return d;
    }
  }

  // Trên iPhone, Safari cho biết độ phân giải màn hình -> tự chọn đúng đời máy.
  function detectDevice() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(Math.min(screen.width, screen.height) * dpr);
    const h = Math.round(Math.max(screen.width, screen.height) * dpr);
    const id = `${w}x${h}`;
    return TIS.DEVICES.some((d) => d.id === id) ? id : null;
  }

  let state = load();
  if (!state.deviceChosen) state.device = detectDevice() || state.device;

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      /* chế độ riêng tư: bỏ qua */
    }
  }

  function allApps() {
    const custom = state.custom.map((c) => ({ ...c, group: 'custom', custom: true }));
    return TIS.APPS.concat(custom).map((a) => {
      const scheme = a.id in state.schemes ? state.schemes[a.id] : a.scheme;
      return { ...a, label: state.labels[a.id] ?? a.name, scheme: scheme ? scheme.trim() : null };
    });
  }

  const selectedApps = () => allApps().filter((a) => state.selected[a.id]);

  function normalizeScheme(s) {
    s = String(s || '').trim();
    if (!s) return '';
    return s.includes(':') ? s : `${s}://`;
  }

  // ---------- Xem trước ----------
  const iconURL = (glyph, px) => R.svgDataURL(R.iconSVG(glyph, state.icon, px));

  function tile(app, inDock) {
    const el = document.createElement('div');
    el.className = 'tile';
    const img = document.createElement('img');
    img.alt = '';
    img.src = iconURL(app.glyph, 120);
    el.appendChild(img);
    if (!inDock) {
      const label = document.createElement('span');
      label.textContent = state.hideLabels ? '' : app.label;
      el.appendChild(label);
    }
    return el;
  }

  // Widget chỉ để xem trước; widget thật do iOS vẽ (Lịch, Đồng hồ…).
  const WEEKDAYS = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];

  function widgetTile(kind) {
    const now = new Date();
    const el = document.createElement('div');
    el.className = 'tile wide';
    const w = document.createElement('div');
    w.className = `widget ${kind}`;
    w.style.background = `linear-gradient(180deg, ${state.icon.bg1}, ${state.icon.bg2})`;
    w.style.color = state.icon.glyph;
    if (kind === 'cal') {
      w.innerHTML = `<b>${WEEKDAYS[now.getDay()]}</b><strong>${now.getDate()}</strong><small>Không có sự kiện</small>`;
    } else {
      const m = now.getMinutes();
      const h = (now.getHours() % 12) + m / 60;
      let ticks = '';
      for (let i = 0; i < 12; i++) {
        ticks += `<line x1="50" y1="9" x2="50" y2="${i % 3 ? 13 : 16}" transform="rotate(${i * 30} 50 50)"/>`;
      }
      w.innerHTML =
        `<svg viewBox="0 0 100 100" aria-hidden="true"><g stroke="currentColor" stroke-linecap="round">` +
        `<circle cx="50" cy="50" r="45" fill="rgba(0,0,0,0.18)" stroke-opacity="0.25" stroke-width="1.5"/>` +
        `<g stroke-width="2" opacity="0.7">${ticks}</g>` +
        `<line x1="50" y1="50" x2="50" y2="28" stroke-width="5" transform="rotate(${h * 30} 50 50)"/>` +
        `<line x1="50" y1="50" x2="50" y2="15" stroke-width="3" transform="rotate(${m * 6} 50 50)"/>` +
        `</g><circle cx="50" cy="50" r="4" fill="currentColor"/></svg>`;
    }
    el.appendChild(w);
    const label = document.createElement('span');
    label.textContent = kind === 'cal' ? 'Lịch' : 'Đồng hồ';
    el.appendChild(label);
    return el;
  }

  function renderPreview() {
    const [W, H] = state.device.split('x').map(Number);
    $('phone').style.aspectRatio = `${W} / ${H}`;
    $('wallPreview').src = R.svgDataURL(R.wallpaperSVG(state.wallpaper, W, H, state.seed));
    const sel = selectedApps();
    const dock = sel.filter((a) => TIS.DOCK_IDS.includes(a.id)).slice(0, 4);
    const grid = sel.filter((a) => !dock.includes(a)).slice(0, state.widgets ? 16 : 24);
    const widgets = state.widgets ? [widgetTile('cal'), widgetTile('clock')] : [];
    $('homeGrid').replaceChildren(...widgets, ...grid.map((a) => tile(a, false)));
    $('dock').replaceChildren(...dock.map((a) => tile(a, true)));
    $('dock').hidden = dock.length === 0;

    // Cập nhật icon nhỏ trong danh sách app và bộ chọn biểu tượng theo màu mới.
    const byId = Object.fromEntries(allApps().map((a) => [a.id, a]));
    document.querySelectorAll('img[data-app]').forEach((img) => {
      const a = byId[img.dataset.app];
      if (a) img.src = iconURL(a.glyph, 72);
    });
    document.querySelectorAll('img[data-glyph]').forEach((img) => {
      img.src = iconURL(img.dataset.glyph, 72);
    });

    const clips = sel.filter((a) => a.scheme).length;
    $('selCount').textContent =
      `Đã chọn ${sel.length} app · ${clips} cài bằng profile` + (sel.length - clips ? ` · ${sel.length - clips} qua Phím tắt` : '');
  }

  let raf = 0;
  function update() {
    save();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(renderPreview);
    schedulePrerender();
  }

  // ---------- Điều khiển ----------
  function syncControls() {
    $('themeName').value = state.name;
    for (const id of ['bg1', 'bg2']) $(id).value = state.icon[id];
    $('glyphColor').value = state.icon.glyph;
    $('scale').value = state.icon.scale;
    $('scaleOut').textContent = Math.round(state.icon.scale * 100) + '%';
    $('stroke').value = state.icon.stroke;
    $('strokeOut').textContent = Number(state.icon.stroke).toFixed(1);
    $('hideLabels').checked = state.hideLabels;
    for (const id of ['c1', 'c2', 'c3']) $(id).value = state.wallpaper[id];
    $('wallText').value = state.wallpaper.text || '';
    $('widgets').checked = state.widgets;
    $('device').value = state.device;
    $('bg2Wrap').hidden = state.icon.style === 'solid';
    setSeg('iconStyle', state.icon.style);
    setSeg('wallStyle', state.wallpaper.style);
    document.querySelectorAll('#presetChips button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.id === state.preset));
    });
  }

  function setSeg(id, value) {
    $(id).querySelectorAll('button').forEach((b) => {
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', String(b.dataset.v === value));
    });
  }

  function buildPresets() {
    const box = $('presetChips');
    for (const p of TIS.PRESETS) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.id = p.id;
      b.innerHTML = `<i style="background:linear-gradient(135deg, ${p.wallpaper.c2}, ${p.icon.bg1} 55%, ${p.icon.bg2})"></i>`;
      b.append(p.name);
      b.addEventListener('click', () => {
        const isPresetName = !state.name || TIS.PRESETS.some((x) => x.name === state.name);
        state.preset = p.id;
        state.icon = { ...p.icon };
        state.wallpaper = { ...p.wallpaper };
        state.widgets = !!p.widgets;
        if (isPresetName) state.name = p.name;
        syncControls();
        update();
      });
      box.appendChild(b);
    }
  }

  function buildDevices() {
    const sel = $('device');
    for (const d of TIS.DEVICES) {
      const o = document.createElement('option');
      o.value = d.id;
      o.textContent = `${d.name} (${d.id.replace('x', '×')})`;
      sel.appendChild(o);
    }
  }

  function tagFor(app) {
    if (!app.scheme) return '<span class="tag sc">Phím tắt</span>';
    if (app.test) return '<span class="tag test">Cần thử</span>';
    return '';
  }

  function buildAppList() {
    const list = $('appList');
    list.replaceChildren();
    const groups = TIS.APP_GROUPS.concat(state.custom.length ? [{ id: 'custom', name: 'App bạn thêm' }] : []);
    const apps = allApps();
    for (const g of groups) {
      const items = apps.filter((a) => a.group === g.id);
      if (!items.length) continue;
      const h = document.createElement('h3');
      h.className = 'group';
      h.textContent = g.name;
      list.appendChild(h);
      for (const a of items) list.appendChild(appRow(a));
    }
  }

  function appRow(a) {
    const row = document.createElement('div');
    row.className = 'app-row';
    row.innerHTML = `
      <input type="checkbox" aria-label="Chọn ${R.esc(a.name)}" ${state.selected[a.id] ? 'checked' : ''}>
      <img data-app="${a.id}" alt="">
      <div class="app-main">
        <input class="lbl" type="text" maxlength="24" aria-label="Tên hiển thị của ${R.esc(a.name)}">
        <input class="sch" type="text" aria-label="URL scheme của ${R.esc(a.name)}" placeholder="(trống)"
          autocapitalize="off" autocorrect="off" spellcheck="false">
      </div>
      <span class="tag-slot">${tagFor(a)}</span>
      ${a.custom ? '<button type="button" class="del" aria-label="Xóa app này">×</button>' : ''}`;
    const [check, , main] = row.children;
    const [lbl, sch] = main.children;
    lbl.value = a.label;
    sch.value = a.scheme || '';

    check.addEventListener('change', () => {
      state.selected[a.id] = check.checked;
      update();
    });
    lbl.addEventListener('input', () => {
      const v = lbl.value.trim();
      if (!v || v === a.name) delete state.labels[a.id];
      else state.labels[a.id] = v;
      update();
    });
    sch.addEventListener('change', () => {
      const original = TIS.APPS.find((x) => x.id === a.id);
      const v = normalizeScheme(sch.value);
      sch.value = v;
      if (a.custom) state.custom.find((c) => c.id === a.id).scheme = v || null;
      else if (original && v === (original.scheme || '')) delete state.schemes[a.id];
      else state.schemes[a.id] = v;
      const fresh = allApps().find((x) => x.id === a.id);
      row.querySelector('.tag-slot').innerHTML = tagFor(fresh);
      update();
    });
    const del = row.querySelector('.del');
    if (del) {
      del.addEventListener('click', () => {
        state.custom = state.custom.filter((c) => c.id !== a.id);
        delete state.selected[a.id];
        delete state.labels[a.id];
        buildAppList();
        update();
      });
    }
    return row;
  }

  let pickedGlyph = 'star';
  function buildPicker() {
    const box = $('glyphPicker');
    for (const key of TIS.PICKER_GLYPHS) {
      if (!TIS.GLYPHS[key]) continue;
      const b = document.createElement('button');
      b.type = 'button';
      b.title = TIS.GLYPHS[key].n;
      b.setAttribute('aria-label', TIS.GLYPHS[key].n);
      b.setAttribute('aria-pressed', String(key === pickedGlyph));
      b.innerHTML = `<img data-glyph="${key}" alt="">`;
      b.addEventListener('click', () => {
        pickedGlyph = key;
        $('newText').value = '';
        box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      });
      box.appendChild(b);
    }
  }

  function addApp() {
    const name = $('newName').value.trim();
    if (!name) {
      $('newName').focus();
      return status('Nhập tên hiển thị cho app trước đã.', 'err');
    }
    const text = $('newText').value.trim();
    const id = 'c' + Date.now().toString(36);
    state.custom.push({
      id,
      name,
      scheme: normalizeScheme($('newScheme').value) || null,
      glyph: text ? `text:${text}` : pickedGlyph,
    });
    state.selected[id] = true;
    $('newName').value = '';
    $('newScheme').value = '';
    $('newText').value = '';
    buildAppList();
    update();
    status(`Đã thêm “${name}”.`, 'ok');
  }

  function bindControls() {
    $('themeName').addEventListener('input', (e) => {
      state.name = e.target.value;
      update();
    });
    const iconInput = (id, key, num) =>
      $(id).addEventListener('input', (e) => {
        state.icon[key] = num ? Number(e.target.value) : e.target.value;
        syncControls();
        update();
      });
    iconInput('bg1', 'bg1');
    iconInput('bg2', 'bg2');
    iconInput('glyphColor', 'glyph');
    iconInput('scale', 'scale', true);
    iconInput('stroke', 'stroke', true);
    for (const id of ['c1', 'c2', 'c3']) {
      $(id).addEventListener('input', (e) => {
        state.wallpaper[id] = e.target.value;
        update();
      });
    }
    $('wallText').addEventListener('input', (e) => {
      state.wallpaper.text = e.target.value;
      update();
    });
    $('widgets').addEventListener('change', (e) => {
      state.widgets = e.target.checked;
      update();
    });
    $('hideLabels').addEventListener('change', (e) => {
      state.hideLabels = e.target.checked;
      update();
    });
    $('device').addEventListener('change', (e) => {
      state.device = e.target.value;
      state.deviceChosen = true;
      update();
    });
    $('shuffle').addEventListener('click', () => {
      state.seed = Math.floor(Math.random() * 1e9);
      update();
    });
    $('iconStyle').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      state.icon.style = b.dataset.v;
      syncControls();
      update();
    });
    $('wallStyle').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      state.wallpaper.style = b.dataset.v;
      syncControls();
      update();
    });
    const setAll = (on) => {
      for (const a of allApps()) state.selected[a.id] = on;
      $('appList').querySelectorAll('input[type=checkbox]').forEach((c) => (c.checked = on));
      update();
    };
    $('selectAll').addEventListener('click', () => setAll(true));
    $('selectNone').addEventListener('click', () => setAll(false));
    $('addApp').addEventListener('click', addApp);
    $('newText').addEventListener('input', () => {
      if ($('newText').value) $('glyphPicker').querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    });

    $('btnProfile').addEventListener('click', () => run(exportProfile));
    $('btnWall').addEventListener('click', () => run(exportWallpaper));
    $('btnIcons').addEventListener('click', () => run(exportIcons));
    $('btnZip').addEventListener('click', () => run(exportZip));
  }

  // ---------- Xuất file ----------
  function status(msg, kind) {
    const el = $('status');
    el.textContent = msg || '';
    el.dataset.kind = kind || '';
  }

  let busy = false;
  async function run(fn) {
    if (busy) return;
    busy = true;
    document.querySelectorAll('[data-export]').forEach((b) => (b.disabled = true));
    try {
      await fn();
    } catch (err) {
      console.error(err);
      status('Có lỗi: ' + (err && err.message ? err.message : err), 'err');
    } finally {
      busy = false;
      document.querySelectorAll('[data-export]').forEach((b) => (b.disabled = false));
    }
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  // Mỗi loại kết quả có một ô riêng; tạo lại thì thay nội dung cũ.
  const resultURLs = {};
  function showResult(key, html, urls) {
    (resultURLs[key] || []).forEach((u) => URL.revokeObjectURL(u));
    resultURLs[key] = urls || [];
    let box = document.querySelector(`#results [data-key="${key}"]`);
    if (!box) {
      box = document.createElement('div');
      box.className = 'result';
      box.dataset.key = key;
      $('results').appendChild(box);
    }
    box.innerHTML = html;
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function iconPNG(app, px) {
    return R.rasterize(R.iconSVG(app.glyph, state.icon, px), px, px);
  }

  async function profileBlob() {
    const clips = selectedApps().filter((a) => a.scheme);
    if (!clips.length) return null;
    const items = [];
    for (const [i, a] of clips.entries()) {
      status(`Đang vẽ icon ${i + 1}/${clips.length}…`);
      const canvas = await iconPNG(a, PROFILE_PX);
      items.push({
        id: a.id,
        name: a.label,
        label: state.hideLabels ? BLANK_LABEL : a.label,
        url: a.scheme,
        png: canvas.toDataURL('image/png').split(',')[1],
      });
    }
    const xml = X.buildMobileconfig(state.name.trim() || 'Theme của tôi', items);
    return { blob: new Blob([xml], { type: 'application/x-apple-aspen-config' }), count: items.length };
  }

  const fileBase = () => X.slugify(state.name.trim() || 'theme');

  async function exportProfile() {
    const res = await profileBlob();
    if (!res) return status('Chưa chọn app nào mở được bằng profile (có URL scheme).', 'err');
    download(res.blob, `${fileBase()}.mobileconfig`);
    const shortcutOnly = selectedApps().filter((a) => !a.scheme);
    status(`Đã tạo profile gồm ${res.count} icon.`, 'ok');
    showResult(
      'profile',
      `<h3>Bộ icon đã tải về</h3>
       <ol class="mini-steps">
         <li>Chọn <b>Cho phép</b> khi Safari hỏi.</li>
         <li>Mở app <b>Cài đặt</b>, bấm dòng <b>Đã tải về hồ sơ</b> ở trên cùng.</li>
         <li>Bấm <b>Cài đặt</b>, nhập mật mã máy, bấm <b>Cài đặt</b> lần nữa. Làm trong vài phút, để lâu hồ sơ sẽ tự xóa.</li>
       </ol>
       <p class="sub">Đang dùng máy tính? Gửi file <code>${fileBase()}.mobileconfig</code> sang iPhone bằng AirDrop hoặc Mail rồi mở.</p>` +
        (shortcutOnly.length
          ? `<p class="sub">${shortcutOnly.map((a) => R.esc(a.label)).join(', ')} không cài bằng profile được.
             Muốn đổi icon của chúng, xem <b>Tùy chỉnh thêm › Lấy icon cho Phím tắt</b>.</p>`
          : '')
    );
  }

  async function renderWallpaper() {
    const [W, H] = state.device.split('x').map(Number);
    const canvas = await R.rasterize(R.wallpaperSVG(state.wallpaper, W, H, state.seed), W, H);
    // JPEG chất lượng cao: nhẹ hơn PNG hàng chục lần với nền có hạt nhiễu, mắt thường không thấy khác.
    return R.canvasToBlob(canvas, 'image/jpeg', 0.92);
  }

  async function wallpaperBlob() {
    status('Đang vẽ hình nền…');
    return renderWallpaper();
  }

  // Trên iPhone: vẽ sẵn hình nền khi đổi theme, để bấm nút là mở ngay bảng Chia sẻ (có "Lưu hình ảnh").
  // Safari chỉ cho mở bảng Chia sẻ ngay lúc bấm, nên không thể đợi vẽ xong mới gọi.
  const canShareFiles = (() => {
    try {
      return !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'a.jpg', { type: 'image/jpeg' })] }));
    } catch (e) {
      return false;
    }
  })();
  let wallCache = { key: '', file: null };
  let prerenderTimer = 0;
  const wallKey = () => JSON.stringify([state.wallpaper, state.device, state.seed]);

  function schedulePrerender() {
    if (!canShareFiles) return;
    clearTimeout(prerenderTimer);
    prerenderTimer = setTimeout(async () => {
      const key = wallKey();
      if (wallCache.key === key) return;
      try {
        const blob = await renderWallpaper();
        if (key === wallKey()) wallCache = { key, file: new File([blob], `hinh-nen-${fileBase()}.jpg`, { type: 'image/jpeg' }) };
      } catch (e) {
        /* bấm nút vẫn vẽ lại được */
      }
    }, 800);
  }

  async function exportWallpaper() {
    const cached = wallCache.key === wallKey() ? wallCache.file : null;
    if (cached) navigator.share({ files: [cached] }).catch(() => {});
    const blob = cached || (await wallpaperBlob());
    const url = URL.createObjectURL(blob);
    const name = `hinh-nen-${fileBase()}.jpg`;
    status('Hình nền đã sẵn sàng.', 'ok');
    showResult(
      'wall',
      `<h3>Hình nền</h3>
       <ol class="mini-steps">
         <li>${cached ? 'Chọn <b>Lưu hình ảnh</b> trong bảng Chia sẻ, hoặc nhấn giữ ảnh dưới đây và chọn <b>Lưu vào Ảnh</b>.' : 'Nhấn giữ ảnh dưới đây, chọn <b>Lưu vào Ảnh</b>.'}</li>
         <li>Vào <b>Cài đặt › Hình nền › Thêm hình nền mới › Ảnh</b>, chọn ảnh vừa lưu, bấm <b>Thêm</b>.</li>
       </ol>
       <img class="wall-out" src="${url}" alt="Hình nền theme">
       <p><a class="btn small" href="${url}" download="${name}">Tải ảnh về</a></p>`,
      [url]
    );
  }

  async function iconBlobs() {
    const apps = selectedApps().sort((a, b) => Number(!!a.scheme) - Number(!!b.scheme));
    const out = [];
    for (const [i, a] of apps.entries()) {
      status(`Đang vẽ icon ${i + 1}/${apps.length}…`);
      out.push({ app: a, blob: await R.canvasToBlob(await iconPNG(a, SHORTCUT_PX)) });
    }
    return out;
  }

  async function exportIcons() {
    const icons = await iconBlobs();
    if (!icons.length) return status('Chưa chọn app nào.', 'err');
    const urls = icons.map((x) => URL.createObjectURL(x.blob));
    status(`Đã vẽ ${icons.length} icon.`, 'ok');
    showResult(
      'icons',
      `<h3>Icon cho Phím tắt</h3>
       <p>Trên iPhone: <b>nhấn giữ icon › Lưu vào Ảnh</b>, rồi làm theo bước 4 trong hướng dẫn bên dưới.
       Các app có nhãn <span class="tag sc">Phím tắt</span> được xếp lên đầu.</p>
       <div class="icon-gallery">` +
        icons
          .map(
            (x, i) => `<figure><img src="${urls[i]}" alt="Icon ${R.esc(x.app.label)}">
              <figcaption>${R.esc(x.app.label)}${x.app.scheme ? '' : ' <span class="tag sc">Phím tắt</span>'}</figcaption></figure>`
          )
          .join('') +
        `</div>`,
      urls
    );
  }

  async function exportZip() {
    const files = [];
    const bytes = async (blob) => new Uint8Array(await blob.arrayBuffer());
    const profile = await profileBlob();
    if (profile) files.push({ name: `${fileBase()}.mobileconfig`, data: await bytes(profile.blob) });
    files.push({ name: `hinh-nen-${state.device}.jpg`, data: await bytes(await wallpaperBlob()) });
    for (const x of await iconBlobs()) {
      files.push({ name: `icons/${X.slugify(x.app.label)}-${x.app.id}.png`, data: await bytes(x.blob) });
    }
    files.push({ name: 'HUONG-DAN.txt', data: new TextEncoder().encode(guideText()) });
    status('Đang đóng gói…');
    download(X.makeZip(files), `theme-${fileBase()}.zip`);
    status(`Đã tạo file zip gồm ${files.length} file.`, 'ok');
  }

  function guideText() {
    return [
      `Theme: ${state.name}`,
      '',
      '1. Gửi file .mobileconfig sang iPhone (AirDrop / Mail), mở bằng Safari hoặc Mail,',
      '   rồi vào Cài đặt > Đã tải về hồ sơ > Cài đặt.',
      '2. Lưu file hinh-nen-*.jpg vào Ảnh, đặt làm hình nền trong Cài đặt > Hình nền.',
      '3. Thư mục icons/ chứa icon 512px để gắn cho app qua app Phím tắt (Mở ứng dụng > Thêm vào MH chính).',
      '4. Gỡ theme: Cài đặt > Cài đặt chung > VPN & Quản lý thiết bị > chọn profile > Xóa hồ sơ.',
      '',
    ].join('\r\n');
  }

  // ---------- Khởi động ----------
  function checkBrowser() {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const notSafari = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|Zalo|Line\//i.test(ua);
    $('browserWarn').hidden = !(isIOS && notSafari);
  }

  buildPresets();
  buildDevices();
  buildPicker();
  buildAppList();
  bindControls();
  syncControls();
  checkBrowser();
  renderPreview();
  schedulePrerender();
})();
