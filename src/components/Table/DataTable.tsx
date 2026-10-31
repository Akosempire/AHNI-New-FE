import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table";
import Pagination from "@/components/Pagination";

import ResponsiveTable from "@/components/Table/ResponsiveTable";
import { ReactNode } from "react";

type TPagination = {
  total: number;
  pageSize: number;
  page: number;
  onChange: (page: number) => void;
};
interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
  footer?: boolean;
  pagination?: TPagination;
  headClass?: string;
  /** Shown when there are no rows */
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
}

export default function DataTable<TData>({
  data,
  columns,
  onRowClick,
  isLoading,
  footer = false,
  pagination,
  headClass,
  emptyTitle,
  emptyMessage,
  emptyAction,
}: TableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? undefined : getPaginationRowModel(), // Only use internal pagination if no custom pagination
    // debugTable: true,
    defaultColumn: {
      // size: 150,
      // minSize: 100,
      // maxSize: 600,
      // cell: (info) => createElement(Typography, {}, info.getValue()),
    },
    ...(pagination ? {
      manualPagination: true, // Tell table we're handling pagination externally
      pageCount: Math.ceil(pagination.total / pagination.pageSize),
    } : {}),
  });

  return (
    <div>
      <ResponsiveTable
        table={table}
        columnsCount={columns.length}
        isLoading={isLoading}
        onRowClick={onRowClick}
        footer={footer}
        headClass={headClass}
        emptyTitle={emptyTitle}
        emptyMessage={emptyMessage}
        emptyAction={emptyAction}
      />

      {pagination && (
        <Pagination
          total={pagination.total}
          itemsPerPage={pagination.pageSize}
          page={pagination.page}
          onChange={pagination.onChange}
        />
      )}
    </div>
  );
}

/*  <div className="flex items-center justify-end my-4 gap-x-4 ">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </span>{" "}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div> */
