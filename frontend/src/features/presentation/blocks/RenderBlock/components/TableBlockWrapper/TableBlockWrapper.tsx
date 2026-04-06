import React from "react";
import { Box } from "@mui/material";
import EditableWrapper from "../EditableWrapper";
import TableEditor from "../TableEditor";
import { HeadingBlockProps } from "../HeadingBlock/HeadingBlock";
import { useTableWrapper } from "../../hooks";

const TableBlockWrapper: React.FC<HeadingBlockProps> = ({
  block,
  id,
  slideId,
  editingBlock,
  setEditingBlock,
}) => {
  const {
    isEditing,
    handleCancel,
    handleEdit,
    handleDelete,
    handleSave,
    theme,
  } = useTableWrapper({
    editingBlock,
    block,
    setEditingBlock,
    id,
    slideId,
  });

  return (
    <>
      <EditableWrapper onEdit={handleEdit} onDelete={handleDelete}>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box
            component="table"
            sx={{
              minWidth: "100%",
              borderCollapse: "collapse",
              fontFamily: theme?.fonts.paragraph || "Inter, sans-serif",
              fontSize: block.style?.fontSize || 16,
              color: block.style?.color || theme?.colors.paragraph || "#000",
              "& th, & td": {
                border: `1px solid ${theme?.colors.paragraph || "#ccc"}`,
                p: "8px 12px",
                textAlign:
                  block.justifyContent === "flex-end" ? "end" : "start",
                whiteSpace: "nowrap",
              },
              "& th": {
                bgcolor: theme?.colors.background
                  ? `${theme.colors.background}cc`
                  : "#f9f9f9",
                fontWeight: 600,
                color: theme?.colors.heading || "#000",
                fontFamily: theme?.fonts.heading || "Roboto Slab, serif",
              },
              "& tr:nth-of-type(even)": {
                bgcolor: theme?.colors.background
                  ? `${theme.colors.background}f2`
                  : "#fafafa",
              },
            }}
          >
            <thead>
              <tr>
                {block.table?.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table?.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Box>
        </Box>
      </EditableWrapper>

      {isEditing && (
        <TableEditor
          open={true}
          initialTable={block.table ?? { headers: [], rows: [] }}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default TableBlockWrapper;
