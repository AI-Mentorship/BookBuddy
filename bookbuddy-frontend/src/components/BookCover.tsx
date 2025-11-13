import React from "react";

type Props = {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  onClick?: React.MouseEventHandler<HTMLImageElement>;
};

// Normalize and upgrade common book cover URLs (e.g., Google Books) for reliability and clarity
function normalizeCoverUrl(raw?: string, forDpr: 1 | 2 = 1): string {
  if (!raw || typeof raw !== "string") return placeholder(forDpr);

  try {
    // Force https to avoid mixed content issues
    const fixed = raw.replace(/^http:\/\//i, "https://");
    const url = new URL(fixed);

    // Improve Google Books thumbnails by increasing zoom for clarity
    // Typical host patterns: books.google.com, books.googleusercontent.com
    const host = url.hostname;
    if (host.includes("books.google")) {
      const currentZoom = parseInt(url.searchParams.get("zoom") || "0", 10);
      // Use higher zoom for retina (2x)
      const targetZoom = Math.max(currentZoom || 2, forDpr === 2 ? 3 : 2);
      url.searchParams.set("zoom", String(Math.min(targetZoom, 5)));
      // Ensure we request front cover if param exists in some links
      if (!url.searchParams.has("printsec")) {
        url.searchParams.set("printsec", "frontcover");
      }
      // Some links use &img=1 to request an image instead of viewer
      url.searchParams.set("img", "1");
      return url.toString();
    }

    // For other hosts, just return the https-fixed URL
    return url.toString();
  } catch {
    // If URL constructor fails, fallback to simple https replace
    const safe = raw.replace(/^http:\/\//i, "https://");
    return safe || placeholder(forDpr);
  }
}

function placeholder(forDpr: 1 | 2 = 1) {
  // Use a higher resolution placeholder for retina
  const w = forDpr === 2 ? 400 : 200;
  const h = forDpr === 2 ? 600 : 300;
  return `https://via.placeholder.com/${w}x${h}?text=No+Cover`;
}

export default function BookCover({ src, alt, className, style, width, height, onClick }: Props) {
  const [error, setError] = React.useState(false);

  // Build sources for normal and high-DPI displays
  const src1x = normalizeCoverUrl(src, 1);
  const src2x = normalizeCoverUrl(src, 2);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!error) {
      setError(true);
      e.currentTarget.src = placeholder(1);
      e.currentTarget.srcset = `${placeholder(1)} 1x, ${placeholder(2)} 2x`;
    }
  };

  return (
    <img
      src={error ? placeholder(1) : src1x}
      srcSet={`${error ? placeholder(1) : src1x} 1x, ${error ? placeholder(2) : src2x} 2x`}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onClick={onClick}
      onError={handleError}
    />
  );
}
