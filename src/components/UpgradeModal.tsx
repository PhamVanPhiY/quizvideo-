import React, { useState, useEffect, useMemo } from 'react';
import { Crown, Check, X, QrCode, KeyRound, Sparkles, ShieldCheck, Zap, Copy, CheckCheck, Maximize2, MessageCircle, RefreshCw, Loader2 } from 'lucide-react';
import { licenseManager } from '../services/licenseManager';
import { sePayService } from '../services/sepayService';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const [activationCode, setActivationCode] = useState('');
  const [codeMessage, setCodeMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'qr' | 'code'>('qr');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const isVip = licenseManager.isVip();
  const planAmount = 50000;

  // Generate unique order code per modal session (e.g. QUIZ8421)
  const orderCode = useMemo(() => sePayService.generateOrderCode(), [isOpen]);
  const transferContent = orderCode;

  // Bank VietQR configuration (MBBank with dynamic orderCode)
  const bankName = 'MBBank (Ngân Hàng Quân Đội)';
  const accountNumber = '8606120325604';
  const accountHolder = 'PHAM VAN PHI';
  const zaloNumber = '0971324117';
  const qrUrl = `https://img.vietqr.io/image/MB-8606120325604-compact2.png?amount=${planAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;

  // Start real-time SePay payment listener when modal is open and user is not VIP
  useEffect(() => {
    if (isOpen && !isVip) {
      sePayService.startPolling(orderCode, (tx) => {
        licenseManager.activateDirectVip('lifetime');
        setCodeMessage({
          text: `🎉 Đã nhận được ${Number(tx.amount_in).toLocaleString('vi-VN')}đ! Gói VIP Pro Trọn Đời đã được kích hoạt tự động!`,
          isError: false
        });
      }, 2500);
    }

    return () => {
      sePayService.stopPolling();
    };
  }, [isOpen, isVip, orderCode]);

  if (!isOpen) return null;

  const handleManualCheckPayment = async () => {
    setIsCheckingPayment(true);
    try {
      const res = await sePayService.checkPaymentStatus(orderCode, planAmount);
      if (res.paid && res.transaction) {
        licenseManager.activateDirectVip('lifetime');
        setCodeMessage({
          text: `🎉 Đã xác nhận thanh toán thành công! Gói VIP Pro Trọn Đời đã được kích hoạt!`,
          isError: false
        });
      } else {
        setCodeMessage({
          text: 'Chưa thấy giao dịch mới. Nếu bạn vừa chuyển, vui lòng chờ 5-10 giây để ngân hàng đồng bộ nhé!',
          isError: true
        });
      }
    } catch {
      setCodeMessage({
        text: 'Chưa thấy giao dịch. Vui lòng kiểm tra lại số tiền và nội dung chuyển khoản.',
        isError: true
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleActivateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) return;

    const res = licenseManager.activateCode(activationCode);
    if (res.success) {
      setCodeMessage({ text: res.message, isError: false });
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setCodeMessage({ text: res.message, isError: true });
    }
  };

  const handleQuickDemoVip = () => {
    licenseManager.activateDirectVip('lifetime');
    setCodeMessage({ text: '🎉 Đã kích hoạt VIP Pro Trọn Đời thành công!', isError: false });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleResetToFree = () => {
    licenseManager.resetToFree();
    setCodeMessage({ text: 'Đã chuyển về bản Free dùng thử', isError: false });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl shadow-amber-500/10 space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Crown className="w-6 h-6 text-slate-950 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-100">
                    {isVip ? 'Tài Khoản VIP Pro Của Bạn' : 'Nâng Cấp VIP Pro Trọn Đời'}
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                    {isVip ? 'Đã Kích Hoạt' : 'Dùng Vĩnh Viễn'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {isVip ? 'Bạn đang sở hữu toàn quyền sử dụng không giới hạn' : 'Mở khóa xuất video không giới hạn, xóa sạch logo watermark'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* IF ALREADY VIP: Show active VIP congratulations dashboard */}
          {isVip ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-950 to-indigo-950/40 border-2 border-amber-400/70 shadow-xl shadow-amber-500/15 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Crown className="w-8 h-8 text-slate-950 fill-current animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-300">
                    👑 BẠN ĐANG LÀ THÀNH VIÊN VIP PRO TRỌN ĐỜI
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Trạng thái: <span className="text-emerald-400 font-bold">Kích hoạt vĩnh viễn (Không giới hạn)</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>Xuất video không giới hạn</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>100% Xóa logo watermark</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>Mở toàn bộ Kho Từ Vựng 1-Click</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <Check className="w-4 h-4 stroke-[3] shrink-0" />
                    <span>Mở tất cả Themes VIP Pro</span>
                  </div>
                </div>
              </div>

              {/* Action buttons for existing VIP */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetToFree}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-400 transition-colors"
                  title="Chuyển về bản Free để kiểm thử"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Dùng thử lại bản Free</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
                >
                  Bắt Đầu Tạo Video Ngay
                </button>
              </div>
            </div>
          ) : (
            /* IF NOT VIP: Show standard Purchase & VietQR Screen */
            <>
              {/* Benefits Comparison Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-slate-400 flex items-center gap-1.5">
                    <span>🆓 Gói Miễn Phí (Free):</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    <li className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-500">•</span> Tối đa 3 video/ngày
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-500">•</span> Có Watermark góc dưới
                    </li>
                    <li className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-slate-500">•</span> 2 Giao diện cơ bản
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-indigo-500/10 border border-amber-500/40 space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    <span>👑 Quyền Lợi VIP Pro:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-200">
                    <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Xuất KHÔNG GIỚI HẠN
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Xóa 100% Watermark
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Kho từ vựng 1-Click TOEIC, IELTS
                    </li>
                    <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Mở toàn bộ Theme VIP
                    </li>
                  </ul>
                </div>
              </div>

              {/* Single Lifetime Pricing Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-indigo-950/40 border-2 border-amber-400/80 shadow-lg shadow-amber-500/20 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles className="w-4 h-4" /> GÓI VIP PRO TRỌN ĐỜI (VĨNH VIỄN)
                  </div>
                  <p className="text-xs text-slate-300">
                    Thanh toán 1 lần duy nhất — Sử dụng trọn đời, cập nhật miễn phí.
                  </p>
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="text-2xl font-black text-white bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    50.000đ
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Chỉ 50k dùng trọn đời
                  </div>
                </div>
              </div>

              {/* Payment Tabs: VietQR Bank Transfer OR Activation Key */}
              <div className="space-y-3 pt-1">
                <div className="flex border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('qr')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'qr'
                        ? 'border-amber-400 text-amber-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Quét Mã VietQR Chuyển Khoản</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'code'
                        ? 'border-amber-400 text-amber-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Nhập Mã Kích Hoạt VIP</span>
                  </button>
                </div>

                {activeTab === 'qr' ? (
                  <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* QR Code Container with Zoom Hover / Click */}
                      <div
                        onClick={() => setIsQrZoomed(true)}
                        className="group/qr relative w-40 h-40 bg-white p-2 rounded-2xl shrink-0 flex flex-col items-center justify-center shadow-xl cursor-pointer transition-transform hover:scale-105 border-2 border-slate-700 hover:border-amber-400"
                        title="Bấm vào để phóng to mã QR"
                      >
                        <img
                          src={qrUrl}
                          alt="Mã QR Chuyển Khoản Ngân Hàng"
                          className="w-full h-full object-contain"
                        />
                        {/* Zoom overlay badge */}
                        <div className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover/qr:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                          <Maximize2 className="w-6 h-6 text-amber-400" />
                          <span className="text-[10px] font-bold">Phóng To QR</span>
                        </div>
                      </div>

                      {/* Transfer Details */}
                      <div className="flex-1 space-y-2 text-xs w-full">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="text-slate-400">Ngân hàng:</span>
                          <span className="font-bold text-slate-200">{bankName}</span>
                        </div>

                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="text-slate-400">Số tài khoản:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-sky-400 text-sm">{accountNumber}</span>
                            <button
                              onClick={() => handleCopy(accountNumber, 'acc')}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Sao chép số tài khoản"
                            >
                              {copiedField === 'acc' ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="text-slate-400">Chủ tài khoản:</span>
                          <span className="font-bold text-slate-200">{accountHolder}</span>
                        </div>

                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="text-slate-400">Số tiền:</span>
                          <span className="font-bold text-emerald-400 text-sm">{planAmount.toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                          <span className="text-slate-400">Nội dung CK:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-amber-300">{transferContent}</span>
                            <button
                              onClick={() => handleCopy(transferContent, 'content')}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                              title="Sao chép nội dung"
                            >
                              {copiedField === 'content' ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {/* Direct Zalo Chat Contact */}
                        <div className="pt-1.5 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">Hỗ trợ 24/7:</span>
                          <a
                            href={`https://zalo.me/${zaloNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-blue-200 font-bold text-[11px] transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat Zalo ({zaloNumber})</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Real-time Auto-detection Radar Status & Manual Check Button */}
                    <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span>Đang chờ chuyển tiền... (Tự động kích hoạt sau 2s)</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleManualCheckPayment}
                        disabled={isCheckingPayment}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                      >
                        {isCheckingPayment ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                        )}
                        <span>{isCheckingPayment ? 'Đang kiểm tra...' : 'Tôi Đã Chuyển Tiền'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleActivateCode} className="space-y-3 bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Nhập mã kích hoạt VIP (License Key):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={activationCode}
                          onChange={(e) => setActivationCode(e.target.value)}
                          placeholder="VD: PHI2026 hoặc VIP50K"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono uppercase text-sky-200 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all"
                        >
                          Kích Hoạt
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      * Sau khi chuyển khoản, bạn nhắn tin Zalo: <b className="text-sky-400">{zaloNumber}</b> để nhận mã kích hoạt ngay trong 10 giây.
                    </div>
                  </form>
                )}

                {/* Code Feedback Message */}
                {codeMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    codeMessage.isError
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold'
                  }`}>
                    {codeMessage.isError ? <X className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
                    <span>{codeMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Demo Fast Unlock & Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Kích hoạt tự động & hỗ trợ 24/7</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickDemoVip}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors border border-slate-700"
                    title="Kích hoạt nhanh cho kiểm thử demo"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dùng Thử VIP Demo (1-Click)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FULLSCREEN QR CODE ZOOM LIGHTBOX MODAL */}
      {isQrZoomed && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-150"
          onClick={() => setIsQrZoomed(false)}
        >
          <div
            className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQrZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100 flex items-center justify-center gap-1.5">
                <QrCode className="w-5 h-5 text-amber-400" /> Quét Mã VietQR MBBank
              </h3>
              <p className="text-xs text-slate-400">
                Mở app ngân hàng bất kỳ để quét mã thanh toán 50.000đ
              </p>
            </div>

            {/* Enlarged QR */}
            <div className="w-64 h-64 mx-auto bg-white p-3 rounded-2xl shadow-2xl border-4 border-amber-400/30">
              <img
                src={qrUrl}
                alt="Mã QR Chuyển Khoản Phóng To"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-xs space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono">
              <div>STK: <b className="text-sky-400">{accountNumber}</b> ({bankName})</div>
              <div>Chủ TK: <b className="text-slate-100">{accountHolder}</b></div>
              <div>Số tiền: <b className="text-emerald-400">50.000 đ</b></div>
              <div>Nội dung: <b className="text-amber-300">{transferContent}</b></div>
            </div>

            <button
              onClick={() => setIsQrZoomed(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Thu Nhỏ / Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};
