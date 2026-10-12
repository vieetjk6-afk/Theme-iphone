// Các mẫu theme có sẵn. Muốn tạo mẫu riêng: chép một khối bên dưới, đổi id/tên/màu.
//   icon.style:      gradient | solid | ring | neon
//   icon.scale:      kích thước biểu tượng so với icon (0.3 – 0.75)
//   icon.stroke:     độ dày nét của biểu tượng dạng nét (1 – 3)
//   wallpaper.style: blobs | gradient | waves | dots
window.TIS = window.TIS || {};

TIS.PRESETS = [
  {
    id: 'pastel', name: 'Hồng Pastel',
    icon: { style: 'gradient', bg1: '#ffc8dd', bg2: '#b8a4e3', glyph: '#ffffff', scale: 0.5, stroke: 2 },
    wallpaper: { style: 'blobs', c1: '#fde4f2', c2: '#ffafcc', c3: '#bde0fe' },
  },
  {
    id: 'neon', name: 'Đêm Neon',
    icon: { style: 'neon', bg1: '#07051a', bg2: '#24124f', glyph: '#7df9ff', scale: 0.5, stroke: 1.8 },
    wallpaper: { style: 'blobs', c1: '#04020d', c2: '#3a0ca3', c3: '#00b4d8' },
  },
  {
    id: 'beige', name: 'Kem Be',
    icon: { style: 'solid', bg1: '#efe5da', bg2: '#e3d5ca', glyph: '#7f5539', scale: 0.48, stroke: 1.8 },
    wallpaper: { style: 'waves', c1: '#f6eee5', c2: '#d5bdaf', c3: '#9c6644' },
  },
  {
    id: 'matcha', name: 'Matcha',
    icon: { style: 'ring', bg1: '#eef6e2', bg2: '#d4e7c0', glyph: '#4f772d', scale: 0.46, stroke: 2 },
    wallpaper: { style: 'dots', c1: '#f3f9ea', c2: '#cfe3b8', c3: '#4f772d' },
  },
  {
    id: 'ocean', name: 'Đại Dương',
    icon: { style: 'gradient', bg1: '#4cc9f0', bg2: '#1d3fa8', glyph: '#ffffff', scale: 0.5, stroke: 2 },
    wallpaper: { style: 'waves', c1: '#d8f3ff', c2: '#4cc9f0', c3: '#1d3fa8' },
  },
  {
    id: 'sunset', name: 'Hoàng Hôn',
    icon: { style: 'gradient', bg1: '#ffbe0b', bg2: '#f3502a', glyph: '#ffffff', scale: 0.5, stroke: 2.2 },
    wallpaper: { style: 'blobs', c1: '#ffd6a5', c2: '#ff7b54', c3: '#c3427e' },
  },
  {
    id: 'mono', name: 'Đen Trắng',
    icon: { style: 'solid', bg1: '#141414', bg2: '#141414', glyph: '#f2f2f2', scale: 0.46, stroke: 1.6 },
    wallpaper: { style: 'gradient', c1: '#3a3a3a', c2: '#050505', c3: '#8a8a8a' },
  },
];

// Kích thước màn hình (pixel, dọc) để xuất hình nền đúng nét.
TIS.DEVICES = [
  { id: '1320x2868', name: 'iPhone 17 Pro Max / 16 Pro Max' },
  { id: '1206x2622', name: 'iPhone 17 / 17 Pro / 16 Pro' },
  { id: '1260x2736', name: 'iPhone Air' },
  { id: '1290x2796', name: 'iPhone 16 Plus / 15 Plus / 15 Pro Max / 14 Pro Max' },
  { id: '1179x2556', name: 'iPhone 16 / 15 / 15 Pro / 14 Pro' },
  { id: '1170x2532', name: 'iPhone 16e / 14 / 13 / 13 Pro / 12 / 12 Pro' },
  { id: '1284x2778', name: 'iPhone 14 Plus / 13 Pro Max / 12 Pro Max' },
  { id: '1080x2340', name: 'iPhone 13 mini / 12 mini' },
  { id: '1242x2688', name: 'iPhone 11 Pro Max / XS Max' },
  { id: '1125x2436', name: 'iPhone 11 Pro / XS / X' },
  { id: '828x1792', name: 'iPhone 11 / XR' },
  { id: '750x1334', name: 'iPhone SE (2, 3) / 8 / 7' },
];
