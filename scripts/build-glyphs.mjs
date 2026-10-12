// Tạo lại file js/glyphs.js từ bộ icon Lucide (ISC) và Simple Icons (CC0).
// Chỉ cần chạy khi muốn thêm/bớt biểu tượng:  npm install && npm run glyphs
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lucideDir = path.join(root, 'node_modules', 'lucide-static', 'icons');
const siDir = path.join(root, 'node_modules', 'simple-icons', 'icons');

// Biểu tượng nét (Lucide). Giá trị là tên tiếng Việt hiện trong bộ chọn biểu tượng.
const LUCIDE = {
  phone: 'Điện thoại', 'message-circle': 'Tin nhắn', camera: 'Máy ảnh', image: 'Ảnh',
  settings: 'Cài đặt', compass: 'La bàn', mail: 'Thư', music: 'Nhạc', map: 'Bản đồ',
  calendar: 'Lịch', 'notebook-pen': 'Ghi chú', clock: 'Đồng hồ', 'cloud-sun': 'Thời tiết',
  'layout-grid': 'Lưới app', folder: 'Thư mục', layers: 'Lớp', calculator: 'Máy tính',
  'heart-pulse': 'Sức khỏe', wallet: 'Ví', 'book-open': 'Sách', podcast: 'Podcast',
  'locate-fixed': 'Định vị', 'list-checks': 'Việc cần làm', video: 'Video',
  star: 'Ngôi sao', heart: 'Trái tim', sparkles: 'Lấp lánh', banknote: 'Tiền',
  landmark: 'Ngân hàng', 'credit-card': 'Thẻ', sun: 'Mặt trời', moon: 'Mặt trăng',
  film: 'Phim', headphones: 'Tai nghe', tv: 'TV', 'gamepad-2': 'Game', globe: 'Web',
  'shopping-bag': 'Mua sắm', 'shopping-cart': 'Giỏ hàng', store: 'Cửa hàng',
  'graduation-cap': 'Học tập', dumbbell: 'Tập gym', coffee: 'Cà phê', utensils: 'Đồ ăn',
  plane: 'Máy bay', car: 'Ô tô', bike: 'Xe đạp', 'bus': 'Xe buýt', ticket: 'Vé',
  gift: 'Quà', smile: 'Mặt cười', 'flower-2': 'Hoa', cat: 'Mèo', dog: 'Chó',
  ghost: 'Ma', zap: 'Tia sét', bookmark: 'Đánh dấu', newspaper: 'Báo',
  'qr-code': 'Mã QR', 'scan-line': 'Quét', user: 'Người', users: 'Nhóm', house: 'Nhà',
  bell: 'Chuông', search: 'Tìm kiếm', cloud: 'Đám mây', download: 'Tải về',
  palette: 'Bảng màu', 'wand-sparkles': 'Phép thuật', code: 'Code', pill: 'Thuốc',
};

// Logo thương hiệu (Simple Icons).
const BRANDS = [
  'facebook', 'messenger', 'zalo', 'instagram', 'tiktok', 'youtube', 'spotify', 'shopee',
  'grab', 'gmail', 'googlemaps', 'googlechrome', 'googledrive', 'telegram', 'whatsapp',
  'netflix', 'x', 'threads', 'discord', 'snapchat', 'pinterest',
];

const out = {};

for (const [name, vi] of Object.entries(LUCIDE)) {
  const svg = readFileSync(path.join(lucideDir, `${name}.svg`), 'utf8');
  const body = svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>[\s\S]*$/, '')
    .replace(/\s*\n\s*/g, '')
    .replace(/\s+\/>/g, '/>')
    .trim();
  out[name] = { t: 's', n: vi, b: body };
}

for (const slug of BRANDS) {
  const svg = readFileSync(path.join(siDir, `${slug}.svg`), 'utf8');
  const title = svg.match(/<title>(.*?)<\/title>/)[1];
  const d = svg.match(/<path d="([^"]+)"/)[1];
  out[slug] = { t: 'f', n: title, b: `<path d="${d}"/>` };
}

const header = `// File tự động tạo bởi scripts/build-glyphs.mjs — đừng sửa tay.
// Biểu tượng nét: Lucide (ISC License) — https://lucide.dev
// Logo thương hiệu: Simple Icons (CC0) — https://simpleicons.org
//   Logo là nhãn hiệu của chủ sở hữu tương ứng; chỉ dùng cho mục đích cá nhân.
window.TIS = window.TIS || {};
TIS.GLYPHS = `;

const lines = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
writeFileSync(path.join(root, 'js', 'glyphs.js'), `${header}{\n${lines.join(',\n')}\n};\n`);
console.log(`Đã ghi ${lines.length} biểu tượng vào js/glyphs.js`);
