export class AudioService {
    private audio: HTMLAudioElement | null = null;
    private static instance: AudioService;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.audio = new Audio();
            this.audio.crossOrigin = 'anonymous';
        }
    }

    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    // Core Playback
    public play(src?: string): Promise<void> {
        if (!this.audio) return Promise.resolve();

        if (src && this.audio.src !== src) {
            this.audio.src = src;
        }
        return this.audio.play();
    }

    public pause(): void {
        this.audio?.pause();
    }

    public seek(seconds: number): void {
        if (this.audio) {
            this.audio.currentTime = seconds;
        }
    }

    // Getters
    public get duration(): number {
        return this.audio?.duration || 0;
    }

    public get currentTime(): number {
        return this.audio?.currentTime || 0;
    }

    public get isPaused(): boolean {
        return this.audio?.paused ?? true;
    }

    // Event Listeners Wrapper
    public on(event: string, callback: EventListenerOrEventListenerObject) {
        this.audio?.addEventListener(event, callback);
    }

    public off(event: string, callback: EventListenerOrEventListenerObject) {
        this.audio?.removeEventListener(event, callback);
    }

    public setVolume(volume: number) {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }
}

export const audioService = AudioService.getInstance();
