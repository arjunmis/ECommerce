// Sized Unsplash URL; falls back to an empty string so callers can show a placeholder.
export function imageUrl(url, width = 600, height = width) {
  if (!url) return "";
  if (!url.includes("images.unsplash.com")) return url;
  const base = url.split("?")[0];
  return `${base}?w=${width}&h=${height}&fit=crop&auto=format&q=75`;
}

export const formatPrice = (value) =>
  "₹" + Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const HERO_IMAGE = "https://images.unsplash.com/photo-1483985988355-763728e1935b";
export const AUTH_IMAGE = "https://images.unsplash.com/photo-1441986300917-64674bd600d8";
