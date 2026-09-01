import type { QuizItem } from '../types/quiz';

const DEFAULT_CHANNEL_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%234f46e5"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="url(%23g)" stroke="%23ffffff" stroke-width="4"/><text x="50" y="60" font-size="34" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-weight="900" letter-spacing="1">BIN</text></svg>';

export const SAMPLE_QUIZ_LIST: QuizItem[] = [
  {
    id: 'quiz-1',
    channelName: 'BIN HỌC TIẾNG ANH',
    channelLogo: DEFAULT_CHANNEL_LOGO,
    logoPosition: 'top-left',
    logoShape: 'circle',
    logoSize: 115,
    showLogoText: true,
    category: 'TỪ VỰNG DỄ NHẦM LẪN',
    word: 'GOODS',
    ipa: '/ɡʊdz/',
    question: 'nghĩa là gì?',
    options: [
      { key: 'A', text: 'Tốt' },
      { key: 'B', text: 'Hàng hóa' },
      { key: 'C', text: 'Món ăn' },
      { key: 'D', text: 'Sự tốt bụng' }
    ],
    correctAnswer: 'B',
    countdownSeconds: 5,
    revealDurationSeconds: 4,
    note: 'Good ≠ Goods',
    explanation: 'Goods = Hàng hóa (Danh từ số nhiều)',
    example: 'The company produces high-tech goods.',
    exampleMeaning: 'Công ty sản xuất các mặt hàng công nghệ cao.'
  },
  {
    id: 'quiz-2',
    channelName: 'BIN HỌC TIẾNG ANH',
    channelLogo: DEFAULT_CHANNEL_LOGO,
    logoPosition: 'top-left',
    logoShape: 'circle',
    logoSize: 115,
    showLogoText: true,
    category: 'PHÂN BIỆT TỪ ĐỒNG ÂM',
    word: 'DESSERT',
    ipa: '/dɪˈzɜːt/',
    question: 'nghĩa là gì?',
    options: [
      { key: 'A', text: 'Sa mạc' },
      { key: 'B', text: 'Rời bỏ' },
      { key: 'C', text: 'Món tráng miệng' },
      { key: 'D', text: 'Khu rừng' }
    ],
    correctAnswer: 'C',
    countdownSeconds: 5,
    revealDurationSeconds: 4,
    note: 'Desert (1 chữ S) = Sa mạc | Dessert (2 chữ S) = Tráng miệng',
    explanation: 'Dessert = Món tráng miệng (Bánh ngọt, kem, hoa quả)',
    example: 'What would you like for dessert?',
    exampleMeaning: 'Bạn muốn dùng món gì cho tráng miệng?'
  },
  {
    id: 'quiz-3',
    channelName: 'BIN HỌC TIẾNG ANH',
    channelLogo: DEFAULT_CHANNEL_LOGO,
    logoPosition: 'top-left',
    logoShape: 'circle',
    logoSize: 115,
    showLogoText: true,
    category: 'TỪ VỰNG TOEIC / IELTS',
    word: 'COMPLIMENT',
    ipa: '/ˈkɒm.plɪ.mənt/',
    question: 'nghĩa là gì?',
    options: [
      { key: 'A', text: 'Lời khen ngợi' },
      { key: 'B', text: 'Bổ sung / Hoàn thiện' },
      { key: 'C', text: 'Phàn nàn' },
      { key: 'D', text: 'Phức tạp' }
    ],
    correctAnswer: 'A',
    countdownSeconds: 5,
    revealDurationSeconds: 4,
    note: 'Compliment (chữ i) = Lời khen | Complement (chữ e) = Bổ sung',
    explanation: 'Compliment = Lời khen, lời ca ngợi',
    example: 'He gave her a nice compliment on her presentation.',
    exampleMeaning: 'Anh ấy đã dành cho cô ấy một lời khen ngợi về bài thuyết trình.'
  },
  {
    id: 'quiz-4',
    channelName: 'BIN HỌC TIẾNG ANH',
    channelLogo: DEFAULT_CHANNEL_LOGO,
    logoPosition: 'top-left',
    logoShape: 'circle',
    logoSize: 115,
    showLogoText: true,
    category: 'TỪ NHIỀU NGHĨA (POLYSEMY)',
    word: 'BEAR (v)',
    ipa: '/beər/',
    question: 'mang ý nghĩa nào sau đây?',
    options: [
      { key: 'A', text: 'Con gấu' },
      { key: 'B', text: 'Chịu đựng / Gánh vác' },
      { key: 'C', text: 'Sinh nở' },
      { key: 'D', text: 'Cả B và C đều đúng' }
    ],
    correctAnswer: 'D',
    countdownSeconds: 5,
    revealDurationSeconds: 4,
    note: 'Danh từ: Con gấu | Động từ: Chịu đựng, sinh con',
    explanation: 'Bear (v) = Chịu đựng (I can\'t bear it) hoặc Sinh con (Bear a child)',
    example: 'She couldn\'t bear the pain any longer.',
    exampleMeaning: 'Cô ấy không thể chịu đựng cơn đau thêm được nữa.'
  },
  {
    id: 'quiz-5',
    channelName: 'BIN HỌC TIẾNG ANH',
    channelLogo: DEFAULT_CHANNEL_LOGO,
    logoPosition: 'top-left',
    logoShape: 'circle',
    logoSize: 115,
    showLogoText: true,
    category: 'NGỮ PHÁP TIẾNG ANH GIAO TIẾP',
    word: 'EVERYDAY',
    ipa: '/ˈev.ri.deɪ/',
    question: 'là loại từ gì & nghĩa là gì?',
    options: [
      { key: 'A', text: 'Trạng từ: Mỗi ngày' },
      { key: 'B', text: 'Tính từ: Thông thường / Hàng ngày' },
      { key: 'C', text: 'Danh từ: Ngày hôm nay' },
      { key: 'D', text: 'Liên từ: Bất kỳ ngày nào' }
    ],
    correctAnswer: 'B',
    countdownSeconds: 5,
    revealDurationSeconds: 4,
    note: 'Everyday (dính liền) = Tính từ | Every day (cách rời) = Trạng từ',
    explanation: 'Everyday (adj) đứng trước danh từ: everyday life = cuộc sống thường ngày',
    example: 'Traffic jams are an everyday problem in the city.',
    exampleMeaning: 'Kẹt xe là vấn đề thường ngày ở thành phố.'
  }
];

export const DEFAULT_JSON_STRING = JSON.stringify(SAMPLE_QUIZ_LIST, null, 2);
