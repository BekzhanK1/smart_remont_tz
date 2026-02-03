"use client";

interface PaginationProps {
  count: number;
  limit: number;
  offset: number;
  onPageChange: (newOffset: number) => void;
}

export default function Pagination({
  count,
  limit,
  offset,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(count / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;
  const hasPrev = offset > 0;
  const hasNext = offset + limit < count;

  return (
    <nav
      className="flex items-center justify-center gap-3 py-8"
      aria-label="Пагинация"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, offset - limit))}
        disabled={!hasPrev}
        className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Назад
      </button>
      <span className="px-4 py-2.5 text-sm text-slate-600">
        Страница {currentPage} из {totalPages} ({count} товаров)
      </span>
      <button
        type="button"
        onClick={() => onPageChange(offset + limit)}
        disabled={!hasNext}
        className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Вперёд
      </button>
    </nav>
  );
}
