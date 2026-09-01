// Pure In-Browser Web Audio & Speech Engine (100% No API / Zero Cost)
import type { QuizItem } from '../types/quiz';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private streamDest: MediaStreamAudioDestinationNode | null = null;
  private masterGain: GainNode | null = null;
  private speakerGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private isSpeakerMutedForExport: boolean = false;
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
      this.speakerGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(0.95, this.ctx.currentTime);
      this.speakerGain.gain.setValueAtTime(this.isMuted ? 0 : 0.95, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);

      this.sfxGain.connect(this.masterGain);
      
      // 1. masterGain feeds directly into recording stream (always 100% audio captured for exported video)
      if (this.streamDest) {
        this.masterGain.connect(this.streamDest);
      }

      // 2. masterGain feeds into speakerGain -> ctx.destination for live speaker audio
      this.masterGain.connect(this.speakerGain);
      this.speakerGain.connect(this.ctx.destination);
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

  public setSpeakerMutedForExport(muted: boolean) {
    this.isSpeakerMutedForExport = muted;
    this.initContext();
    if (this.speakerGain && this.ctx) {
      if (muted) {
        this.speakerGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } else {
        this.speakerGain.gain.setValueAtTime(this.isMuted ? 0 : 0.95, this.ctx.currentTime);
      }
    }
  }

  public setVolume(volume: number) {
    this.initContext();
    if (this.speakerGain && this.ctx) {
      this.speakerGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.initContext();
    if (this.speakerGain && this.ctx) {
      this.speakerGain.gain.setValueAtTime(muted || this.isSpeakerMutedForExport ? 0 : 0.95, this.ctx.currentTime);
    }
  }

  // ==========================================
  // VOICE AUDIO BUFFER FETCHER & DECODER
  // (Zero API Key - Direct AudioBuffer for MediaRecorder & Playback)
  // ==========================================

  public async getVoiceAudioBuffer(text: string, lang: string = 'en'): Promise<AudioBuffer | null> {
    let cleanText = text.trim();
    if (!cleanText) return null;

    // For Vietnamese text, remove double quotes, curly quotes, parentheses so Google TTS reads naturally
    if (lang === 'vi' || lang.startsWith('vi')) {
      cleanText = cleanText.replace(/["“”'‘’«»[\]()]/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (lang === 'en' && cleanText === cleanText.toUpperCase() && /[A-Z]/.test(cleanText)) {
      // Convert ALL CAPS English words (e.g. "GOODS") to lowercase so TTS pronounces it as a word rather than spelling out letters!
      cleanText = cleanText.toLowerCase();
    }

    const cacheKey = `${lang}:${cleanText}`;
    if (this.audioBufferCache.has(cacheKey)) {
      return this.audioBufferCache.get(cacheKey)!;
    }

    const ctx = this.initContext();

    // Strategy 1: Serverless proxy /api/tts
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(cleanText)}&lang=${lang}`);
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        this.audioBufferCache.set(cacheKey, audioBuffer);
        return audioBuffer;
      }
    } catch (e) {
      console.warn('TTS proxy failed, attempting secondary dictionary fallback...', e);
    }

    // Strategy 2: Free Dictionary Audio API (For single word pronunciation)
    if (cleanText.split(/\s+/).length === 1) {
      try {
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanText)}`);
        if (dictRes.ok) {
          const dictData = await dictRes.json();
          const phonetics = dictData?.[0]?.phonetics || [];
          const audioUrl = phonetics.find((p: { audio?: string }) => p.audio && p.audio.endsWith('.mp3'))?.audio;
          if (audioUrl) {
            const audioRes = await fetch(audioUrl);
            if (audioRes.ok) {
              const arrayBuffer = await audioRes.arrayBuffer();
              const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
              this.audioBufferCache.set(cacheKey, audioBuffer);
              return audioBuffer;
            }
          }
        }
      } catch (err) {
        console.warn('Dictionary audio fallback failed:', err);
      }
    }

    return null;
  }

  public playAudioBuffer(
    buffer: AudioBuffer,
    startTime: number = 0,
    playbackRate: number = 1.0,
    pitchDetune: number = 0
  ): AudioBufferSourceNode | null {
    const ctx = this.initContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const targetTime = startTime > 0 ? startTime : ctx.currentTime;

    if (playbackRate && playbackRate !== 1.0) {
      source.playbackRate.setValueAtTime(Math.max(0.5, Math.min(2.0, playbackRate)), targetTime);
    }

    if (pitchDetune && pitchDetune !== 0) {
      source.detune.setValueAtTime(Math.max(-1200, Math.min(1200, pitchDetune)), targetTime);
    }

    source.connect(this.masterGain!);
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

  // 5. Interactive Pop / Attention Sound (Âm thanh chuyển cảnh câu hỏi tương tác)
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    this.schedulePop(ctx.currentTime);
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

  // 5. Interactive Pop / Notification Chime (2-tone pleasant pop)
  public schedulePop(time: number) {
    if (!this.ctx || !this.sfxGain) return;

    // Double rising tone: G5 (784Hz) -> C6 (1046Hz)
    const tones = [
      { freq: 784, offset: 0, dur: 0.12 },
      { freq: 1046.5, offset: 0.08, dur: 0.35 }
    ];

    tones.forEach(({ freq, offset, dur }) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = time + offset;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + dur);
    });
  }

  // 6. Ambient Suspense Beat
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
  public async preloadQuizAudio(quiz: QuizItem): Promise<{
    wordBuffer: AudioBuffer | null;
    exampleBuffer: AudioBuffer | null;
    interactiveBuffer: AudioBuffer | null;
  }> {
    const wordBufferPromise = this.getVoiceAudioBuffer(quiz.word, 'en');
    const exampleText = quiz.example || quiz.explanation || '';
    const exampleBufferPromise = this.getVoiceAudioBuffer(exampleText, 'en');

    const voiceText = (quiz.interactiveVoiceText || quiz.interactiveQuestion || '').trim();
    const hasInteractive = quiz.enableInteractive !== false && !!voiceText;
    const interactivePromise = hasInteractive
      ? this.getVoiceAudioBuffer(voiceText, 'vi')
      : Promise.resolve(null);

    const [wordBuffer, exampleBuffer, interactiveBuffer] = await Promise.all([
      wordBufferPromise,
      exampleBufferPromise,
      interactivePromise,
    ]);

    return { wordBuffer, exampleBuffer, interactiveBuffer };
  }

  /**
   * Synchronously schedule all quiz audio with preloaded buffers
   */
  public scheduleQuizAudioDirect(
    quiz: QuizItem,
    startTime: number,
    wordBuffer: AudioBuffer | null,
    exampleBuffer: AudioBuffer | null,
    interactiveBuffer: AudioBuffer | null = null
  ) {
    const countdownSeconds = quiz.countdownSeconds || 5;
    const revealDurationSeconds = quiz.revealDurationSeconds || 4;

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

    // 6. Interactive Engagement Question transition SFX & Vietnamese Voice
    const voiceText = (quiz.interactiveVoiceText || quiz.interactiveQuestion || '').trim();
    const hasInteractive = quiz.enableInteractive !== false && !!voiceText;
    if (hasInteractive) {
      const interactiveStartTime = revealTime + revealDurationSeconds;
      this.schedulePop(interactiveStartTime);
      this.scheduleWhoosh(interactiveStartTime);

      if (interactiveBuffer) {
        const speed = quiz.interactiveVoiceSpeed || 1.05;
        const detune = quiz.interactiveVoicePitch ? (quiz.interactiveVoicePitch - 1.0) * 800 : 0;
        this.playAudioBuffer(interactiveBuffer, interactiveStartTime + 0.25, speed, detune);
      }
    }
  }

  /**
   * Schedule the entire Quiz Audio Track INCLUDING:
   * 1. Word pronunciation voice (e.g. "GOODS") at t = 0.2s
   * 2. Tick-tock & Countdown beeps
   * 3. Ding chime at t = 5.0s
   * 4. Example sentence voice at t = 5.6s
   * 5. Interactive question transition chime at t = 9.0s
   */
  public async scheduleFullQuizAudioWithVoice(
    quiz: QuizItem,
    startTime: number
  ) {
    const { wordBuffer, exampleBuffer, interactiveBuffer } = await this.preloadQuizAudio(quiz);
    this.scheduleQuizAudioDirect(quiz, startTime, wordBuffer, exampleBuffer, interactiveBuffer);
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
      const targetLang = options.lang ?? 'en-US';
      utterance.lang = targetLang;

      // Select matching voice
      if (options.voiceURI && targetLang.startsWith('en')) {
        const found = this.voices.find(v => v.voiceURI === options.voiceURI);
        if (found) utterance.voice = found;
      } else {
        const match = this.voices.find(v => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang.slice(0, 2)));
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
