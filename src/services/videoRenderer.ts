import type { QuizItem, ThemeConfig } from '../types/quiz';
import { getThemeById } from './themes';

export interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isSparkle?: boolean;
}

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 1080;
  private height: number = 1920;
  private particles: StarParticle[] = [];
  private theme: ThemeConfig;
  private imageCache: Map<string, HTMLImageElement> = new Map();

  constructor(canvas: HTMLCanvasElement, themeId: string = 'starry-blue') {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2D context from canvas');
    this.ctx = context;
    this.theme = getThemeById(themeId);
    this.initParticles();
  }

  public setTheme(themeId: string) {
    this.theme = getThemeById(themeId);
  }

  public setDimensions(width: number = 1080, height: number = 1920) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.initParticles();
  }

  private drawChannelLogo(quiz: QuizItem) {
    if (!quiz.channelLogo) return;

    let img = this.imageCache.get(quiz.channelLogo);
    if (!img) {
      img = new Image();
      img.src = quiz.channelLogo;
      this.imageCache.set(quiz.channelLogo, img);
    }

    if (!img.complete || img.naturalWidth === 0) return;

    // Larger, high-visibility avatar size (Default: 115px)
    const size = quiz.logoSize || 115;
    const pos = quiz.logoPosition || 'top-left';
    const shape = quiz.logoShape || 'circle';
    const opacity = quiz.logoOpacity !== undefined ? quiz.logoOpacity : 1.0;
    const showText = quiz.showLogoText !== false && !!quiz.channelName;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    let cx = 75 + size / 2;
    let cy = 70 + size / 2;

    if (pos === 'top-center') {
      cx = this.width / 2;
      cy = 80 + size / 2;
    } else if (pos === 'top-right') {
      cx = this.width - 75 - size / 2;
      cy = 70 + size / 2;
    }

    // If Top-Left with Channel Name: Render a sleek Glassmorphic Pill Badge with Auto-Scaled Text & Curve Clearance
    if (pos === 'top-left' && showText) {
      const channelText = quiz.channelName || '';
      const pillX = 65;
      const pillY = 66;
      const pillH = size + 12;
      const radius = pillH / 2;
      const textStartX = pillX + size + 20;

      const maxPillW = 560;
      const maxTextW = maxPillW - (textStartX - pillX) - (radius + 20);

      let fontSize = 26;
      this.ctx.font = `800 ${fontSize}px "Outfit", "Inter", sans-serif`;
      this.ctx.letterSpacing = '1px';
      let measuredW = this.ctx.measureText(channelText.toUpperCase()).width;

      // 1. Auto-shrink font size proportionally if text is long
      if (measuredW > maxTextW) {
        fontSize = Math.max(16, Math.floor(26 * (maxTextW / measuredW)));
        this.ctx.font = `800 ${fontSize}px "Outfit", "Inter", sans-serif`;
        this.ctx.letterSpacing = '1px';
        measuredW = this.ctx.measureText(channelText.toUpperCase()).width;
      }

      // 2. If STILL exceeds maxTextW at min font size 16px, truncate cleanly with ellipsis
      let displayText = channelText.toUpperCase();
      if (measuredW > maxTextW) {
        while (displayText.length > 2 && this.ctx.measureText(displayText + '...').width > maxTextW) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '...';
        measuredW = this.ctx.measureText(displayText).width;
      }

      // 3. Exact dynamic pill width with safe clearance before the right semicircular cap
      const pillW = (textStartX - pillX) + measuredW + radius + 15;

      // Draw Glassmorphic Pill
      this.drawRoundedRect(
        pillX,
        pillY,
        pillW,
        pillH,
        radius,
        'rgba(15, 23, 42, 0.85)',
        'rgba(56, 189, 248, 0.45)',
        2.5
      );

      // Channel Name Text next to logo (Guaranteed to sit comfortably with plenty of room)
      this.ctx.font = `800 ${fontSize}px "Outfit", "Inter", sans-serif`;
      this.ctx.letterSpacing = '1px';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(displayText, textStartX, pillY + pillH / 2);

      cx = pillX + radius;
      cy = pillY + pillH / 2;
    }

    // Draw Glowing Ring & Avatar Image
    this.ctx.shadowColor = this.theme.accentColor || 'rgba(56, 189, 248, 0.65)';
    this.ctx.shadowBlur = 22;

    if (shape === 'circle') {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.strokeStyle = this.theme.accentColor || '#38bdf8';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();

      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      this.ctx.clip();
      this.ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);

    } else if (shape === 'rounded') {
      const x = cx - size / 2;
      const y = cy - size / 2;
      this.ctx.beginPath();
      this.ctx.roundRect(x - 4, y - 4, size + 8, size + 8, 22);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.strokeStyle = this.theme.accentColor || '#38bdf8';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();

      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, size, size, 18);
      this.ctx.clip();
      this.ctx.drawImage(img, x, y, size, size);

    } else if (shape === 'square') {
      const x = cx - size / 2;
      const y = cy - size / 2;
      this.ctx.beginPath();
      this.ctx.rect(x - 4, y - 4, size + 8, size + 8);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.strokeStyle = this.theme.accentColor || '#38bdf8';
      this.ctx.lineWidth = 4;
      this.ctx.stroke();

      this.ctx.shadowBlur = 0;
      this.ctx.drawImage(img, x, y, size, size);
    } else {
      // Original transparent
      const x = cx - size / 2;
      const y = cy - size / 2;
      this.ctx.shadowBlur = 0;
      this.ctx.drawImage(img, x, y, size, size);
    }

    this.ctx.restore();
  }

  private initParticles() {
    this.particles = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2.5 + 1.2,
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        isSparkle: i % 4 === 0
      });
    }
  }

  private updateParticles() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.twinklePhase += p.twinkleSpeed;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;
    }
  }

  // Draw 4-point diamond star sparkle
  private drawSparkleStar(cx: number, cy: number, size: number, alpha: number) {
    this.ctx.save();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size);
    this.ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    this.ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    this.ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    this.ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    this.ctx.fill();
    this.ctx.restore();
  }

  // Draw background gradient & constellation mesh
  private drawBackground() {
    const { bgGradient, lineColor, particleColor } = this.theme;

    // Background Linear Gradient
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, bgGradient[0]);
    grad.addColorStop(0.5, bgGradient[1]);
    grad.addColorStop(1, bgGradient[2]);

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Subtle Radial Glow
    const radialGlow = this.ctx.createRadialGradient(
      this.width / 2, this.height * 0.35, 80,
      this.width / 2, this.height * 0.35, this.width * 0.75
    );
    radialGlow.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = radialGlow;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw Constellation Lines between nearby particles (Batched into 1 draw call for ultra-high 60fps performance)
    this.ctx.save();
    this.ctx.strokeStyle = lineColor || 'rgba(165, 212, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    const maxDistSq = 170 * 170;
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        if (dx * dx + dy * dy < maxDistSq) {
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
        }
      }
    }
    this.ctx.stroke();
    this.ctx.restore();

    // Draw Particles
    for (const p of this.particles) {
      const alpha = Math.max(0.1, Math.min(1, p.baseAlpha + Math.sin(p.twinklePhase) * 0.4));
      if (p.isSparkle) {
        this.drawSparkleStar(p.x, p.y, p.radius * 3.5, alpha);
      } else {
        this.ctx.fillStyle = particleColor.replace(/[\d.]+\)$/, `${alpha})`);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  // Draw rounded rectangle helper
  private drawRoundedRect(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number,
    fillStyle: string | CanvasGradient,
    strokeStyle?: string,
    lineWidth: number = 2
  ) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, radius);
    this.ctx.fillStyle = fillStyle;
    this.ctx.fill();
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle;
      this.ctx.lineWidth = lineWidth;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  // Draw Checkmark icon
  private drawCheckmark(cx: number, cy: number, size: number, color: string) {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = size * 0.24;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - size * 0.45, cy);
    this.ctx.lineTo(cx - size * 0.1, cy + size * 0.4);
    this.ctx.lineTo(cx + size * 0.55, cy - size * 0.35);
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Smart Word Wrap Utility for Canvas
   * Breaks text into lines that do not exceed maxWidth
   */
  private getWrappedLines(text: string, maxWidth: number, font: string): string[] {
    this.ctx.save();
    this.ctx.font = font;

    const rawSegments = text.split('\n');
    const lines: string[] = [];

    for (const segment of rawSegments) {
      const words = segment.trim().split(/\s+/);
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = this.ctx.measureText(testLine).width;

        if (testWidth <= maxWidth || currentLine === '') {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    this.ctx.restore();
    return lines.length > 0 ? lines : [text];
  }

  /**
   * Draw Wrapped Multi-line text centered or aligned
   */
  private drawWrappedText(
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    lineHeight: number,
    font: string,
    fillStyle: string,
    align: CanvasTextAlign = 'center'
  ): { nextY: number; lines: string[]; maxLineWidth: number } {
    this.ctx.save();
    this.ctx.font = font;
    this.ctx.fillStyle = fillStyle;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'middle';

    const lines = this.getWrappedLines(text, maxWidth, font);
    let maxLineWidth = 0;

    lines.forEach((line, idx) => {
      const lineY = startY + idx * lineHeight;
      const lineWidth = this.ctx.measureText(line).width;
      if (lineWidth > maxLineWidth) maxLineWidth = lineWidth;
      this.ctx.fillText(line, x, lineY);
    });

    this.ctx.restore();
    return {
      nextY: startY + (lines.length - 1) * lineHeight + lineHeight,
      lines,
      maxLineWidth,
    };
  }

  /**
   * Main Render Frame function
   * @param quiz Current Quiz Item
   * @param currentTime Current progress time in seconds (0.0 to totalDuration)
   * @param isVip Whether user has VIP Pro (removes watermark)
   */
  public renderFrame(quiz: QuizItem, currentTime: number, isVip: boolean = false) {
    this.updateParticles();
    this.drawBackground();

    const countdownTotal = quiz.countdownSeconds || 5;
    const revealDuration = quiz.revealDurationSeconds || 4;
    const hasInteractive = quiz.enableInteractive !== false && !!(quiz.interactiveQuestion || quiz.interactiveVoiceText)?.trim();
    const isInteractiveStage = hasInteractive && currentTime >= (countdownTotal + revealDuration);

    if (isInteractiveStage) {
      this.drawInteractiveStage(quiz, currentTime, countdownTotal, revealDuration, isVip);
      return;
    }

    const isRevealed = currentTime >= countdownTotal;
    const remainingTime = Math.max(0, countdownTotal - currentTime);

    // 1. Channel Logo & Channel Header & Category
    this.drawChannelLogo(quiz);

    const isTopLeftWithText = quiz.channelLogo && (quiz.logoPosition === 'top-left' || !quiz.logoPosition) && quiz.showLogoText !== false && !!quiz.channelName;
    const hasTopCenterLogo = quiz.channelLogo && quiz.logoPosition === 'top-center';
    const channelTitle = quiz.channelName || 'BIN HỌC TIẾNG ANH';

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Only render top-center channel title if not already shown inside top-left badge
    if (!isTopLeftWithText) {
      const channelHeaderY = hasTopCenterLogo ? 165 : 125;
      this.ctx.font = '700 30px "Outfit", "Inter", sans-serif';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      this.ctx.letterSpacing = '5px';
      this.ctx.fillText(channelTitle.toUpperCase(), this.width / 2, channelHeaderY);
    }

    if (quiz.category) {
      const catText = quiz.category.toUpperCase();
      this.ctx.font = '600 22px "Outfit", "Inter", sans-serif';
      this.ctx.letterSpacing = '2px';
      const textWidth = this.ctx.measureText(catText).width;
      const padX = 26;
      const badgeH = 42;
      const categoryY = isTopLeftWithText ? 245 : hasTopCenterLogo ? 225 : 172;

      this.drawRoundedRect(
        this.width / 2 - textWidth / 2 - padX,
        categoryY - badgeH / 2,
        textWidth + padX * 2,
        badgeH,
        21,
        'rgba(56, 189, 248, 0.15)',
        'rgba(56, 189, 248, 0.4)',
        1.5
      );
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillText(catText, this.width / 2, categoryY);
    }
    this.ctx.restore();

    // 2. Main Word / Question Title (Auto-scaled for long text)
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const maxWordWidth = 860;
    let wordFontSize = 110;
    this.ctx.font = `900 ${wordFontSize}px "Montserrat", "Outfit", sans-serif`;
    let measuredWordW = this.ctx.measureText(quiz.word).width;
    if (measuredWordW > maxWordWidth) {
      wordFontSize = Math.max(54, Math.floor(110 * (maxWordWidth / measuredWordW)));
      this.ctx.font = `900 ${wordFontSize}px "Montserrat", "Outfit", sans-serif`;
    }

    const wordY = isTopLeftWithText || hasTopCenterLogo ? 375 : 330;
    this.ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
    this.ctx.shadowBlur = 30;
    this.ctx.fillStyle = this.theme.titleColor;
    this.ctx.letterSpacing = '2px';
    this.ctx.fillText(quiz.word, this.width / 2, wordY);
    this.ctx.shadowBlur = 0; // Reset glow

    // IPA Pronunciation (if available)
    let currentY = wordY + 68;
    if (quiz.ipa) {
      this.ctx.font = '500 38px "Outfit", "Inter", sans-serif';
      this.ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
      this.ctx.fillText(quiz.ipa, this.width / 2, currentY);
      currentY += 60;
    }

    // Question Prompt (e.g. "nghĩa là gì?") with auto text wrap
    const questionFont = '700 52px "Outfit", "Inter", sans-serif';
    const qResult = this.drawWrappedText(
      quiz.question,
      this.width / 2,
      currentY,
      860,
      58,
      questionFont,
      this.theme.subtitleColor,
      'center'
    );
    currentY = qResult.nextY;
    this.ctx.restore();

    // 3. Countdown Timer Widget
    const timerCenterY = currentY + 70;
    if (!isRevealed) {
      // Countdown Timer Visual
      const progress = remainingTime / countdownTotal;
      const radius = 42;

      // Outer ring background
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(this.width / 2, timerCenterY, radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = 6;
      this.ctx.stroke();

      // Active glowing countdown arc
      this.ctx.beginPath();
      this.ctx.arc(
        this.width / 2,
        timerCenterY,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * progress,
        false
      );
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 7;
      this.ctx.lineCap = 'round';
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 16;
      this.ctx.stroke();

      // Countdown number text
      this.ctx.shadowBlur = 0;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = '800 42px "Outfit", sans-serif';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(Math.ceil(remainingTime).toString(), this.width / 2, timerCenterY + 2);
      this.ctx.restore();
    } else {
      // Time's up indicator
      this.ctx.save();
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.font = '700 32px "Outfit", sans-serif';
      this.ctx.fillStyle = '#4ade80';
      this.ctx.fillText('✨ ĐÁP ÁN ĐÚNG ✨', this.width / 2, timerCenterY);
      this.ctx.restore();
    }

    // 4. Four Options A, B, C, D with Multi-line / Font-scaling Support
    const cardStartX = 110;
    const cardWidth = this.width - cardStartX * 2; // 860px
    const cardHeight = 120;
    const cardSpacing = 26;
    const startY = timerCenterY + 65;

    quiz.options.forEach((opt, index) => {
      const cardY = startY + index * (cardHeight + cardSpacing);
      const isCorrectOption = opt.key.toUpperCase() === quiz.correctAnswer.toUpperCase();

      this.ctx.save();

      const maxOptTextWidth = cardWidth - 90 - (isRevealed && isCorrectOption ? 95 : 30);
      const fullOptText = `${opt.key}. ${opt.text}`;

      if (isRevealed && isCorrectOption) {
        // --- CORRECT ANSWER HIGHLIGHT CARD ---
        const popScale = Math.min(1.03, 1 + (currentTime - countdownTotal) * 0.08);
        const centerX = cardStartX + cardWidth / 2;
        const centerY = cardY + cardHeight / 2;

        this.ctx.translate(centerX, centerY);
        this.ctx.scale(popScale, popScale);
        this.ctx.translate(-centerX, -centerY);

        // Green Outer Glow
        this.ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
        this.ctx.shadowBlur = 35;

        // Card White Background with Green Border
        this.drawRoundedRect(
          cardStartX,
          cardY,
          cardWidth,
          cardHeight,
          24,
          this.theme.correctCardBg,
          this.theme.correctCardBorder,
          6
        );
        this.ctx.shadowBlur = 0; // Reset

        // Render Option Text with Auto-wrap / font size
        let optFont = '800 50px "Outfit", "Inter", sans-serif';
        this.ctx.font = optFont;
        const textW = this.ctx.measureText(fullOptText).width;

        if (textW > maxOptTextWidth) {
          const lines = this.getWrappedLines(fullOptText, maxOptTextWidth, '800 38px "Outfit", sans-serif');
          this.ctx.font = '800 38px "Outfit", sans-serif';
          this.ctx.fillStyle = this.theme.correctCardText;
          this.ctx.textAlign = 'left';
          this.ctx.textBaseline = 'middle';
          lines.forEach((line, lIdx) => {
            const ly = cardY + cardHeight / 2 + (lIdx - (lines.length - 1) / 2) * 44;
            this.ctx.fillText(line, cardStartX + 44, ly);
          });
        } else {
          this.ctx.font = optFont;
          this.ctx.fillStyle = this.theme.correctCardText;
          this.ctx.textAlign = 'left';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(fullOptText, cardStartX + 44, cardY + cardHeight / 2);
        }

        // Big Green Checkmark Icon on the right
        const checkX = cardStartX + cardWidth - 75;
        const checkY = cardY + cardHeight / 2;
        const checkSize = 48;
        this.drawCheckmark(checkX, checkY, checkSize, '#16a34a');

      } else {
        // --- NORMAL / UNREVEALED CARD ---
        let opacity = 1.0;
        if (isRevealed) {
          opacity = 0.35;
        }

        this.ctx.globalAlpha = opacity;
        this.drawRoundedRect(
          cardStartX,
          cardY,
          cardWidth,
          cardHeight,
          24,
          this.theme.cardBg,
          this.theme.cardBorder,
          2
        );

        let optFont = '700 48px "Outfit", "Inter", sans-serif';
        this.ctx.font = optFont;
        const textW = this.ctx.measureText(fullOptText).width;

        if (textW > maxOptTextWidth) {
          const lines = this.getWrappedLines(fullOptText, maxOptTextWidth, '700 38px "Outfit", sans-serif');
          this.ctx.font = '700 38px "Outfit", sans-serif';
          this.ctx.fillStyle = this.theme.cardText;
          this.ctx.textAlign = 'left';
          this.ctx.textBaseline = 'middle';
          lines.forEach((line, lIdx) => {
            const ly = cardY + cardHeight / 2 + (lIdx - (lines.length - 1) / 2) * 44;
            this.ctx.fillText(line, cardStartX + 44, ly);
          });
        } else {
          this.ctx.font = optFont;
          this.ctx.fillStyle = this.theme.cardText;
          this.ctx.textAlign = 'left';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(fullOptText, cardStartX + 44, cardY + cardHeight / 2);
        }
      }

      this.ctx.restore();
    });

    // 5. Bottom Section: Multi-line Wrapped Note, Explanation, and Example
    if (isRevealed) {
      const revealProgress = Math.min(1, (currentTime - countdownTotal) / 0.5);
      const bottomAreaY = startY + 4 * (cardHeight + cardSpacing) + 20;

      this.ctx.save();
      this.ctx.globalAlpha = revealProgress;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      let currentBottomY = bottomAreaY + 30;

      // --- Note (Auto-wrapped Multi-line with elegant underline) ---
      if (quiz.note) {
        const noteFont = 'italic 700 42px "Playfair Display", "Merriweather", serif';
        const noteRes = this.drawWrappedText(
          quiz.note,
          this.width / 2,
          currentBottomY,
          860,
          54,
          noteFont,
          '#ffffff',
          'center'
        );

        // Underline divider below note
        const dividerWidth = Math.min(600, Math.max(220, noteRes.maxLineWidth + 40));
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2 - dividerWidth / 2, noteRes.nextY - 8);
        this.ctx.lineTo(this.width / 2 + dividerWidth / 2, noteRes.nextY - 8);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        currentBottomY = noteRes.nextY + 32;
      }

      // --- Explanation (Auto-wrapped Multi-line) ---
      if (quiz.explanation) {
        const expFont = '700 40px "Outfit", "Inter", sans-serif';
        const expRes = this.drawWrappedText(
          quiz.explanation,
          this.width / 2,
          currentBottomY,
          860,
          50,
          expFont,
          '#f0fdf4',
          'center'
        );
        currentBottomY = expRes.nextY + 28;
      }

      // --- Example Card (Auto-wrapped Multi-line English & Vietnamese) ---
      if (quiz.example) {
        const enFont = 'italic 500 34px "Inter", sans-serif';
        const viFont = '400 30px "Inter", sans-serif';
        const maxContentW = cardWidth - 64; // ~796px

        const enLines = this.getWrappedLines(`“${quiz.example}”`, maxContentW, enFont);
        const viLines = quiz.exampleMeaning
          ? this.getWrappedLines(`(${quiz.exampleMeaning})`, maxContentW, viFont)
          : [];

        const enLineH = 44;
        const viLineH = 40;
        const padY = 24;

        const totalCardH = padY * 2 + (enLines.length * enLineH) + (viLines.length > 0 ? (viLines.length * viLineH + 12) : 0);

        // Draw card background
        this.drawRoundedRect(
          cardStartX,
          currentBottomY - 10,
          cardWidth,
          totalCardH,
          20,
          'rgba(15, 23, 42, 0.7)',
          'rgba(56, 189, 248, 0.35)',
          1.5
        );

        let textY = currentBottomY + padY;

        // Draw English lines
        this.ctx.font = enFont;
        this.ctx.fillStyle = '#e0f2fe';
        enLines.forEach((line) => {
          this.ctx.fillText(line, this.width / 2, textY);
          textY += enLineH;
        });

        // Draw Vietnamese lines
        if (viLines.length > 0) {
          textY += 6;
          this.ctx.font = viFont;
          this.ctx.fillStyle = '#94a3b8';
          viLines.forEach((line) => {
            this.ctx.fillText(line, this.width / 2, textY);
            textY += viLineH;
          });
        }
      }

      this.ctx.restore();
    }

    // 6. Watermark for Free Plan (Automatically removed for VIP Pro)
    if (!isVip) {
      this.ctx.save();
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'bottom';
      this.ctx.font = '600 24px "Outfit", "Inter", sans-serif';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.letterSpacing = '1px';
      this.ctx.fillText('⚡ Tạo bởi QuizVideo Studio (Bản Miễn Phí)', this.width - 60, this.height - 40);
      this.ctx.restore();
    }
  }

  /**
   * Render the Interactive Audience Engagement Stage (Call-To-Action Question)
   */
  private drawInteractiveStage(
    quiz: QuizItem,
    currentTime: number,
    countdownTotal: number,
    revealDuration: number,
    isVip: boolean = false
  ) {
    const elapsedInStage = currentTime - (countdownTotal + revealDuration);
    const entryProgress = Math.min(1, elapsedInStage / 0.4);

    // 1. Channel Logo & Channel Header
    this.drawChannelLogo(quiz);

    const isTopLeftWithText = quiz.channelLogo && (quiz.logoPosition === 'top-left' || !quiz.logoPosition) && quiz.showLogoText !== false && !!quiz.channelName;
    const hasTopCenterLogo = quiz.channelLogo && quiz.logoPosition === 'top-center';
    const channelTitle = quiz.channelName || 'BIN HỌC TIẾNG ANH';

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    if (!isTopLeftWithText) {
      const channelHeaderY = hasTopCenterLogo ? 165 : 125;
      this.ctx.font = '700 30px "Outfit", "Inter", sans-serif';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      this.ctx.letterSpacing = '5px';
      this.ctx.fillText(channelTitle.toUpperCase(), this.width / 2, channelHeaderY);
    }

    // 2. Top Interactive Header Badge
    const badgeY = isTopLeftWithText ? 245 : hasTopCenterLogo ? 225 : 185;
    const badgeText = '🔥 THỬ THÁCH KHÁN GIẢ 🔥';
    this.ctx.font = '800 24px "Outfit", "Inter", sans-serif';
    this.ctx.letterSpacing = '3px';
    const bTextW = this.ctx.measureText(badgeText).width;
    const bPadX = 32;
    const bH = 48;

    this.drawRoundedRect(
      this.width / 2 - bTextW / 2 - bPadX,
      badgeY - bH / 2,
      bTextW + bPadX * 2,
      bH,
      24,
      'rgba(245, 158, 11, 0.18)',
      'rgba(245, 158, 11, 0.65)',
      2
    );
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillText(badgeText, this.width / 2, badgeY);
    this.ctx.restore();

    // 3. Main Glassmorphic Interactive Card
    const cardStartX = 90;
    const cardWidth = this.width - cardStartX * 2; // 900px
    const cardY = badgeY + 65;
    const cardHeight = 640;

    this.ctx.save();
    this.ctx.globalAlpha = entryProgress;

    // Pop scale entry animation
    const scale = 0.96 + entryProgress * 0.04;
    const centerX = this.width / 2;
    const centerY = cardY + cardHeight / 2;
    this.ctx.translate(centerX, centerY);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-centerX, -centerY);

    // Glowing border for main question card
    this.ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    this.ctx.shadowBlur = 30;

    // Card Gradient Background
    const cardGrad = this.ctx.createLinearGradient(cardStartX, cardY, cardStartX + cardWidth, cardY + cardHeight);
    cardGrad.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
    cardGrad.addColorStop(1, 'rgba(30, 41, 59, 0.92)');

    this.drawRoundedRect(
      cardStartX,
      cardY,
      cardWidth,
      cardHeight,
      32,
      cardGrad,
      'rgba(56, 189, 248, 0.6)',
      3
    );
    this.ctx.shadowBlur = 0; // reset glow

    // Sub-title inside card: "CÂU HỎI DÀNH CHO BẠN:"
    const headerInsideY = cardY + 65;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = '800 24px "Outfit", "Inter", sans-serif';
    this.ctx.letterSpacing = '3px';
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillText('💬 CÂU HỎI DÀNH CHO BẠN:', this.width / 2, headerInsideY);

    // Subtle divider line
    this.ctx.beginPath();
    this.ctx.moveTo(cardStartX + 120, headerInsideY + 36);
    this.ctx.lineTo(cardStartX + cardWidth - 120, headerInsideY + 36);
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Main Question Text (Auto-wrapped and auto-sized)
    const questionText = (quiz.interactiveQuestion || quiz.interactiveVoiceText || '').trim();
    const maxQWidth = cardWidth - 100; // 800px
    let qFontSize = 54;
    if (questionText.length > 90) qFontSize = 44;
    if (questionText.length > 150) qFontSize = 38;

    const qFont = `800 ${qFontSize}px "Outfit", "Inter", sans-serif`;
    const qLineHeight = qFontSize + 18;

    const qLines = this.getWrappedLines(questionText, maxQWidth, qFont);
    const totalTextH = qLines.length * qLineHeight;
    const textStartY = cardY + 120 + (cardHeight - 160 - totalTextH) / 2 + qLineHeight / 2;

    this.ctx.font = qFont;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.letterSpacing = '0.5px';

    qLines.forEach((line, idx) => {
      this.ctx.fillText(line, this.width / 2, textStartY + idx * qLineHeight);
    });

    this.ctx.restore();

    // 4. Call-to-Action (CTA) Banner Below
    const ctaY = cardY + cardHeight + 45;
    const ctaPrompt = quiz.interactivePrompt || 'Bình luận đáp án của bạn bên dưới nhé! 👇';
    const pulse = 1 + Math.sin(currentTime * 4) * 0.02;

    this.ctx.save();
    this.ctx.globalAlpha = entryProgress;
    this.ctx.translate(this.width / 2, ctaY + 45);
    this.ctx.scale(pulse, pulse);
    this.ctx.translate(-this.width / 2, -(ctaY + 45));

    const ctaH = 90;
    this.ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
    this.ctx.shadowBlur = 24;

    const ctaGrad = this.ctx.createLinearGradient(cardStartX, ctaY, cardStartX + cardWidth, ctaY + ctaH);
    ctaGrad.addColorStop(0, 'rgba(22, 101, 52, 0.9)');
    ctaGrad.addColorStop(1, 'rgba(5, 150, 105, 0.9)');

    this.drawRoundedRect(
      cardStartX,
      ctaY,
      cardWidth,
      ctaH,
      28,
      ctaGrad,
      'rgba(74, 222, 128, 0.8)',
      3
    );
    this.ctx.shadowBlur = 0;

    // CTA Text
    this.ctx.font = '800 36px "Outfit", "Inter", sans-serif';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(ctaPrompt, this.width / 2, ctaY + ctaH / 2);
    this.ctx.restore();

    // 5. Bottom Extra Engagement Tip
    this.ctx.save();
    this.ctx.globalAlpha = Math.min(1, Math.max(0, (elapsedInStage - 0.3) / 0.5));
    this.ctx.font = '600 28px "Outfit", sans-serif';
    this.ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('⚡ Xem ai là người đầu tiên trả lời chính xác nhất! 🏆', this.width / 2, ctaY + ctaH + 65);
    this.ctx.restore();

    // 6. Watermark for Free Plan
    if (!isVip) {
      this.ctx.save();
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'bottom';
      this.ctx.font = '600 24px "Outfit", "Inter", sans-serif';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.letterSpacing = '1px';
      this.ctx.fillText('⚡ Tạo bởi QuizVideo Studio (Bản Miễn Phí)', this.width - 60, this.height - 40);
      this.ctx.restore();
    }
  }

  /**
   * Export video as WebM / MP4 using MediaRecorder with full synchronized audio
   */
  public async exportVideo(
    quiz: QuizItem,
    audioStream: MediaStream | null,
    onProgress: (progress: number) => void,
    isVip: boolean = false,
    interactiveBufferDuration?: number
  ): Promise<Blob> {
    const countdown = quiz.countdownSeconds || 5;
    const reveal = quiz.revealDurationSeconds || 4;
    const hasInteractive = quiz.enableInteractive !== false && !!(quiz.interactiveQuestion || quiz.interactiveVoiceText)?.trim();
    const speed = quiz.interactiveVoiceSpeed || 1.05;
    const effectiveVoiceDuration = interactiveBufferDuration && interactiveBufferDuration > 0
      ? (interactiveBufferDuration / speed)
      : 0;
    const minVoiceDuration = effectiveVoiceDuration > 0
      ? Math.ceil(effectiveVoiceDuration + 0.8)
      : 0;
    const configuredInteractive = quiz.interactiveDurationSeconds || 4;
    const interactive = hasInteractive ? Math.max(configuredInteractive, minVoiceDuration) : 0;
    const totalDuration = countdown + reveal + interactive;
    const fps = 60;

    // Prepare canvas video stream
    const canvasStream = this.canvas.captureStream(fps);
    const videoTrack = canvasStream.getVideoTracks()[0];
    const combinedTracks: MediaStreamTrack[] = videoTrack ? [videoTrack] : [];

    if (audioStream) {
      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length > 0) {
        combinedTracks.push(audioTracks[0]);
      }
    }

    const combinedStream = new MediaStream(combinedTracks);

    // Check MIME type support with opus audio
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
    }

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 8000000, // 8 Mbps high quality
      audioBitsPerSecond: 192000   // 192 kbps crisp audio
    });

    const recordedChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(recordedChunks, { type: mimeType });
        resolve(finalBlob);
      };

      mediaRecorder.onerror = (err) => {
        reject(err);
      };

      // Pre-render frame 0
      this.renderFrame(quiz, 0, isVip);

      // Start recording
      mediaRecorder.start(100);

      const startTime = performance.now();
      const totalDurationMs = totalDuration * 1000;

      const recordStep = () => {
        const now = performance.now();
        const elapsedMs = now - startTime;
        const currentTime = Math.min(totalDuration, elapsedMs / 1000);

        this.renderFrame(quiz, currentTime, isVip);
        if ((videoTrack as any)?.requestFrame) {
          try { (videoTrack as any).requestFrame(); } catch {}
        }

        const progressPercent = Math.min(100, Math.round((currentTime / totalDuration) * 100));
        onProgress(progressPercent);

        if (elapsedMs < totalDurationMs) {
          requestAnimationFrame(recordStep);
        } else {
          // Final frame render
          this.renderFrame(quiz, totalDuration, isVip);
          if ((videoTrack as any)?.requestFrame) {
            try { (videoTrack as any).requestFrame(); } catch {}
          }
          setTimeout(() => {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 150);
        }
      };

      requestAnimationFrame(recordStep);
    });
  }
}
