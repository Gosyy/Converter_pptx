import { useEffect, useState } from "react";

interface useTableEditorProps {
  initialTable: { headers: string[]; rows: string[][] };
}

export const useTableEditor = ({ initialTable }: useTableEditorProps) => {
  const [table, setTable] = useState({
    headers: initialTable?.headers.slice() ?? [],
    rows: initialTable?.rows.map((r) => r.slice()) ?? [],
  });

  useEffect(() => {
    const cols = table.headers.length;
    setTable((t) => ({
      headers: t.headers,
      rows: t.rows.map((r) => {
        const copy = r.slice();
        while (copy.length < cols) copy.push("");
        while (copy.length > cols) copy.pop();
        return copy;
      }),
    }));
  }, [table.headers.length]);

  const setCell = (r: number, c: number, value: string) =>
    setTable((t) => {
      const rows = t.rows.map((row) => row.slice());
      rows[r][c] = value;
      return { ...t, rows };
    });

  const setHeader = (c: number, value: string) =>
    setTable((t) => {
      const headers = t.headers.slice();
      headers[c] = value;
      return { ...t, headers };
    });

  const addRow = (atIndex?: number) =>
    setTable((t) => {
      const newRow = Array.from({ length: t.headers.length }).map(() => "");
      const rows = t.rows.slice();
      rows.splice(
        typeof atIndex === "number" ? atIndex + 1 : rows.length,
        0,
        newRow
      );
      return { ...t, rows };
    });

  const deleteRow = (r: number) =>
    setTable((t) => {
      const rows = t.rows.slice();
      rows.splice(r, 1);
      return { ...t, rows };
    });

  const addCol = (atIndex?: number) =>
    setTable((t) => {
      const headers = t.headers.slice();
      const insertAt =
        typeof atIndex === "number" ? atIndex + 1 : headers.length;
      headers.splice(insertAt, 0, "");
      const rows = t.rows.map((row) => {
        const r = row.slice();
        r.splice(insertAt, 0, "");
        return r;
      });
      return { headers, rows };
    });

  const deleteCol = (c: number) =>
    setTable((t) => {
      const headers = t.headers.slice();
      headers.splice(c, 1);
      const rows = t.rows.map((row) => {
        const r = row.slice();
        r.splice(c, 1);
        return r;
      });
      return { headers, rows };
    });

  return {
    table,
    setHeader,
    deleteCol,
    addCol,
    deleteRow,
    addRow,
    setCell,
  };
};
