import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";

import { features } from "../../lib";

export const FeaturesBlock: React.FC = () => {
  const theme = useTheme();

  return (
    <Container sx={{ py: 10, maxWidth: "1400px !important" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Наши сильные стороны
        </Typography>
        <Typography
          variant="h4"
          textAlign="center"
          color="text.primary"
          fontWeight={700}
          maxWidth={700}
        >
          Всё, что вам нужно для создания идеальной презентации
        </Typography>
      </Box>

      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 6 },
          maxWidth: "1200px",
          mx: "auto",
          display: "grid",
          gap: 4,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
          },
          alignItems: "stretch",
        }}
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              style={{ display: "flex", height: "100%" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 2,
                  p: 2,
                  backgroundColor: "transparent",
                  borderRadius: 2,
                  cursor: "default",
                  transition: "all 0.2s",
                  minHeight: 100,
                  "&:hover": {
                    scale: 1.04,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <Icon sx={{ fontSize: 36, color: "primary.main" }} />
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      fontSize: { xs: "1rem", sm: "1.05rem" },
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 0.5,
                      lineHeight: 1.4,
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Container>
  );
};
