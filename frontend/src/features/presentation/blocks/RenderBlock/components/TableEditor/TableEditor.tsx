import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { useTableEditor } from "../../hooks";

interface TableEditorProps {
  open: boolean;
  initialTable: { headers: string[]; rows: string[][] };
  onSave: (table: { headers: string[]; rows: string[][] }) => void;
  onCancel: () => void;
}

export const TableEditor: React.FC<TableEditorProps> = ({
  open,
  initialTable,
  onSave,
  onCancel,
}) => {
  const { table, setHeader, deleteCol, addCol, deleteRow, addRow, setCell } =
    useTableEditor({ initialTable });

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        Редактор таблицы
        <IconButton onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ overflowX: "auto" }}>
          <MuiTable size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                {table.headers.map((h, c) => (
                  <TableCell key={c}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <TextField
                        value={h}
                        onChange={(e) => setHeader(c, e.target.value)}
                        variant="standard"
                        size="small"
                        placeholder={`Header ${c + 1}`}
                      />
                      <Tooltip title="Удалить столбец">
                        <IconButton size="small" onClick={() => deleteCol(c)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Добавить столбец справа">
                        <IconButton size="small" onClick={() => addCol(c)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                ))}
                <TableCell>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => addCol()}
                  >
                    Добавить столбец
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((row, r) => (
                <TableRow key={r}>
                  {row.map((cell, c) => (
                    <TableCell key={c}>
                      <TextField
                        value={cell}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        variant="standard"
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Удалить строку">
                        <IconButton size="small" onClick={() => deleteRow(r)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Добавить строку ниже">
                        <IconButton size="small" onClick={() => addRow(r)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={Math.max(1, table.headers.length + 1)}>
                  <Button startIcon={<AddIcon />} onClick={() => addRow()}>
                    Добавить строку
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </MuiTable>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Отмена</Button>
        <Button variant="contained" onClick={() => onSave(table)}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
