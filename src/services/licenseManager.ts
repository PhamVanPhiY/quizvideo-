// License & Quota Manager for Freemium / VIP Pro SaaS Model

export interface LicenseState {
  isVip: boolean;
  vipType?: 'monthly' | 'lifetime';
  vipExpiry?: string; // ISO date string or 'lifetime'
  activationCode?: string;
  dailyExportCount: number;
  lastExportDate: string; // YYYY-MM-DD
}

const STORAGE_KEY = 'quizvideo_license_state';
export const FREE_DAILY_LIMIT = 3;

// Valid activation codes (In real production, you can generate more or connect to a webhook)
const VALID_ACTIVATION_CODES: Record<string, { type: 'monthly' | 'lifetime'; days?: number }> = {
  'PHI2026': { type: 'lifetime' },
  'PHIVIP50K': { type: 'lifetime' },
  'VIP50K': { type: 'lifetime' },
  'PRO50K': { type: 'lifetime' },
  'QUIZVIP50K': { type: 'lifetime' },
  'VIP2026': { type: 'lifetime' },
  'LIFETIME999': { type: 'lifetime' },
  'ADMIN_TEST': { type: 'lifetime' },
};

class LicenseManager {
  private state: LicenseState;
  private listeners: Array<(state: LicenseState) => void> = [];

  constructor() {
    this.state = this.loadState();
  }

  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private loadState(): LicenseState {
    const today = this.getTodayDateString();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LicenseState;
        // Check VIP expiration if not lifetime
        if (parsed.isVip && parsed.vipExpiry && parsed.vipExpiry !== 'lifetime') {
          const expiryDate = new Date(parsed.vipExpiry);
          if (new Date() > expiryDate) {
            parsed.isVip = false;
            parsed.vipType = undefined;
            parsed.vipExpiry = undefined;
          }
        }
        // Reset daily counter if new day
        if (parsed.lastExportDate !== today) {
          parsed.dailyExportCount = 0;
          parsed.lastExportDate = today;
        }
        return parsed;
      }
    } catch {
      // fallback
    }

    return {
      isVip: false,
      dailyExportCount: 0,
      lastExportDate: today,
    };
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // fallback
    }
    this.notifyListeners();
  }

  public subscribe(listener: (state: LicenseState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  public getState(): LicenseState {
    return { ...this.state };
  }

  public isVip(): boolean {
    return this.state.isVip;
  }

  public getRemainingExportsToday(): number {
    if (this.state.isVip) return Infinity;
    return Math.max(0, FREE_DAILY_LIMIT - this.state.dailyExportCount);
  }

  public canExport(count: number = 1): { allowed: boolean; remaining: number; reason?: string } {
    if (this.state.isVip) {
      return { allowed: true, remaining: Infinity };
    }
    const remaining = this.getRemainingExportsToday();
    if (remaining < count) {
      return {
        allowed: false,
        remaining,
        reason: `Bạn đã dùng hết ${this.state.dailyExportCount}/${FREE_DAILY_LIMIT} lượt xuất miễn phí hôm nay. Hãy nâng cấp VIP Pro để xuất không giới hạn!`
      };
    }
    return { allowed: true, remaining };
  }

  public recordExport(count: number = 1) {
    if (this.state.isVip) return;
    this.state.dailyExportCount += count;
    this.state.lastExportDate = this.getTodayDateString();
    this.saveState();
  }

  public activateCode(code: string): { success: boolean; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const found = VALID_ACTIVATION_CODES[cleanCode];

    if (!found) {
      return {
        success: false,
        message: 'Mã kích hoạt không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại!'
      };
    }

    let expiry: string = 'lifetime';
    if (found.type === 'monthly' && found.days) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + found.days);
      expiry = expDate.toISOString();
    }

    this.state.isVip = true;
    this.state.vipType = found.type;
    this.state.vipExpiry = expiry;
    this.state.activationCode = cleanCode;
    this.saveState();

    return {
      success: true,
      message: found.type === 'lifetime'
        ? '🎉 Kích hoạt VIP Pro Trọn Đời thành công! Bạn đã mở khóa toàn bộ tính năng không giới hạn!'
        : `🎉 Kích hoạt VIP Pro 30 Ngày thành công!`
    };
  }

  public activateDirectVip(type: 'monthly' | 'lifetime') {
    let expiry: string = 'lifetime';
    if (type === 'monthly') {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);
      expiry = expDate.toISOString();
    }
    this.state.isVip = true;
    this.state.vipType = type;
    this.state.vipExpiry = expiry;
    this.state.activationCode = `DIRECT_${type.toUpperCase()}`;
    this.saveState();
  }

  public resetToFree() {
    this.state.isVip = false;
    this.state.vipType = undefined;
    this.state.vipExpiry = undefined;
    this.state.activationCode = undefined;
    this.saveState();
  }
}

export const licenseManager = new LicenseManager();
