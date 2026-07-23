/**
 * Truncates a string to a specified length and adds an ellipsis.
 * @param str The string to truncate.
 * @param length The maximum length of the string before truncation.
 * @returns The truncated string with an ellipsis if it exceeds the length.
 */
export function truncate(str: string | null | undefined, length: number = 20): string {
    if (!str) return '—';
    if (str.length <= length) return str;
    return str.slice(0, length).trim() + '...';
}
