import { useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useHeader = () => {
  const controls = useAnimation();
  const location = useLocation();

  useEffect(() => {
    const updateHeader = () => {
      const isScrolled = window.scrollY > 64;
      controls.start({
        backgroundColor:
          isScrolled || location.pathname !== "/"
            ? "rgba(255,255,255,1)"
            : "rgba(255,255,255,0)",
        backdropFilter:
          isScrolled || location.pathname !== "/" ? "blur(6px)" : "blur(0px)",
        borderBottomColor:
          isScrolled || location.pathname !== "/"
            ? "rgba(0,0,0,0.12)"
            : "rgba(0,0,0,0)",
        boxShadow:
          isScrolled || location.pathname !== "/"
            ? "0 2px 8px rgba(0,0,0,0.08)"
            : "0 0 0 rgba(0,0,0,0)",
        transition: { duration: 0.15, ease: "easeOut" },
      });
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader);
    return () => window.removeEventListener("scroll", updateHeader);
  }, [controls, location.pathname]);

  return {
    controls,
    location,
  };
};
