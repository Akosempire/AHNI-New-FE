"use client";

/**
 * Toolbar above list pages.
 *  - Search only appears when the page actually supports it (Hick's law: no dead controls).
 *  - The search term is remembered per page for the session (Tesler's law: the app
 *    carries the memory, not the user).
 *  - On phones the page's main action moves to a sticky bottom bar in thumb reach
 *    (Fitts's law).
 */
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import { SearchTermContext, useIsPhone } from "@/components/Table/ResponsiveTable";

type PageProps = {
  children: ReactNode;
  leftAction?: ReactNode;
  filterAction?: () => void;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
};

const keyFor = (path: string) => `ahni-search:${path}`;

const TableFilters: FC<PageProps> = ({
  children,
  leftAction,
  filterAction,
  onSearchChange,
  searchPlaceholder = "Search",
}) => {
  const pathname = usePathname() || "";
  const phone = useIsPhone();
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const restored = useRef(false);

  const emit = (v: string) => {
    if (!onSearchChange || !inputRef.current) return;
    inputRef.current.value = v;
    onSearchChange({ target: inputRef.current, currentTarget: inputRef.current } as React.ChangeEvent<HTMLInputElement>);
  };

  // Restore the last search on this page
  useEffect(() => {
    if (restored.current || !onSearchChange) return;
    restored.current = true;
    try {
      const saved = sessionStorage.getItem(keyFor(pathname));
      if (saved) {
        setValue(saved);
        // let the input mount first
        requestAnimationFrame(() => emit(saved));
      }
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, onSearchChange]);

  const remember = (v: string) => {
    try {
      if (v) sessionStorage.setItem(keyFor(pathname), v);
      else sessionStorage.removeItem(keyFor(pathname));
    } catch {
      /* ignore */
    }
  };

  const hasToolbar = !!onSearchChange || !!filterAction || (!!leftAction && !phone);

  return (
    <div className="space-y-6 md:space-y-8">
      {hasToolbar && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            {onSearchChange && (
              <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 shadow-sm focus-within:border-gray-900 focus-within:ring-2 focus-within:ring-gray-900/10 sm:w-[360px] sm:flex-none dark:bg-transparent">
                <Search size={18} className="shrink-0 text-gray-500" aria-hidden="true" />
                <span className="sr-only">{searchPlaceholder}</span>
                <input
                  ref={inputRef}
                  type="search"
                  value={value}
                  className="h-full w-full min-w-0 border-none bg-transparent text-sm !shadow-none !outline-none !ring-0 [&::-webkit-search-cancel-button]:hidden"
                  placeholder={searchPlaceholder}
                  onChange={(e) => {
                    setValue(e.target.value);
                    remember(e.target.value);
                    onSearchChange(e);
                  }}
                />
                {value && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    className="-mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
                    onClick={() => {
                      setValue("");
                      remember("");
                      emit("");
                      inputRef.current?.focus();
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
            )}
            {filterAction && (
              <button
                type="button"
                onClick={filterAction}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold shadow-sm hover:bg-gray-50 dark:bg-transparent"
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filters
              </button>
            )}
          </div>
          {!phone && leftAction}
        </div>
      )}
      <SearchTermContext.Provider value={value}>
        <div>{children}</div>
      </SearchTermContext.Provider>

      {phone && leftAction && (
        <>
          <div className="ux-sticky-spacer" aria-hidden="true" />
          <div className="ux-sticky-action">{leftAction}</div>
        </>
      )}
    </div>
  );
};

export default TableFilters;
