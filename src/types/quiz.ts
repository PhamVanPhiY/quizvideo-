export interface QuizOption {
  key: string; // "A", "B", "C", "D"
  text: string;
}

export interface QuizItem {
  id: string | number;
  channelName?: string; // e.g. "BIN HỌC TIẾNG ANH"
  channelLogo?: string; // Base64 data URL or image URL
  logoPosition?: 'top-left' | 'top-center' | 'top-right'; // Default 'top-left' for copyright branding
  logoShape?: 'circle' | 'rounded' | 'square' | 'original'; // Shape of logo container
  logoSize?: number; // Size in px (e.g. 80)
  logoOpacity?: number; // 0.5 to 1.0 (watermark transparency)
  showLogoText?: boolean; // Whether to display channel name alongside logo as a pill badge
  category?: string; // e.g. "TỪ VỰNG DỄ NHẦM LẪN"
  word: string; // e.g. "GOODS"
  ipa?: string; // e.g. "/ɡʊdz/"
  question: string; // e.g. "nghĩa là gì?"
  options: QuizOption[];
  correctAnswer: string; // "A" | "B" | "C" | "D"
  countdownSeconds: number; // default 5
  revealDurationSeconds?: number; // default 4
  note?: string; // e.g. "Good ≠ Goods"
  explanation: string; // e.g. "Goods = Hàng hóa (Danh từ)"
  example?: string; // e.g. "The company produces electronic goods."
  exampleMeaning?: string; // e.g. "Công ty sản xuất các mặt hàng điện tử."
}

export interface ThemeConfig {
  id: string;
  name: string;
  badge: string;
  isVipOnly?: boolean;
  bgGradient: [string, string, string]; // Top, Mid, Bottom
  particleColor: string;
  lineColor: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  correctCardBg: string;
  correctCardBorder: string;
  correctCardText: string;
  correctBadgeBg: string;
  correctBadgeColor: string;
  accentColor: string;
  titleColor: string;
  subtitleColor: string;
}

export interface RenderSettings {
  aspectRatio: '9:16' | '16:9'; // Default 9:16 for Shorts/TikTok
  width: number; // 1080 for 9:16
  height: number; // 1920 for 9:16
  fps: number; // 60
  enableTTS: boolean;
  enableSFX: boolean;
  speechRate: number; // 0.8 - 1.2
  speechPitch: number; // 0.8 - 1.2
  voiceURI?: string;
  sfxVolume: number; // 0.0 - 1.0
  selectedThemeId: string;
}
