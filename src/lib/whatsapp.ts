import { WHATSAPP_NUMBER } from "./constants";

/**
 * Returns a normalized WhatsApp number string.
 * If backendNumber is provided, it is stripped of non‑digits, prefixed with "52" if it has 10 digits, and returned.
 * If the resulting number does not have 12 digits, the fallback constant WHATSAPP_NUMBER is used.
 * In development (Vite) a console.warn is emitted when the backend number differs from the constant.
 */
export function finalWhatsapp(backendNumber?: string): string {
  // Strip any non‑digit characters
  const digits = (backendNumber || "").replace(/\D/g, "");
  let normalized = digits;
  // If we have exactly 10 digits, assume it's a local Mexican number and prepend country code 52
  if (digits.length === 10) {
    normalized = `52${digits}`;
  }
  // If after processing we don't have the expected 12‑digit number, fall back to constant
  if (normalized.length !== 12) {
    // Development warning if a number was provided but is malformed
    if (import.meta.env.DEV && backendNumber) {
      console.warn(
        "finalWhatsapp: provided number did not normalize to 12 digits, using fallback WHATSAPP_NUMBER",
        { backendNumber, normalized }
      );
    }
    return WHATSAPP_NUMBER;
  }
  // Development warning if the number differs from the constant (useful for detecting mismatches)
  if (import.meta.env.DEV && normalized !== WHATSAPP_NUMBER) {
    console.warn(
      "finalWhatsapp: using backend number different from constant",
      { backendNumber: normalized, fallback: WHATSAPP_NUMBER }
    );
  }
  return normalized;
}
