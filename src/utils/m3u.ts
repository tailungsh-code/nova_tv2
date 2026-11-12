import { Channel, ChannelFormInput } from '@/src/types/channel';

export interface ParsedM3UEntry {
  name: string;
  streamUrl: string;
  logoUrl: string;
  category: string;
  country: string;
  language: string;
  valid: boolean;
  error?: string;
}

function extractAttr(line: string, attr: string): string {
  const regex = new RegExp(`${attr}="([^"]*)"`, 'i');
  const match = line.match(regex);
  return match ? match[1].trim() : '';
}

export function isValidStreamUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isDemoPlaceholderUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return (
      parsed.hostname === 'example.invalid' ||
      parsed.hostname.endsWith('.invalid') ||
      parsed.hostname === 'example.com'
    );
  } catch {
    return false;
  }
}

export function parseM3UPlaylist(rawText: string): ParsedM3UEntry[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const entries: ParsedM3UEntry[] = [];
  let pendingMeta: {
    name: string;
    logoUrl: string;
    category: string;
    country: string;
    language: string;
  } | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXTM3U')) continue;

    if (line.startsWith('#EXTINF')) {
      const commaIdx = line.lastIndexOf(',');
      const rawTitle = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : '';
      const tvgName = extractAttr(line, 'tvg-name');
      const logoUrl = extractAttr(line, 'tvg-logo');
      const category = extractAttr(line, 'group-title') || 'International';
      const country = extractAttr(line, 'tvg-country') || 'International';
      const language = extractAttr(line, 'tvg-language') || 'English';

      pendingMeta = {
        name: rawTitle || tvgName || 'Untitled Channel',
        logoUrl,
        category,
        country,
        language,
      };
      continue;
    }

    if (line.startsWith('#')) continue;

    const valid = isValidStreamUrl(line);
    const meta = pendingMeta ?? {
      name: `Channel ${entries.length + 1}`,
      logoUrl: '',
      category: 'International',
      country: 'International',
      language: 'English',
    };

    entries.push({
      name: meta.name,
      streamUrl: line,
      logoUrl: meta.logoUrl,
      category: meta.category,
      country: meta.country,
      language: meta.language,
      valid,
      error: valid ? undefined : 'URL must begin with http:// or https://',
    });

    pendingMeta = null;
  }

  return entries;
}

export function parsedEntriesToInputs(
  entries: ParsedM3UEntry[],
  startingOrder: number
): ChannelFormInput[] {
  return entries
    .filter((entry) => entry.valid)
    .map((entry, idx) => ({
      name: entry.name,
      logoUrl: entry.logoUrl || './logos/meridian-global.svg',
      thumbnailUrl: './images/hero_featured_cinema.jpg',
      streamUrl: entry.streamUrl,
      alternativeStreamUrl: '',
      epgUrl: '',
      category: entry.category,
      country: entry.country,
      language: entry.language,
      description: `Imported via M3U playlist (${entry.category}).`,
      featured: false,
      isActive: true,
      sortOrder: startingOrder + idx,
      isDemo: isDemoPlaceholderUrl(entry.streamUrl),
      isLive: true,
      popularity: 70,
    }));
}

export function exportChannelsToM3U(channels: Channel[]): string {
  const header = '#EXTM3U';
  const blocks = channels.map((ch) => {
    const attrs = [
      `tvg-id="${ch.id}"`,
      `tvg-name="${ch.name.replace(/"/g, "'")}"`,
      `tvg-logo="${ch.logoUrl}"`,
      `tvg-country="${ch.country}"`,
      `tvg-language="${ch.language}"`,
      `group-title="${ch.category}"`,
    ].join(' ');
    return `#EXTINF:-1 ${attrs},${ch.name}\n${ch.streamUrl}`;
  });
  return [header, ...blocks].join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
