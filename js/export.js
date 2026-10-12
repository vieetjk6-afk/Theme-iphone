// Tạo file .mobileconfig (profile cài icon) và file .zip, hoàn toàn trên trình duyệt.
window.TIS = window.TIS || {};

(function () {
  const esc = (s) => TIS.render.esc(s);

  function uuid() {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`.toUpperCase();
  }

  // "Hồng Pastel" -> "hong-pastel"
  function slugify(s) {
    return (
      String(s)
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'theme'
    );
  }

  // clips: [{ id, label, url, png (base64, không có tiền tố data:) }]
  // Định danh profile cố định theo tên theme, nên cài lại cùng tên sẽ thay bản cũ.
  function buildMobileconfig(themeName, clips) {
    const slug = slugify(themeName);
    const rootId = `io.github.theme-iphone.${slug}`;
    const items = clips
      .map(
        (c) => `		<dict>
			<key>FullScreen</key>
			<false/>
			<key>Icon</key>
			<data>${c.png}</data>
			<key>IsRemovable</key>
			<true/>
			<key>Label</key>
			<string>${esc(c.label)}</string>
			<key>PayloadDisplayName</key>
			<string>Icon ${esc(c.name)}</string>
			<key>PayloadIdentifier</key>
			<string>${rootId}.webclip.${slugify(c.id)}</string>
			<key>PayloadType</key>
			<string>com.apple.webClip.managed</string>
			<key>PayloadUUID</key>
			<string>${uuid()}</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Precomposed</key>
			<true/>
			<key>URL</key>
			<string>${esc(c.url)}</string>
		</dict>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
${items}
	</array>
	<key>PayloadDescription</key>
	<string>Bộ ${clips.length} icon cho màn hình chính, tạo bằng Theme iPhone Studio. Gỡ bất cứ lúc nào trong Cài đặt &gt; Cài đặt chung &gt; VPN &amp; Quản lý thiết bị.</string>
	<key>PayloadDisplayName</key>
	<string>Theme: ${esc(themeName)}</string>
	<key>PayloadIdentifier</key>
	<string>${rootId}</string>
	<key>PayloadOrganization</key>
	<string>Theme iPhone Studio</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>${uuid()}</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`;
  }

  // ---------- ZIP (không nén, đủ dùng cho ảnh PNG) ----------
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  // files: [{ name, data: Uint8Array }]
  function makeZip(files) {
    const enc = new TextEncoder();
    const parts = [];
    const central = [];
    let offset = 0;
    const DOS_DATE = (2026 - 1980) << 9 | 1 << 5 | 1;

    for (const file of files) {
      const name = enc.encode(file.name);
      const data = file.data;
      const crc = crc32(data);

      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // tên file UTF-8
      local.setUint16(8, 0, true); // không nén
      local.setUint16(10, 0, true);
      local.setUint16(12, DOS_DATE, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, name.length, true);
      local.setUint16(28, 0, true);
      parts.push(local, name, data);

      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true);
      cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true);
      cd.setUint16(12, 0, true);
      cd.setUint16(14, DOS_DATE, true);
      cd.setUint32(16, crc, true);
      cd.setUint32(20, data.length, true);
      cd.setUint32(24, data.length, true);
      cd.setUint16(28, name.length, true);
      cd.setUint32(42, offset, true);
      central.push(cd, name);

      offset += 30 + name.length + data.length;
    }

    const cdSize = central.reduce((n, p) => n + p.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true);
    end.setUint32(16, offset, true);

    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  }

  TIS.exporter = { buildMobileconfig, makeZip, slugify };
})();
