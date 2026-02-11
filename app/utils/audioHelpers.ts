/**
 * Audio utility functions for time formatting and file size
 */

/**
 * Formats seconds as MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats milliseconds as MM:SS or HH:MM:SS
 */
export function formatDurationMs(milliseconds: number): string {
  return formatDuration(milliseconds / 1000);
}

/**
 * Formats file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);

  return `${value.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Calculates progress percentage from current and total values
 */
export function calculateProgress(current: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
}

/**
 * Parses duration string (MM:SS or HH:MM:SS) to seconds
 */
export function parseDuration(durationString: string): number {
  try {
    const parts = durationString.split(':').map(Number);

    if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return 0;
  } catch (error) {
    return 0;
  }
}
