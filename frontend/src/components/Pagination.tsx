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
      className="flex items-center justify-center gap-2 py-6"
      aria-label="Пагинация"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(0, offset - limit))}
        disabled={!hasPrev}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Назад
      </button>
      <span className="px-3 py-2 text-sm text-slate-600">
        Страница {currentPage} из {totalPages} ({count} товаров)
      </span>
      <button
        type="button"
        onClick={() => onPageChange(offset + limit)}
        disabled={!hasNext}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Вперёд
      </button>
    </nav>
  );
}
