/** First name for a greeting, preferring the OAuth display name over the
 * e-mail local-part, capitalized. */
export function firstNameFrom(displayName: string | null | undefined, email: string): string {
  const source = displayName?.trim() || email.split("@")[0];
  const first = source.split(/[\s._-]+/)[0] || source;
  return first.charAt(0).toUpperCase() + first.slice(1);
}
