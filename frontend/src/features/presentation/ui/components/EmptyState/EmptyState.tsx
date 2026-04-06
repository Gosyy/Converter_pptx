import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { Theme } from "../../../../../shared/types";

interface EmptyStateProps {
  theme?: Theme;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ theme }) => {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ height: "100vh ", boxSizing: "border-box", width: "100%", overflow: "hidden" }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid #ccc`,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${
            theme?.colors.background || "#fff"
          } 0%, ${theme?.colors.paragraph + "22" || "#eee"} 100%)`,
          textAlign: "center",
          p: 2,
          transition: "all 0.2s",
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ mb: 1 }} color="text.primary">
            Добро пожаловать!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Здесь будут отображаться ваши слайды.
            <br />
            Перейдите на основную страницу и отправьте сообщение с прикриплённым файлом нашему ИИ!
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};
