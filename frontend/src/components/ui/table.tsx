import * as React from "react"
import { cn } from "@/lib/utils"

export const Table = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className="relative w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)}>{children}</table>
  </div>
)

export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="[&_tr]:border-b bg-muted/50">{children}</thead>
)

export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
)

export const TableRow = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <tr className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}>
    {children}
  </tr>
)

export const TableHead = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <th className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)}>
    {children}
  </th>
)

export const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}>
    {children}
  </td>
)