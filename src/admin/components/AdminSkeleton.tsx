import React from 'react';

export const AdminCardSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 1,
  className = '',
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs animate-pulse ${className}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-28 bg-neutral-200 rounded-md" />
            <div className="h-8 w-8 bg-neutral-100 rounded-xl" />
          </div>
          <div className="h-8 w-36 bg-neutral-200 rounded-lg mb-2" />
          <div className="h-3 w-48 bg-neutral-100 rounded" />
        </div>
      ))}
    </>
  );
};

export const AdminTableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs animate-pulse">
      {/* Table Header */}
      <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-neutral-200 rounded flex-1" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-neutral-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-6 py-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-neutral-200/80 rounded flex-1"
                style={{ width: `${60 + ((r + c) % 4) * 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminFormSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 animate-pulse max-w-xl shadow-xs">
      <div className="h-6 w-40 bg-neutral-200 rounded" />
      <div className="space-y-2">
        <div className="h-3 w-24 bg-neutral-200/80 rounded" />
        <div className="h-11 w-full bg-neutral-100 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-28 bg-neutral-200/80 rounded" />
        <div className="h-11 w-full bg-neutral-100 rounded-xl" />
      </div>
      <div className="h-11 w-full bg-neutral-200 rounded-xl mt-4" />
    </div>
  );
};

