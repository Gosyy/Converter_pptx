import { PlateSlide } from "../../../shared/types";

export interface SavePresentationPayload {
  id: string;
  title: string;
  content: PlateSlide[];
  theme?: any | null;
}

export const savePresentation = async (payload: SavePresentationPayload) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/presentation/save-presentation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Save error:", error);
    throw error;
  }
};
