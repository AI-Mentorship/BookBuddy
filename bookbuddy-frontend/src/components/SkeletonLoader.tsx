import "../css/SkeletonLoader.css";

/**
 * Skeleton loader for book cards - Pinterest style
 */
export default function SkeletonLoader() {
  return (
    <div className="skeleton-card-pinterest">
      <div className="skeleton-cover-pinterest"></div>
    </div>
  );
}

/**
 * Skeleton loader for multiple book cards
 */
export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader key={index} />
      ))}
    </>
  );
}

