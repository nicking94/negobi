"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  Table as TanstackTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className=" backdrop-blur-sm shadow-xl rounded-md relative w-full "
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-green_xxl/20 data-[state=selected]:bg-green_xxl/30 border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-black h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ",
        className
      )}
      {...props}
    />
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  noResultsText?: string;
  page: number;
  setPage: (page: number) => void;
  totalPage: number;
  total: number;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className = "bg-white max-h-[75vh] md:max-h-[80vh]",
  headerClassName = "bg-green_m text-white font-semibold",
  rowClassName = "bg-white hover:bg-green_xxl/20 border-b border-gray_xxl",
  cellClassName = "py-3 px-4 text-left",
  noResultsText = "No hay resultados",
  page,
  setPage,
  totalPage,
  total,
  itemsPerPage,
  setItemsPerPage,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className={cn("flex flex-col ", className)}>
      <div className="rounded-md overflow-hidden flex flex-col">
        <div className=" overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap text-left px-4 py-3 border-b border-green_d",
                        headerClassName
                      )}
                      style={{ width: `${header.getSize()}px` }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className={rowClassName}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cellClassName}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className=" text-center">
                    {noResultsText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination
        page={page}
        setPage={setPage}
        totalPage={totalPage}
        total={total}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
}

type DataTablePaginationProps = {
  page: number;
  setPage: (page: number) => void;
  totalPage: number;
  total: number;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
};

function DataTablePagination({
  page,
  setPage,
  totalPage,
  total,
  itemsPerPage,
  setItemsPerPage,
}: DataTablePaginationProps) {
  // 🔹 Cálculo de rangos visibles
  const firstItem = (page - 1) * itemsPerPage + 1;
  const lastItem = Math.min(page * itemsPerPage, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 mt-4">
      {/* ---- Sección izquierda ---- */}
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Filas por página</p>
          <Select
            value={`${itemsPerPage}`}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setPage(1); // Opcional: volver a primera página
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {firstItem}-{lastItem} de {total} resultados
        </div>
      </div>

      {/* ---- Sección derecha (navegación) ---- */}
      <div className="flex items-center space-x-1">
        {/* Primera página */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(1)}
          disabled={page === 1}
          title="Primera página"
        >
          <span className="sr-only">Primera página</span>
          <ChevronsLeft className="h-3 w-3" />
        </Button>

        {/* Página anterior */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page === 1}
          title="Página anterior"
        >
          <span className="sr-only">Página anterior</span>
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Página siguiente */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(Math.min(page + 1, totalPage))}
          disabled={page === totalPage}
          title="Página siguiente"
        >
          <span className="sr-only">Página siguiente</span>
          <ChevronRight className="h-3 w-3" />
        </Button>

        {/* Última página */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(totalPage)}
          disabled={page === totalPage}
          title="Última página"
        >
          <span className="sr-only">Última página</span>
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
