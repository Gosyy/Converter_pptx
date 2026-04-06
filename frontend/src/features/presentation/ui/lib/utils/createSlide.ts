import { PlateSlide } from "../../../../../shared/types";
import { v4 as uuidv4 } from "uuid";

export const createSlide = (layout: PlateSlide["layout"]): PlateSlide => {
  const newSlide: PlateSlide = {
    id: uuidv4(),
    title: "Новый слайд",
    layout,
    markdownText: "",
    content: [],
  };

  if (
    ["left-image", "right-image", "top-image", "bottom-image"].includes(
      layout ?? ""
    )
  ) {
    let imgCoords = {
      xPercent: 0,
      yPercent: 0,
      widthPercent: 50,
      heightPercent: 50,
    };

    switch (layout) {
      case "left-image":
        imgCoords = {
          xPercent: 0,
          yPercent: 0,
          widthPercent: 50,
          heightPercent: 100,
        };
        break;
      case "right-image":
        imgCoords = {
          xPercent: 50,
          yPercent: 0,
          widthPercent: 50,
          heightPercent: 100,
        };
        break;
      case "top-image":
        imgCoords = {
          xPercent: 0,
          yPercent: 0,
          widthPercent: 100,
          heightPercent: 25,
        };
        break;
      case "bottom-image":
        imgCoords = {
          xPercent: 0,
          yPercent: 75,
          widthPercent: 100,
          heightPercent: 25,
        };
        break;
    }

    newSlide.content = [
      {
        id: uuidv4(),
        type: "image",
        url: "https://via.placeholder.com/400x300?text=Image",
        ...imgCoords,
      },
      {
        id: uuidv4(),
        type: "heading",
        text: "Заголовок",
        xPercent: 0,
        yPercent: imgCoords.yPercent + imgCoords.heightPercent,
        widthPercent: 100,
        heightPercent: 20,
        style: { fontSize: 28, fontWeight: 700 },
      },
    ];
  } else {
    newSlide.content = [
      {
        id: uuidv4(),
        type: "heading",
        text: "Заголовок",
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 20,
        style: { fontSize: 28, fontWeight: 700 },
      },
    ];
  }

  return newSlide;
};
