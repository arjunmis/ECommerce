import { useState } from "react";
import { imageUrl } from "../utils.js";

// Lazy image with a shimmer while loading and a lettered placeholder if missing or broken.
export default function ProductImage({ src, alt, width = 600, height = width, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = imageUrl(src, width, height);

  if (!url || failed) {
    return (
      <div className={`img-wrap placeholder ${className}`}>
        <span>{(alt || "?").charAt(0)}</span>
      </div>
    );
  }

  return (
    <div className={`img-wrap ${loaded ? "loaded" : "loading"} ${className}`}>
      <img
        src={url}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
