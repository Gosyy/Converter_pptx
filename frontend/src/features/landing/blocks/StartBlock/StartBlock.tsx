import { Box, Button, Container } from "@mui/material";
import React from "react";

export const StartBlock = () => {
  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 200,
          borderTop: "1px solid lightgray",
          borderBottom: "1px solid lightgray",
        }}
      >
        <Button
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          sx={{
            borderRadius: "8px",
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.main" },
            textTransform: "none",
            px: 4,
            py: 2,
          }}
        >
          Приступить к работе
        </Button>
      </Box>
    </Container>
  );
};
