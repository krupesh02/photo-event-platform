export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-shimmer rounded-2xl ${className}`}
      style={{ background: "hsl(var(--bg-secondary))", ...style }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--surface))" }}>
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="masonry-grid">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-full"
          style={{ height: `${180 + Math.random() * 120}px` }}
        />
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-10 h-10 rounded-full border-3 border-t-transparent gradient-border animate-spin" />
    </div>
  );
}
