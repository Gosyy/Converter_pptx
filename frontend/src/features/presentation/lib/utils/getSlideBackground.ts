import { Theme } from "../../../../shared/types";

export const getSlideBackground = (
  theme: Theme | undefined,
  index: number
): string => {
  const bgImages = theme?.colors.backgroundImages;
  if (!bgImages) return theme?.colors.background || "#fff";

  if ((index + 1) % 5 === 0 && bgImages[2]) return bgImages[2];
  if ((index + 1) % 3 === 0 && bgImages[1]) return bgImages[1];
  return bgImages[0];
};
