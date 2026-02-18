"use client";

import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  align?: "left" | "right";
  className?: string;
  cell: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string | number;
  emptyMessage?: string;
  /** ColSpan for the empty state row. Defaults to columns.length + (renderActions ? 1 : 0). */
  emptyColSpan?: number;
  renderActions?: (row: T) => ReactNode;
  /** Only show actions column when this is true and renderActions is provided. */
  showActions?: boolean;
  actionsHeaderClassName?: string;
  onClick?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No data.",
  emptyColSpan,
  renderActions,
  showActions = true,
  actionsHeaderClassName = "w-[80px]",
  onClick,
}: DataTableProps<T>) {
  const hasActions = Boolean(renderActions && showActions);
  const span = emptyColSpan ?? columns.length + (hasActions ? 1 : 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.id}
              className={
                col.align === "right"
                  ? `text-right ${col.className ?? ""}`.trim()
                  : col.className
              }
            >
              {col.header}
            </TableHead>
          ))}
          {hasActions && (
            <TableHead className={actionsHeaderClassName}>Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={span}
              className="text-muted-foreground py-8 text-center text-sm"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  className={
                    col.align === "right"
                      ? `text-right ${col.className ?? ""}`.trim()
                      : col.className
                  }
                >
                  {col.cell(row)}
                </TableCell>
              ))}
              {hasActions && <TableCell>{renderActions!(row)}</TableCell>}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
