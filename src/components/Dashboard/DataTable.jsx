"use client";

import { useMemo, useState } from "react";
import { Search, ChevronUp, ChevronDown, ArrowUpDown, Inbox } from "lucide-react";
import Pagination from "@/components/Public/Pagination";
import { TableSkeleton } from "@/components/Public/CardSkeleton";
import { classNames } from "@/lib/utils";

/**
 * Reusable data table: client-side search, sort and pagination over whatever the
 * hooks have already fetched.
 *
 * The backend paginates list endpoints server-side, so `total`/`onPageChange` are
 * optional — supply them for server-paginated tables and omit both for small
 * client-side collections (a business's own service list, its waitlist).
 */
export default function DataTable({
  columns,
  rows = [],
  getRowId,
  searchable = true,
  searchKeys,
  loading = false,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  emptyIcon: EmptyIcon = Inbox,
  emptyAction,
  total,
  page = 1,
  onPageChange,
  onRowClick,
  rowClassName,
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [localPage, setLocalPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = rows;

    if (term && searchable) {
      const keys = searchKeys ?? columns.map((column) => column.key).filter(Boolean);
      result = result.filter((row) =>
        keys.some((key) => {
          const value = typeof key === "function" ? key(row) : row[key];
          return String(value ?? "").toLowerCase().includes(term);
        })
      );
    }

    if (sort.key) {
      const column = columns.find((entry) => entry.key === sort.key);
      const accessor =
        typeof column?.sortAccessor === "function"
          ? column.sortAccessor
          : (row) => row[sort.key];

      result = [...result].sort((a, b) => {
        const left = accessor(a);
        const right = accessor(b);
        // Numbers and dates compare naturally; everything else as a string.
        if (left === right) return 0;
        if (left === null || left === undefined) return 1;
        if (right === null || right === undefined) return -1;
        const comparison =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left).localeCompare(String(right), undefined, { numeric: true });
        return sort.direction === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [rows, search, sort, columns, searchable, searchKeys]);

  // Server-paginated tables get the page window from the API; client-side ones
  // slice locally.
  const isServerPaged = typeof total === "number" && typeof onPageChange === "function";
  const perPage = 10;
  const currentPage = isServerPaged ? page : localPage;
  const visible = isServerPaged
    ? filtered
    : filtered.slice((currentPage - 1) * perPage, currentPage * perPage);
  const localTotalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const changePage = (next) => {
    if (isServerPaged) onPageChange(next);
    else setLocalPage(next);
  };

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-surface p-5 shadow-card">
        <TableSkeleton rows={6} cols={Math.min(columns.length, 6)} />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-light">
          <EmptyIcon size={22} className="text-accent" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold">{emptyTitle}</h3>
        {emptyDescription && (
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        )}
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <label htmlFor="table-search" className="sr-only">
            Search this table
          </label>
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="table-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              if (!isServerPaged) setLocalPage(1);
            }}
            placeholder="Search…"
            className="input py-2.5 pl-11 text-sm"
          />
        </div>
      )}

      <div className="table-wrap rounded-2xl bg-surface p-2 shadow-card sm:p-4">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key ?? column.header} scope="col">
                  {column.sortable && column.key ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wide transition-colors hover:text-accent"
                    >
                      {column.header}
                      {sort.key === column.key ? (
                        sort.direction === "asc" ? (
                          <ChevronUp size={13} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={13} aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown size={13} className="opacity-40" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr
                key={getRowId ? getRowId(row) : row._id ?? row.id ?? index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={classNames(onRowClick && "cursor-pointer", rowClassName)}
              >
                {columns.map((column) => (
                  <td key={column.key ?? column.header} className={column.className}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visible.length === 0 && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No rows match “{search}”.
        </p>
      )}

      {!isServerPaged && filtered.length > perPage && (
        <Pagination
          page={currentPage}
          totalPages={localTotalPages}
          total={filtered.length}
          onChange={changePage}
        />
      )}

      {isServerPaged && total > 0 && (
        <Pagination
          page={currentPage}
          totalPages={Math.max(1, Math.ceil(total / (rows.length || 1)))}
          total={total}
          onChange={changePage}
        />
      )}
    </div>
  );
}
