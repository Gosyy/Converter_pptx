import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import EditorPage from "../../../pages/EditorPage/EditorPage";
import PromptPage from "../../../pages/PromptPage/PromptPage";
import GeneratePage from "../../../pages/GeneratePage/GeneratePage";
import { Header } from "../../../widgets/Header";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Footer } from "../../../widgets/Footer/ui/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import MyPresentationsPage from "../../../pages/MyPresentationsPage/MyPresentationsPage";

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    style={{ height: "100%" }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));
  const hideFooter = location.pathname === "/projects";

  return (
    <>
      <AnimatePresence mode="wait" initial>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <PromptPage />
              </PageWrapper>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <GeneratePage />
                </PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <EditorPage />
                </PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <MyPresentationsPage />
                </PageWrapper>
              </ProtectedRoute>
            }
          />
        </Routes>
        {!hideFooter && (
          <Box sx={{ height: isMobile ? 64 : 120, flexShrink: 0 }}>
            <Footer />
          </Box>
        )}
      </AnimatePresence>
    </>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Загрузка...</div>}>
        <Box
          sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ height: 64, flexShrink: 0 }}>
            <Header />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <AnimatedRoutes />
          </Box>
        </Box>
      </Suspense>
    </BrowserRouter>
  );
};
