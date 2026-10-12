// Danh sách app có sẵn.
//   scheme: đường dẫn mở app (URL scheme). Để null nếu app không có scheme
//           -> icon đó phải gắn bằng app Phím tắt (Shortcuts).
//   test:   true = scheme ít tài liệu, nên bấm thử sau khi cài.
//   on:     được chọn sẵn khi mở trang lần đầu.
// Muốn thêm app cố định cho mọi lần dùng thì thêm một dòng vào đây.
window.TIS = window.TIS || {};

TIS.APP_GROUPS = [
  { id: 'apple', name: 'Ứng dụng Apple' },
  { id: 'social', name: 'Mạng xã hội & giải trí' },
  { id: 'other', name: 'Tiện ích khác' },
];

TIS.APPS = [
  // Apple
  { id: 'phone', name: 'Điện thoại', scheme: 'mobilephone-recents://', glyph: 'phone', group: 'apple', test: true, on: true },
  { id: 'messages', name: 'Tin nhắn', scheme: 'sms://', glyph: 'message-circle', group: 'apple', on: true },
  { id: 'camera', name: 'Camera', scheme: null, glyph: 'camera', group: 'apple', on: true },
  { id: 'photos', name: 'Ảnh', scheme: 'photos-redirect://', glyph: 'image', group: 'apple', on: true },
  { id: 'settings', name: 'Cài đặt', scheme: 'App-prefs:', glyph: 'settings', group: 'apple', test: true, on: true },
  { id: 'safari', name: 'Safari', scheme: 'x-web-search://', glyph: 'compass', group: 'apple', on: true },
  { id: 'mail', name: 'Mail', scheme: 'message://', glyph: 'mail', group: 'apple' },
  { id: 'music', name: 'Nhạc', scheme: 'music://', glyph: 'music', group: 'apple', on: true },
  { id: 'maps', name: 'Bản đồ', scheme: 'maps://', glyph: 'map', group: 'apple' },
  { id: 'calendar', name: 'Lịch', scheme: 'calshow://', glyph: 'calendar', group: 'apple', on: true },
  { id: 'notes', name: 'Ghi chú', scheme: 'mobilenotes://', glyph: 'notebook-pen', group: 'apple', on: true },
  { id: 'reminders', name: 'Lời nhắc', scheme: 'x-apple-reminderkit://', glyph: 'list-checks', group: 'apple', test: true },
  { id: 'clock', name: 'Đồng hồ', scheme: 'clock-alarm://', glyph: 'clock', group: 'apple', test: true, on: true },
  { id: 'weather', name: 'Thời tiết', scheme: 'weather://', glyph: 'cloud-sun', group: 'apple', test: true, on: true },
  { id: 'calculator', name: 'Máy tính', scheme: null, glyph: 'calculator', group: 'apple' },
  { id: 'appstore', name: 'App Store', scheme: 'itms-apps://', glyph: 'layout-grid', group: 'apple', on: true },
  { id: 'files', name: 'Tệp', scheme: 'shareddocuments://', glyph: 'folder', group: 'apple' },
  { id: 'shortcuts', name: 'Phím tắt', scheme: 'shortcuts://', glyph: 'layers', group: 'apple' },
  { id: 'health', name: 'Sức khỏe', scheme: 'x-apple-health://', glyph: 'heart-pulse', group: 'apple' },
  { id: 'wallet', name: 'Ví', scheme: 'shoebox://', glyph: 'wallet', group: 'apple', test: true },
  { id: 'books', name: 'Sách', scheme: 'ibooks://', glyph: 'book-open', group: 'apple', test: true },
  { id: 'podcasts', name: 'Podcast', scheme: 'podcasts://', glyph: 'podcast', group: 'apple' },
  { id: 'findmy', name: 'Tìm', scheme: 'findmy://', glyph: 'locate-fixed', group: 'apple', test: true },

  // Mạng xã hội & giải trí
  { id: 'facebook', name: 'Facebook', scheme: 'fb://', glyph: 'facebook', group: 'social', on: true },
  { id: 'messenger', name: 'Messenger', scheme: 'fb-messenger://', glyph: 'messenger', group: 'social', on: true },
  { id: 'zalo', name: 'Zalo', scheme: 'zalo://', glyph: 'zalo', group: 'social', test: true, on: true },
  { id: 'instagram', name: 'Instagram', scheme: 'instagram://', glyph: 'instagram', group: 'social', on: true },
  { id: 'tiktok', name: 'TikTok', scheme: 'snssdk1233://', glyph: 'tiktok', group: 'social', on: true },
  { id: 'youtube', name: 'YouTube', scheme: 'youtube://', glyph: 'youtube', group: 'social', on: true },
  { id: 'spotify', name: 'Spotify', scheme: 'spotify://', glyph: 'spotify', group: 'social' },
  { id: 'threads', name: 'Threads', scheme: 'barcelona://', glyph: 'threads', group: 'social', test: true },
  { id: 'x', name: 'X', scheme: 'twitter://', glyph: 'x', group: 'social' },
  { id: 'telegram', name: 'Telegram', scheme: 'tg://', glyph: 'telegram', group: 'social' },
  { id: 'whatsapp', name: 'WhatsApp', scheme: 'whatsapp://', glyph: 'whatsapp', group: 'social' },
  { id: 'discord', name: 'Discord', scheme: 'discord://', glyph: 'discord', group: 'social' },
  { id: 'snapchat', name: 'Snapchat', scheme: 'snapchat://', glyph: 'snapchat', group: 'social' },
  { id: 'pinterest', name: 'Pinterest', scheme: 'pinterest://', glyph: 'pinterest', group: 'social' },
  { id: 'netflix', name: 'Netflix', scheme: 'nflx://', glyph: 'netflix', group: 'social' },

  // Tiện ích khác
  { id: 'gmail', name: 'Gmail', scheme: 'googlegmail://', glyph: 'gmail', group: 'other' },
  { id: 'chrome', name: 'Chrome', scheme: 'googlechrome://', glyph: 'googlechrome', group: 'other' },
  { id: 'googlemaps', name: 'Google Maps', scheme: 'comgooglemaps://', glyph: 'googlemaps', group: 'other' },
  { id: 'googledrive', name: 'Drive', scheme: 'googledrive://', glyph: 'googledrive', group: 'other', test: true },
  { id: 'shopee', name: 'Shopee', scheme: null, glyph: 'shopee', group: 'other', on: true },
  { id: 'grab', name: 'Grab', scheme: 'grab://', glyph: 'grab', group: 'other', test: true },
];

// App nằm ở dock (hàng dưới cùng) trong khung xem trước.
TIS.DOCK_IDS = ['phone', 'messages', 'safari', 'music'];

// Biểu tượng hiện trong bộ chọn khi tự thêm app.
TIS.PICKER_GLYPHS = [
  'star', 'heart', 'sparkles', 'banknote', 'landmark', 'credit-card', 'wallet', 'shopping-bag',
  'shopping-cart', 'store', 'gamepad-2', 'film', 'tv', 'headphones', 'music', 'camera', 'image',
  'book-open', 'graduation-cap', 'dumbbell', 'coffee', 'utensils', 'plane', 'car', 'bike', 'bus',
  'ticket', 'gift', 'smile', 'flower-2', 'cat', 'dog', 'ghost', 'zap', 'sun', 'moon', 'cloud',
  'globe', 'house', 'user', 'users', 'bell', 'search', 'bookmark', 'newspaper', 'qr-code',
  'scan-line', 'palette', 'wand-sparkles', 'code', 'pill', 'download',
];
