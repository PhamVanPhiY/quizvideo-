// Pure In-Browser Web Audio & Speech Engine (100% No API / Zero Cost)
import type { QuizItem } from '../types/quiz';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private audioBufferCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initVoices();
  }

  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.streamDest = this.ctx.createMediaStreamDestination();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);

      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      if (this.streamDest) {
        this.masterGain.connect(this.streamDest);
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getAudioContext(): AudioContext {
    return this.initContext();
  }

  public getAudioStream(): MediaStream {
    this.initContext();
    return this.streamDest!.stream;
  }

  public setVolume(volume: number) {
    this.initContext();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(muted ? 0 : 0.9);
  }

  // ==========================================
  // VOICE AUDIO BUFFER FETCHER & DECODER
  // (Zero API Key - Direct AudioBuffer for MediaRecorder & Playback)
  // ==========================================

  public async getVoiceAudioBuffer(text: string, lang: string = 'en'): Promise<AudioBuffer | null> {
    const cleanText = text.trim();
    if (!cleanText) return null;

    const cacheKey = `${lang}:${cleanText}`;
    if (this.audioBufferCache.has(cacheKey)) {
      return this.audioBufferCache.get(cacheKey)!;
    }

    try {
      const ctx = this.initContext();
      const res = await fetch(`/api/tts?text=${encodeURIComponent(cleanText)}&lang=${lang}`);
      if (!res.ok) throw new Error('TTS proxy response not OK');

      const arrayBuffer = await res.arrayBuffer();
      // Decode audio data into Web Audio buffer
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      this.audioBufferCache.set(cacheKey, audioBuffer);
      return audioBuffer;
    } catch {
      // Fallback: Return null if offline or fetch failed (will use Web Speech for preview)
      return null;
    }
  }

  public playAudioBuffer(buffer: AudioBuffer, startTime: number = 0): AudioBufferSourceNode | null {
    if (this.isMuted) return null;
    const ctx = this.initContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain!);

    const targetTime = startTime > 0 ? startTime : ctx.currentTime;
    source.start(targetTime);
    return source;
  }

  // ==========================================
  // REAL-TIME INSTANT SOUND EFFECTS
  // ==========================================

  // 1. Clock Tick (Tích tắc đồng hồ)
  public playTick(pitch: number = 800) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    this.scheduleTick(ctx.currentTime, pitch);
  }

  // 2. Countdown Beep (3, 2, 1... Beep!)
  public playBeep(isFinal: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    this.scheduleBeep(ctx.currentTime, isFinal);
  }

  // 3. Ding! Correct Answer Chime (Tiếng chuông kết quả)
  public playCorrectChime() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    this.scheduleChime(ctx.currentTime);
  }

  // 4. Whoosh
  public playWhoosh() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    this.scheduleWhoosh(ctx.currentTime);
  }

  // ==========================================
  // TIMELINE-SCHEDULED AUDIO NODES
  // ==========================================

  public scheduleTick(time: number, pitch: number = 800) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.35, time + 0.04);

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  public scheduleBeep(time: number, isFinal: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = isFinal ? 1200 : 750;
    const duration = isFinal ? 0.3 : 0.14;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  public scheduleChime(time: number) {
    if (!this.ctx || !this.sfxGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];

    notes.forEach((freq, index) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = time + index * 0.05;
      const duration = 1.4;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3 / (index * 0.6 + 1), startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  public scheduleWhoosh(time: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.exponentialRampToValueAtTime(3000, time + 0.15);
    filter.Q.setValueAtTime(3, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(time);
    noise.stop(time + 0.25);
  }

  // 5. Ambient Suspense Beat
  public scheduleAmbientTrack(startTime: number, duration: number) {
    if (!this.ctx || !this.sfxGain) return;

    const pulseCount = Math.floor(duration);
    for (let i = 0; i < pulseCount; i++) {
      const pulseTime = startTime + i;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, pulseTime);
      osc.frequency.exponentialRampToValueAtTime(45, pulseTime + 0.15);

      gain.gain.setValueAtTime(0.2, pulseTime);
      gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(pulseTime);
      osc.stop(pulseTime + 0.2);
    }
  }

  /**
   * Preload all voice AudioBuffers before starting recording
   */
  public async preloadQuizAudio(quiz: QuizItem): Promise<{ wordBuffer: AudioBuffer | null; exampleBuffer: AudioBuffer | null }> {
    const wordBufferPromise = this.getVoiceAudioBuffer(quiz.word, 'en');
    const exampleText = quiz.example || quiz.explanation || '';
    const exampleBufferPromise = this.getVoiceAudioBuffer(exampleText, 'en');

    const [wordBuffer, exampleBuffer] = await Promise.all([
      wordBufferPromise,
      exampleBufferPromise,
    ]);

    return { wordBuffer, exampleBuffer };
  }

  /**
   * Synchronously schedule all quiz audio with preloaded buffers
   */
  public scheduleQuizAudioDirect(
    quiz: QuizItem,
    startTime: number,
    wordBuffer: AudioBuffer | null,
    exampleBuffer: AudioBuffer | null
  ) {
    const countdownSeconds = quiz.countdownSeconds || 5;

    // 1. Play Word Voice at start (t = 0.2s)
    if (wordBuffer) {
      this.playAudioBuffer(wordBuffer, startTime + 0.2);
    }

    // 2. Ambient Heartbeat Tension
    this.scheduleAmbientTrack(startTime, countdownSeconds);

    // 3. Rhythmic Ticking at each second
    for (let s = 0; s < countdownSeconds; s++) {
      const tickTime = startTime + s;
      const remaining = countdownSeconds - s;
      if (remaining <= 3 && remaining > 0) {
        this.scheduleBeep(tickTime, false);
      } else {
        this.scheduleTick(tickTime, s % 2 === 0 ? 820 : 720);
      }
    }

    // 4. Victory Ding Chime at reveal (t = countdownSeconds)
    const revealTime = startTime + countdownSeconds;
    this.scheduleBeep(revealTime, true);
    this.scheduleChime(revealTime);
    this.scheduleWhoosh(revealTime);

    // 5. Play Example Sentence Voice after reveal (t = countdownSeconds + 0.6s)
    if (exampleBuffer) {
      this.playAudioBuffer(exampleBuffer, revealTime + 0.6);
    }
  }

  /**
   * Schedule the entire Quiz Audio Track INCLUDING:
   * 1. Word pronunciation voice (e.g. "GOODS") at t = 0.2s
   * 2. Tick-tock & Countdown beeps
   * 3. Ding chime at t = 5.0s
   * 4. Example sentence voice (e.g. "The company produces high-tech goods.") at t = 5.6s
   */
  public async scheduleFullQuizAudioWithVoice(
    quiz: QuizItem,
    startTime: number
  ) {
    const { wordBuffer, exampleBuffer } = await this.preloadQuizAudio(quiz);
    this.scheduleQuizAudioDirect(quiz, startTime, wordBuffer, exampleBuffer);
  }

  // ==========================================
  // WEB SPEECH TTS (Fallback / Live Preview)
  // ==========================================

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        this.voices = window.speechSynthesis.getVoices();
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public speak(
    text: string,
    options: {
      lang?: string;
      rate?: number;
      pitch?: number;
      voiceURI?: string;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    } = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (options.onEnd) options.onEnd();
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.lang = options.lang ?? 'en-US';

      if (options.voiceURI) {
        const found = this.voices.find(v => v.voiceURI === options.voiceURI);
        if (found) utterance.voice = found;
      } else {
        const match = this.voices.find(v => v.lang.startsWith(utterance.lang) || v.lang === utterance.lang);
        if (match) utterance.voice = match;
      }

      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        if (options.onError) options.onError(e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
