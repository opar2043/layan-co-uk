"use client";

import { useMemo, useState } from "react";
import { Users, Search } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import DataTable from "@/components/Dashboard/DataTable";
import Pagination from "@/components/Public/Pagination";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 10;

export default function AdminUsers() {
  const [page, setPage] = useState(1);
  const [term, setTerm] = useState("");
  const [city, setCity] = useState("");

  // `q` and `city` are server-side filters; `term` is additionally matched
  // client-side so typing feels instant.
  const { data, isLoading, error } = useUsers(
    { page, limit: PER_PAGE, ...(term.trim() ? { q: term.trim() } : {}), ...(city.trim() ? { city: city.trim() } : {}) },
    { enabled: true }
  );

  const users = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const columns = useMemo(
    () => [
      {
        key: "name",
        label: "Name",
        render: (row) => (
          <div>
            <p className="font-medium">{row.name}</p>
            {row.referralCode && <p className="text-xs text-muted-foreground">Ref {row.referralCode}</p>}
          </div>
        ),
      },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone", render: (row) => row.phone || <span className="text-muted-foreground">—</span> },
      {
        key: "location.city",
        label: "City",
        render: (row) => row.location?.city || <span className="text-muted-foreground">—</span>,
      },
      {
        key: "favouriteBusinessIds",
        label: "Favourites",
        render: (row) => row.favouriteBusinessIds?.length ?? 0,
      },
      { key: "createdAt", label: "Joined", render: (row) => formatDate(row.createdAt) },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl">Customers</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {total} registered {total === 1 ? "account" : "accounts"}, newest first.
        </p>
      </header>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-3 sm:flex-row"
        role="search"
      >
        <div className="relative flex-1">
          <label htmlFor="admin-user-search" className="sr-only">
            Search by name or email
          </label>
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="admin-user-search"
            type="search"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email"
            className="input pl-11"
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor="admin-user-city" className="sr-only">
            Filter by city
          </label>
          <input
            id="admin-user-city"
            type="text"
            value={city}
            onChange={(event) => {
              setCity(event.target.value);
              setPage(1);
            }}
            placeholder="City"
            className="input"
          />
        </div>
      </form>

      <DataTable
        columns={columns}
        rows={users}
        getRowId={(row) => row._id}
        searchable={false}
        loading={isLoading}
        emptyIcon={Users}
        emptyTitle="No customers found"
        emptyDescription={
          term.trim() || city.trim()
            ? "No account matches those filters."
            : "Customers appear here after their first Firebase sign-in."
        }
      />

      {totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
      )}
    </div>
  );
}
