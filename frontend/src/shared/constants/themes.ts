import { Theme } from "../types";
import AtomBg from "../assets/images/blue-slide-bg.jpg";

export const themes: Theme[] = [
  {
    id: "eclipse",
    name: "Eclipse",
    colors: {
      backgroundImages: [
        `url('${AtomBg}') center/cover no-repeat`,
        `url('${AtomBg}') center/cover no-repeat`,
        `url('${AtomBg}') center/cover no-repeat`,
      ],
      heading: "#1a2a6c",
      paragraph: "#334e68",
    },
    fonts: {
      heading: "Poppins, sans-serif",
      paragraph: "Poppins, sans-serif",
    },
  },
  // {
  //   id: "daktilo",
  //   name: "Daktilo",
  //   colors: { background: "#f5f8ff", heading: "#1a2a6c", paragraph: "#334e68" },
  //   fonts: { heading: "Calibri, sans-serif", paragraph: "Calibri, sans-serif" },
  // },
  {
    id: "cornflower",
    name: "Cornflower",
    colors: { background: "#f0f4ff", heading: "#3b2fbd", paragraph: "#5e5cce" },
    fonts: { heading: "Arial, sans-serif", paragraph: "Tahoma, sans-serif" },
  },
  {
    id: "orbit",
    name: "Orbit",
    colors: { background: "#f0f4ff", heading: "#2c2c7a", paragraph: "#4285f4" },
    fonts: { heading: "Verdana, sans-serif", paragraph: "Tahoma, sans-serif" },
  },
  {
    id: "piano",
    name: "Piano",
    colors: { background: "#fcfcfc", heading: "#222222", paragraph: "#444444" },
    fonts: { heading: "Times New Roman, serif", paragraph: "Georgia, serif" },
  },
  {
    id: "mystique",
    name: "Mystique",
    colors: { background: "#f6f1ff", heading: "#7e5af2", paragraph: "#9b82ff" },
    fonts: { heading: "Arial, sans-serif", paragraph: "Calibri, sans-serif" },
  },
  {
    id: "deepblue",
    name: "Deepblue",
    colors: { background: "#ecfbff", heading: "#0b3d4a", paragraph: "#008080" },
    fonts: {
      heading: "Courier New, monospace",
      paragraph: "Calibri, sans-serif",
    },
  },
  {
    id: "crimson",
    name: "Crimson",
    colors: { background: "#fff5f5", heading: "#b30000", paragraph: "#cc3333" },
    fonts: { heading: "Georgia, serif", paragraph: "Tahoma, sans-serif" },
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: { background: "#fff7f0", heading: "#cc5200", paragraph: "#ff8c42" },
    fonts: {
      heading: "Times New Roman, serif",
      paragraph: "Arial, sans-serif",
    },
  },
  {
    id: "forest",
    name: "Forest",
    colors: { background: "#f5fff5", heading: "#006633", paragraph: "#2a6b2f" },
    fonts: { heading: "Georgia, serif", paragraph: "Tahoma, sans-serif" },
  },
];
