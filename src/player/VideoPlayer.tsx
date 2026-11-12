import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Hls, { Level } from 'hls.js';
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Radio,
  RotateCcw,
  Settings,
  Share2,
  Tv,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from 'lucide-react';
import { ChannelLogo } from '@/src/components/ChannelLogo';
import { useApp } from '@/src/context/AppContext';
import { Channel } from '@/src/types/channel';
import { AspectRatioMode } from '@/src/types/settings';
import { detectPlayerCapabilities } from '@/src/utils/capabilities';
import { isDemoPlaceholderUrl } from '@/src/utils/m3u';

interface VideoPlayerProps {
  channel: Channel;
  onBack: () => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  onOpenAdminEdit?: (channel: Channel) => void;
  onShare?: (channel: Channel) => void;
}

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onBack,
  onPrevChannel,
  onNextChannel,
  onOpenAdminEdit,
  onShare,
}) => {
  const { preferences, toggleFavorite, t, isRtl } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const testAnimRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' } | null>(null);

  const [useBackupUrl, setUseBackupUrl] = useState(false);
  const [testSignalActive, setTestSignalActive] = useState(false);

  const activeUrl = useMemo(() => {
    if (useBackupUrl && channel.alternativeStreamUrl) {
      return channel.alternativeStreamUrl.trim();
    }
    return channel.streamUrl.trim();
  }, [channel.streamUrl, channel.alternativeStreamUrl, useBackupUrl]);

  const isDemoStream = useMemo(
    () => isDemoPlaceholderUrl(activeUrl) && !testSignalActive,
    [activeUrl, testSignalActive]
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(preferences.defaultVolume);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>(
    preferences.defaultAspectRatio
  );
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  const [levels, setLevels] = useState<Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [duration, setDuration] = useState<number>(Infinity);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [seekNotice, setSeekNotice] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const capabilities = useMemo(
    () => detectPlayerCapabilities(videoRef.current),
    []
  );

  const isSeekableVod = useMemo(
    () => !testSignalActive && isFinite(duration) && duration > 0 && duration < 86400,
    [duration, testSignalActive]
  );

  const isFav = preferences.favorites.includes(channel.id);

  const scheduleHideControls = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    setShowControls(true);
    if (isPlaying && !showSettings && !errorMsg && !isDemoStream) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isPlaying, showSettings, errorMsg, isDemoStream]);

  useEffect(() => {
    scheduleHideControls();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [scheduleHideControls]);

  const stopTestSignal = useCallback(() => {
    if (testAnimRef.current !== null) {
      cancelAnimationFrame(testAnimRef.current);
      testAnimRef.current = null;
    }
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    canvasRef.current = null;
  }, []);

  const cleanupPlayer = useCallback(() => {
    stopTestSignal();
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
  }, [stopTestSignal]);

  // Reset backup/test signal state when switching channel
  useEffect(() => {
    setUseBackupUrl(false);
    setTestSignalActive(false);
    setErrorMsg(null);
    setLevels([]);
    setCurrentLevel(-1);
    setDuration(Infinity);
    setCurrentTime(0);
    retryCountRef.current = 0;
  }, [channel.id]);

  // Mount Canvas Local Diagnostic Test Signal when requested by user
  useEffect(() => {
    if (!testSignalActive) return;
    const video = videoRef.current;
    if (!video) return;

    cleanupPlayer();
    setErrorMsg(null);
    setIsBuffering(false);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');

    let frame = 0;
    const drawFrame = () => {
      if (!ctx) return;
      frame += 1;
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#080B14');
      grad.addColorStop(0.55, '#101827');
      grad.addColorStop(1, '#1A133B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Broadcast SMPTE-inspired subtle reference bars at top
      const barColors = ['#6C5CE7', '#00D4FF', '#10B981', '#F59E0B', '#FF365D', '#FFFFFF'];
      const barW = w / barColors.length;
      barColors.forEach((color, idx) => {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.22;
        ctx.fillRect(idx * barW, 0, barW, 14);
      });
      ctx.globalAlpha = 1;

      // Subtle animated sweep radar ring
      const pulse = (Math.sin(frame * 0.04) + 1) * 0.5;
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2 - 20, 95 + pulse * 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 44px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(channel.name, w / 2, h / 2 - 10);

      ctx.fillStyle = '#00D4FF';
      ctx.font = '600 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('LOCAL DIAGNOSTIC TEST SIGNAL · PLAYER VERIFICATION', w / 2, h / 2 + 34);

      const now = new Date();
      ctx.fillStyle = '#A7B0C0';
      ctx.font = '500 22px monospace';
      ctx.fillText(
        `${channel.category.toUpperCase()}  |  ${now.toLocaleTimeString()}`,
        w / 2,
        h / 2 + 76
      );

      testAnimRef.current = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    const captureFn = (
      canvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream }
    ).captureStream;

    if (typeof captureFn === 'function') {
      const stream = captureFn.call(canvas, 24);
      video.srcObject = stream;
      video.volume = volume;
      video.muted = isMuted;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      setErrorMsg('Canvas captureStream is unavailable on this WebView.');
    }

    return () => {
      stopTestSignal();
    };
  }, [testSignalActive, channel.name, channel.category, cleanupPlayer, stopTestSignal]);

  // Attach real HLS.js or native HTML5 playback for non-demo streams
  useEffect(() => {
    const video = videoRef.current;
    if (!video || testSignalActive) return;

    cleanupPlayer();
    setErrorMsg(null);
    setReconnecting(false);
    setLevels([]);
    setCurrentLevel(-1);

    if (isDemoPlaceholderUrl(activeUrl)) {
      setIsBuffering(false);
      setIsPlaying(false);
      return;
    }

    if (!activeUrl) {
      setErrorMsg('No stream URL configured for this channel.');
      return;
    }

    setIsBuffering(true);
    const isHlsUrl =
      activeUrl.toLowerCase().includes('.m3u8') ||
      activeUrl.toLowerCase().includes('m3u8');

    const tryAutoPlay = () => {
      video.volume = volume;
      video.muted = isMuted;
      if (preferences.autoplay) {
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch(() => {
            // Autoplay blocked with audio; user can press play or mute
            setIsPlaying(false);
            setIsBuffering(false);
          });
      } else {
        setIsBuffering(false);
      }
    };

    if (isHlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.loadSource(activeUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setLevels(data.levels || []);
        setReconnecting(false);
        if (preferences.preferredQuality !== 'auto' && data.levels?.length > 1) {
          if (preferences.preferredQuality === 'high') {
            hls.currentLevel = data.levels.length - 1;
            setCurrentLevel(data.levels.length - 1);
          } else if (preferences.preferredQuality === 'medium') {
            const mid = Math.floor(data.levels.length / 2);
            hls.currentLevel = mid;
            setCurrentLevel(mid);
          } else if (preferences.preferredQuality === 'low') {
            hls.currentLevel = 0;
            setCurrentLevel(0);
          }
        }
        tryAutoPlay();
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        if (hls.autoLevelEnabled) {
          setCurrentLevel(-1);
        } else {
          setCurrentLevel(data.level);
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (retryCountRef.current < 2) {
          retryCountRef.current += 1;
          setReconnecting(true);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
        }

        setReconnecting(false);
        setIsBuffering(false);
        setIsPlaying(false);
        setErrorMsg(
          `Stream playback error (${data.details || data.type}). Check stream availability or CORS headers.`
        );
        hls.destroy();
        hlsRef.current = null;
      });
    } else if (!isHlsUrl || video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = activeUrl;
      video.load();
      tryAutoPlay();
    } else {
      setIsBuffering(false);
      setErrorMsg('HLS playback is not supported on this browser.');
    }

    return () => {
      cleanupPlayer();
    };
  }, [
    activeUrl,
    reloadNonce,
    testSignalActive,
    preferences.autoplay,
    preferences.preferredQuality,
    cleanupPlayer,
  ]);

  // Native HTML5 video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setReconnecting(false);
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    const onError = () => {
      if (isDemoStream || testSignalActive) return;
      setIsBuffering(false);
      setIsPlaying(false);
      setErrorMsg('Unable to decode or reach the stream URL.');
    };
    const onEnterPip = () => setIsPip(true);
    const onLeavePip = () => setIsPip(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('error', onError);
    video.addEventListener('enterpictureinpicture', onEnterPip);
    video.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('error', onError);
      video.removeEventListener('enterpictureinpicture', onEnterPip);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, [isDemoStream, testSignalActive]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element | null })
          .webkitFullscreenElement;
      setIsFullscreen(Boolean(fsEl));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || isDemoStream) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    scheduleHideControls();
  }, [isDemoStream, scheduleHideControls]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    scheduleHideControls();
  }, [isMuted, scheduleHideControls]);

  const handleVolumeChange = useCallback(
    (val: number) => {
      const video = videoRef.current;
      const clamped = Math.max(0, Math.min(1, val));
      setVolume(clamped);
      if (video) {
        video.volume = clamped;
        if (clamped > 0 && isMuted) {
          video.muted = false;
          setIsMuted(false);
        }
      }
      scheduleHideControls();
    },
    [isMuted, scheduleHideControls]
  );

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    if (!el || !capabilities.fullscreenSupported) return;
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      webkitFullscreenElement?: Element | null;
    };
    try {
      if (document.fullscreenElement || doc.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      } else {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      }
    } catch {
      // Ignore fullscreen denial
    }
  }, [capabilities.fullscreenSupported]);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !capabilities.pictureInPictureSupported) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // Ignore PiP failure
    }
  }, [capabilities.pictureInPictureSupported]);

  const handleQualityChange = (levelIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setCurrentLevel(levelIndex);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleRetry = () => {
    retryCountRef.current = 0;
    setErrorMsg(null);
    setReloadNonce((n) => n + 1);
  };

  const triggerVodSeek = useCallback(
    (deltaSec: number) => {
      const video = videoRef.current;
      if (!video || !isSeekableVod) return;
      const target = Math.max(0, Math.min(duration, video.currentTime + deltaSec));
      video.currentTime = target;
      setSeekNotice(deltaSec > 0 ? `+${deltaSec}s` : `${deltaSec}s`);
      window.setTimeout(() => setSeekNotice(null), 800);
    },
    [duration, isSeekableVod]
  );

  // Double-tap touch seek for VOD
  const handleSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const now = Date.now();
    const side: 'left' | 'right' = relX < 0.5 ? 'left' : 'right';

    if (
      isSeekableVod &&
      lastTapRef.current &&
      now - lastTapRef.current.time < 280 &&
      lastTapRef.current.side === side
    ) {
      triggerVodSeek(side === 'right' ? 10 : -10);
      lastTapRef.current = null;
      return;
    }

    lastTapRef.current = { time: now, side };
    scheduleHideControls();
  };

  // Desktop keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }
      if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(volume + 0.1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(volume - 0.1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isSeekableVod) triggerVodSeek(10);
        else onNextChannel?.();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isSeekableVod) triggerVodSeek(-10);
        else onPrevChannel?.();
      } else if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        else if (!isFullscreen) onBack();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    togglePlay,
    toggleMute,
    toggleFullscreen,
    handleVolumeChange,
    volume,
    isSeekableVod,
    triggerVodSeek,
    onNextChannel,
    onPrevChannel,
    showSettings,
    isFullscreen,
    onBack,
  ]);

  const objectFitClass =
    aspectRatio === 'fill'
      ? 'object-cover'
      : aspectRatio === 'original'
        ? 'object-none'
        : 'object-contain';

  return (
    <div
      ref={containerRef}
      onMouseMove={scheduleHideControls}
      className="relative w-full aspect-video max-h-[82vh] bg-black rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl select-none"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        playsInline
        className={`w-full h-full ${objectFitClass} bg-black`}
      />

      {/* Interactive Surface for tap / double-tap seek */}
      <div
        onClick={handleSurfaceClick}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Double-tap Seek Toast */}
      {seekNotice && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full bg-black/75 backdrop-blur-md px-5 py-2.5 text-sm font-mono font-semibold text-white">
            {seekNotice}
          </div>
        </div>
      )}

      {/* Buffering / Reconnecting Spinner */}
      {(isBuffering || reconnecting) && !errorMsg && !isDemoStream && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45">
          <div className="h-11 w-11 rounded-full border-2 border-white/20 border-t-[#00D4FF] animate-spin" />
          {reconnecting && (
            <p className="mt-3 text-xs font-medium text-white/90">
              {t.player.reconnecting}
            </p>
          )}
        </div>
      )}

      {/* Honest Demo Placeholder Notice */}
      {isDemoStream && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-[#080B14]/95 via-[#101827]/95 to-[#080B14]/95 p-5 sm:p-8">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#6C5CE7]/20 border border-[#6C5CE7]/35 flex items-center justify-center text-[#00D4FF]">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              {t.player.demoNoticeTitle}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#A7B0C0] leading-relaxed">
              {t.player.demoNoticeBody}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTestSignalActive(true);
                }}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Radio className="w-4 h-4" />
                <span>{t.player.previewTestSignal}</span>
              </button>
              {onOpenAdminEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAdminEdit(channel);
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t.player.openChannelManager}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connection / Playback Error Screen */}
      {errorMsg && !isDemoStream && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#080B14]/92 p-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-[#FF365D]/20 text-[#FF365D] flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              {t.player.connectionError}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#A7B0C0]">{errorMsg}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetry();
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-sm font-semibold inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.common.retry}</span>
              </button>
              {channel.alternativeStreamUrl && !useBackupUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUseBackupUrl(true);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium"
                >
                  {t.player.tryBackupStream}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Control Overlay */}
      <div
        className={`absolute inset-0 z-30 flex flex-col justify-between pointer-events-none transition-opacity duration-200 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Overlay Bar */}
        <div className="pointer-events-auto flex items-center justify-between gap-3 bg-gradient-to-b from-black/85 via-black/45 to-transparent p-3 sm:p-5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              aria-label={t.player.back}
              className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>

            <ChannelLogo src={channel.logoUrl} name={channel.name} size="sm" />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm sm:text-base font-bold text-white truncate">
                  {channel.name}
                </h2>
                {!isSeekableVod && (
                  <span className="inline-flex items-center gap-1 rounded bg-[#FF365D] px-1.5 py-0.5 text-[10px] font-bold text-white shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-live-dot" />
                    {t.common.live}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/70 truncate">
                {channel.category} · {channel.language}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {testSignalActive && (
              <button
                type="button"
                onClick={() => setTestSignalActive(false)}
                className="min-h-[38px] px-3 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-medium text-white"
              >
                {t.player.stopTestSignal}
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleFavorite(channel.id)}
              aria-label={isFav ? t.common.favorited : t.common.favorite}
              className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isFav ? 'fill-[#FF365D] text-[#FF365D]' : ''}`}
              />
            </button>
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(channel)}
                aria-label={t.common.share}
                className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="pointer-events-auto bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-3 pt-8 sm:px-5 sm:pb-4">
          {/* VOD Seek Scrubber ONLY when finite duration */}
          {isSeekableVod && (
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[11px] font-mono text-white/85 tabular-nums">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration}
                step={1}
                value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (videoRef.current) videoRef.current.currentTime = val;
                  setCurrentTime(val);
                }}
                className="flex-1 accent-[#00D4FF] cursor-pointer"
                aria-label="Seek position"
              />
              <span className="text-[11px] font-mono text-white/70 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {/* Left Controls: Play/Pause, Prev/Next, Volume */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={togglePlay}
                disabled={isDemoStream}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-40 text-white transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 fill-current" />
                )}
              </button>

              {onPrevChannel && (
                <button
                  type="button"
                  onClick={onPrevChannel}
                  aria-label={t.player.previousChannel}
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl hover:bg-white/15 text-white transition-colors"
                >
                  <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              )}

              {onNextChannel && (
                <button
                  type="button"
                  onClick={onNextChannel}
                  aria-label={t.player.nextChannel}
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl hover:bg-white/15 text-white transition-colors"
                >
                  <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              )}

              <div className="flex items-center gap-1.5 ms-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl hover:bg-white/15 text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  aria-label="Volume"
                  className="hidden sm:block w-20 accent-[#00D4FF] cursor-pointer"
                />
              </div>
            </div>

            {/* Right Controls: Settings, PiP (if supported), Fullscreen (if supported) */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowSettings((s) => !s)}
                aria-label={t.player.settings}
                className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl transition-colors ${
                  showSettings
                    ? 'bg-[#6C5CE7] text-white'
                    : 'hover:bg-white/15 text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              {capabilities.pictureInPictureSupported && !isDemoStream && (
                <button
                  type="button"
                  onClick={togglePip}
                  aria-label={t.player.pip}
                  className={`min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl transition-colors ${
                    isPip ? 'bg-[#00D4FF] text-[#080B14]' : 'hover:bg-white/15 text-white'
                  }`}
                >
                  <PictureInPicture2 className="w-4 h-4" />
                </button>
              )}

              {capabilities.fullscreenSupported && (
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={
                    isFullscreen ? t.player.exitFullscreen : t.player.fullscreen
                  }
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl hover:bg-white/15 text-white transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Player Settings Drawer Panel */}
      {showSettings && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-16 end-3 sm:end-5 z-40 w-72 max-h-[75%] overflow-y-auto rounded-2xl bg-[#101827]/95 backdrop-blur-xl border border-white/15 p-4 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="font-display text-sm font-bold">{t.player.settings}</span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-lg hover:bg-white/10"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-4 text-xs">
            {/* Aspect Ratio */}
            <div>
              <p className="text-[#A7B0C0] mb-1.5 font-medium">{t.player.aspectRatio}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {(['fit', 'fill', 'original'] as AspectRatioMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAspectRatio(mode)}
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      aspectRatio === mode
                        ? 'bg-[#6C5CE7] text-white'
                        : 'bg-white/5 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    {t.player[mode]}
                  </button>
                ))}
              </div>
            </div>

            {/* Stream Quality (only when HLS has multiple levels) */}
            {levels.length > 1 && (
              <div>
                <p className="text-[#A7B0C0] mb-1.5 font-medium">{t.player.quality}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQualityChange(-1)}
                    className={`py-1.5 px-2 rounded-lg font-medium text-start ${
                      currentLevel === -1
                        ? 'bg-[#00D4FF] text-[#080B14]'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    Auto
                  </button>
                  {levels.map((lvl, idx) => (
                    <button
                      key={`${lvl.height}-${idx}`}
                      type="button"
                      onClick={() => handleQualityChange(idx)}
                      className={`py-1.5 px-2 rounded-lg font-mono text-start ${
                        currentLevel === idx
                          ? 'bg-[#00D4FF] text-[#080B14]'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {lvl.height ? `${lvl.height}p` : `L${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Playback Speed ONLY when VOD */}
            {isSeekableVod && (
              <div>
                <p className="text-[#A7B0C0] mb-1.5 font-medium">{t.player.speed}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0.75, 1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleSpeedChange(rate)}
                      className={`py-1.5 rounded-lg font-mono ${
                        playbackRate === rate
                          ? 'bg-[#6C5CE7] text-white'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Capability Summary */}
            <div className="pt-2 border-t border-white/10 text-[11px] text-[#A7B0C0] space-y-1">
              <p className="font-medium text-white/85">{t.player.capabilitiesTitle}</p>
              <p>
                HLS Engine:{' '}
                {capabilities.hlsJsSupported
                  ? 'HLS.js (MSE)'
                  : capabilities.nativeHlsSupported
                    ? 'Native HLS'
                    : 'HTML5 Basic'}
              </p>
              <p>
                PiP: {capabilities.pictureInPictureSupported ? 'Supported' : 'Unavailable'} · Fullscreen:{' '}
                {capabilities.fullscreenSupported ? 'Supported' : 'Unavailable'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
