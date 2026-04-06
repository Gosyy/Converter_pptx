import { SlideBlock } from "../../../shared/types";

export const editSlide = async ({
  slide,
  text,
}: {
  slide: { slide_id: string; title: string; content: SlideBlock[] };
  text?: string;
}) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/presentation/edit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text || undefined,
        action: "custom",
        slide,
      }),
    }
  );

  if (!response.ok) throw new Error("Ошибка при отправке данных");

  return await response.text();
};
