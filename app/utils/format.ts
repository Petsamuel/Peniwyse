/**
 * Cleans up free-text a partner typed before it is validated, saved or shown.
 *
 * Trims the ends and collapses runs of whitespace, so " Acme  Holdings " and
 * "Acme Holdings" are stored the same way. A leading space is easy to type and
 * impossible to see, but it survives to every screen that renders the value.
 */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}
