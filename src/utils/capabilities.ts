import Hls from 'hls.js';

export interface PlayerCapabilities {
  hlsJsSupported: boolean;
  nativeHlsSupported: boolean;
  fullscreenSupported: boolean;
  pictureInPictureSupported: boolean;
  hardwareBrightnessSupported: boolean;
  mediaSessionSupported: boolean;
}

export function detectPlayerCapabilities(videoEl?: HTMLVideoElement | null): PlayerCapabilities {
  const doc = typeof document !== 'undefined' ? document : null;
  const testVideo = videoEl ?? (doc ? doc.createElement('video') : null);

  const hlsJsSupported = typeof window !== 'undefined' && Hls.isSupported();
  const nativeHlsSupported = Boolean(
    testVideo &&
      (testVideo.canPlayType('application/vnd.apple.mpegurl') !== '' ||
        testVideo.canPlayType('application/x-mpegURL') !== '')
  );

  const docEl = doc?.documentElement as
    | (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
    | undefined;
  const fullscreenSupported = Boolean(
    doc &&
      (doc.fullscreenEnabled ||
        (doc as Document & { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
        docEl?.requestFullscreen ||
        docEl?.webkitRequestFullscreen)
  );

  const pictureInPictureSupported = Boolean(
    doc &&
      'pictureInPictureEnabled' in doc &&
      doc.pictureInPictureEnabled &&
      testVideo &&
      'requestPictureInPicture' in testVideo
  );

  // Standard web browsers & Android WebView do not expose hardware screen brightness APIs
  const hardwareBrightnessSupported = false;

  const mediaSessionSupported =
    typeof navigator !== 'undefined' && 'mediaSession' in navigator;

  return {
    hlsJsSupported,
    nativeHlsSupported,
    fullscreenSupported,
    pictureInPictureSupported,
    hardwareBrightnessSupported,
    mediaSessionSupported,
  };
}
