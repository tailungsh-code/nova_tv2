import { isDemoPlaceholderUrl, isValidStreamUrl } from './m3u';

export interface StreamTestResult {
  status: 'reachable' | 'demo-placeholder' | 'cors-restricted' | 'invalid' | 'unreachable';
  message: string;
  httpStatus?: number;
  isHlsManifest?: boolean;
  latencyMs?: number;
}

export async function testStreamUrl(url: string): Promise<StreamTestResult> {
  const trimmed = url.trim();
  if (!isValidStreamUrl(trimmed)) {
    return {
      status: 'invalid',
      message: 'Invalid URL. Stream URL must start with https:// or http://.',
    };
  }

  if (isDemoPlaceholderUrl(trimmed)) {
    return {
      status: 'demo-placeholder',
      message:
        'Demo placeholder URL (.invalid). Replace with an authorized HLS (.m3u8) or MP4 stream URL to broadcast live.',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  const started = performance.now();

  try {
    const response = await fetch(trimmed, {
      method: 'GET',
      mode: 'cors',
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - started);
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        status: 'unreachable',
        httpStatus: response.status,
        latencyMs,
        message: `Server responded with HTTP ${response.status}. Verify the stream path and authorization.`,
      };
    }

    const contentType = response.headers.get('content-type') || '';
    let isHlsManifest =
      trimmed.toLowerCase().includes('.m3u8') ||
      contentType.toLowerCase().includes('mpegurl');

    if (isHlsManifest) {
      const sample = await response.text();
      if (sample.includes('#EXTM3U')) {
        return {
          status: 'reachable',
          httpStatus: response.status,
          isHlsManifest: true,
          latencyMs,
          message: `Valid HLS manifest (#EXTM3U) verified in ${latencyMs} ms.`,
        };
      }
    }

    return {
      status: 'reachable',
      httpStatus: response.status,
      isHlsManifest,
      latencyMs,
      message: `Stream endpoint responded HTTP ${response.status} in ${latencyMs} ms.`,
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        status: 'unreachable',
        message: 'Connection timed out after 7 seconds.',
      };
    }

    // Browsers often throw TypeError on CORS-restricted streams even if playable via native/no-cors
    return {
      status: 'cors-restricted',
      message:
        'Could not inspect headers directly due to CORS or network policy. Test playback directly in the player or enable CORS on the stream CDN.',
    };
  }
}
