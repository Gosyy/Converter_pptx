import React from "react";
import { Box, Container, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";

import { reasons } from "../../lib/constants/reasons";

export const WhyUsBlock: React.FC = () => {
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
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 1 }}
        >
          Почему выбирают нас
        </Typography>
        <Typography
          variant="h4"
          color="text.primary"
          textAlign="center"
          fontWeight={700}
          maxWidth={700}
        >
          Преимущества нашей платформы
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
          },
        }}
      >
        {reasons.map((reason, index) => {
          const Icon = reason.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                  p: 3,
                  backgroundColor: "transparent",
                  borderRadius: 2,
                  textAlign: "center",
                  cursor: "default",
                  transition: "all 0.2s",
                  "&:hover": {
                    scale: 1.04,
                  },
                }}
              >
                <Icon sx={{ fontSize: 48, color: "primary.main" }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: { xs: "1rem", sm: "1.1rem" },
                  }}
                >
                  {reason.title}
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
                  {reason.description}
                </Typography>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Container>
  );
};
