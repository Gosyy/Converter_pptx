import { useState } from "react";

export const useIconsReveal = () => {
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSlideTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.closest("button,a,[data-block-id]")) return;

    if (isAnimating) return;

    setTapped((prev) => !prev);
  };

  return {
    hovered,
    setHovered,
    tapped,
    setTapped,
    handleSlideTap,
    setIsAnimating,
  };
};
