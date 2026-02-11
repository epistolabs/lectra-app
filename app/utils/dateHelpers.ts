/**
 * Date and time formatting utilities
 */

/**
 * Formats a date as relative time (e.g., "2 hours ago", "Just now")
 * For dates older than 7 days, returns absolute date
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Just now (< 1 minute)
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Minutes ago
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Hours ago
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Days ago (up to 7 days)
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    // Absolute date for older items
    return formatAbsoluteDate(dateString);
  } catch (error) {
    return 'Unknown date';
  }
}

/**
 * Formats a date as absolute date (e.g., "Jan 15, 2025")
 */
export function formatAbsoluteDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Formats a date with time (e.g., "Jan 15, 2025 at 3:30 PM")
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Formats a date for display in list items
 * Uses relative time for recent items, absolute for older
 */
export function formatListItemDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    // Use relative time for items less than 24 hours old
    if (diffInHours < 24) {
      return formatRelativeTime(dateString);
    }

    // Use absolute date for older items
    return formatAbsoluteDate(dateString);
  } catch (error) {
    return 'Unknown date';
  }
}
