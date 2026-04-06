import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { dockerCommands, endpoints } from "../../lib";

export const QuickStartBlock: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container sx={{ py: 10, maxWidth: "1200px !important" }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Быстрый старт
        </Typography>
        <Typography
          variant="h4"
          color="text.primary"
          fontWeight={700}
          maxWidth={700}
          mx="auto"
        >
          Настройка и запуск приложения за несколько минут
        </Typography>
      </Box>

      <Box mb={6}>
        <Typography variant="h5" color="text.secondary" fontWeight={600} mb={3}>
          Запуск через Docker
        </Typography>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: isMobile ? 2 : 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "grey.100",
              fontSize: isMobile ? 12 : undefined,
              fontFamily: "Monaco, Menlo, monospace",
              color: "text.primary",
              whiteSpace: "pre",
              overflowX: "auto",
              "&::-webkit-scrollbar": {
                height: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "grey.400",
                borderRadius: 3,
              },
              "&::-webkit-scrollbar-track": {
                bgcolor: "grey.200",
              },
            }}
          >
            {dockerCommands.join("\n")}
          </Paper>
        </motion.div>
      </Box>

      <Box>
        <Typography variant="h5" color="text.secondary" fontWeight={600} mb={3}>
          Доступ к приложению
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {endpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{ flex: "1 1 calc(33.333% - 16px)", display: "flex" }}
            >
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  p: 4,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  textAlign: "center",
                  bgcolor: "background.paper",
                  width: "100%",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "ActiveBorder",
                  },
                }}
              >
                <Box sx={{ mb: 1 }}>{endpoint.icon}</Box>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  {endpoint.heading}
                </Typography>
                <Typography variant="body1" color="text.primary">
                  {endpoint.text}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Container>
  );
};
