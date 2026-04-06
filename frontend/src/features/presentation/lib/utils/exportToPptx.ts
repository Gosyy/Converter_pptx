import PptxGenJS from "pptxgenjs";
import {
  PlateSlide,
  SlideBlock,
  Theme,
} from "../../../../shared/types/markdownTypes";

export const exportToPptx = (slides: PlateSlide[], theme: Theme) => {
  const pptx = new PptxGenJS();

  const PPT_WIDTH = 10;
  const PPT_HEIGHT = 5.625;

  function blendWithBackground(fgHex: string, bgHex: string, alpha: number) {
    const fg = parseInt(fgHex.replace(/^#/, ""), 16);
    const bg = parseInt(bgHex.replace(/^#/, ""), 16);

    const r = Math.round(
      ((fg >> 16) & 0xff) * alpha + ((bg >> 16) & 0xff) * (1 - alpha)
    );
    const g = Math.round(
      ((fg >> 8) & 0xff) * alpha + ((bg >> 8) & 0xff) * (1 - alpha)
    );
    const b = Math.round((fg & 0xff) * alpha + (bg & 0xff) * (1 - alpha));

    return (
      r.toString(16).padStart(2, "0") +
      g.toString(16).padStart(2, "0") +
      b.toString(16).padStart(2, "0")
    );
  }

  slides.forEach((slide, slideIndex) => {
    const pptSlide = pptx.addSlide();

    const bgImages: string[] = theme?.colors.backgroundImages ?? [];
    let bgImage: string | undefined;

    if (bgImages.length > 0) {
      // Выбор изображения по твоему правилу: 5-й слайд, 3-й слайд, иначе первый
      if ((slideIndex + 1) % 5 === 0 && bgImages[2]) {
        const match = bgImages[2].match(/^url\(['"]?(.*?)['"]?\)/);
        if (match) bgImage = match[1];
      } else if ((slideIndex + 1) % 3 === 0 && bgImages[1]) {
        const match = bgImages[1].match(/^url\(['"]?(.*?)['"]?\)/);
        if (match) bgImage = match[1];
      } else if (bgImages[0]) {
        const match = bgImages[0].match(/^url\(['"]?(.*?)['"]?\)/);
        if (match) bgImage = match[1];
      }
    }

    if (bgImage) {
      pptSlide.addImage({
        path: bgImage,
        x: 0,
        y: 0,
        w: PPT_WIDTH,
        h: PPT_HEIGHT,
        sizing: { type: "cover", w: PPT_WIDTH, h: PPT_HEIGHT },
      });
    } else if (typeof theme?.colors.background === "string") {
      pptSlide.background = { color: theme.colors.background };
    }

    slide.content.forEach((block: SlideBlock) => {
      const x = ((block.xPercent ?? 0) / 100) * PPT_WIDTH;
      const y = ((block.yPercent ?? 0) / 100) * PPT_HEIGHT;
      const w = ((block.widthPercent ?? 100) / 100) * PPT_WIDTH;
      const h = ((block.heightPercent ?? 100) / 100) * PPT_HEIGHT;

      const fontFace = block.style?.fontFamily ?? "Arial";
      const fontSize = block.style?.fontSize ?? 16;
      const bold = block.style?.fontWeight === 700;
      const color = block.style?.color ?? "000000";

      const fillColor =
        theme?.colors.background && theme?.colors.heading
          ? blendWithBackground(
              theme.colors.heading,
              theme.colors.background,
              0.1
            )
          : "CCCCCC";

      switch (block.type) {
        case "heading":
          pptSlide.addText(block.text ?? "", {
            x,
            y,
            w,
            h,
            fontSize: fontSize,
            bold: bold,
            align: block.justifyContent === "flex-end" ? "right" : "left",
            color: color,
            fontFace: fontFace,
          });
          break;
        case "paragraph":
          if (block.richParts?.length) {
            const richText = block.richParts[0].map((part) => ({
              text: part.text,
              options: {
                bold: part.bold,
                italic: part.italic,
                fontFace: part.code ? "Courier New" : fontFace,
                color,
                fontSize,
              },
            }));

            pptSlide.addText(richText, {
              x,
              y,
              w,
              h,
              align: block.justifyContent === "flex-end" ? "right" : "left",
              valign: "top",
            });
          } else {
            pptSlide.addText(block.text ?? "", {
              x,
              y,
              w,
              h,
              fontFace,
              fontSize,
              bold,
              color,
              align: block.justifyContent === "flex-end" ? "right" : "left",
            });
          }
          break;

        case "quote":
          const isRight = block.justifyContent === "flex-end";

          const stripeWidth = 0.02;
          pptSlide.addShape(pptx.ShapeType.rect, {
            x: x + (isRight ? w - stripeWidth : 0),
            y,
            w: stripeWidth,
            h,
            fill: { color: block.style?.color || "CCCCCC" },
            line: { color: block.style?.color || "CCCCCC" },
          });

          pptSlide.addText(block.text ?? "", {
            x: x + (isRight ? 0 : stripeWidth),
            y,
            w: w - stripeWidth,
            h,
            fontSize: fontSize,
            bold: bold,
            italic: true,
            color: color,
            fontFace: fontFace,
            align: isRight ? "right" : "left",
            valign: "top",
          });
          break;
        case "code":
          pptSlide.addShape(pptx.ShapeType.rect, {
            x,
            y,
            w,
            h,
            fill: {
              color: fillColor,
            },
            rectRadius: 2,
          });

          pptSlide.addText(block.text ?? "", {
            x: x + 0.1,
            y: y + 0.1,
            w: w - 0.2,
            h: h - 0.2,
            fontSize: fontSize,
            bold: bold,
            fontFace: fontFace,
            color: color,
            valign: "top",
            bullet: false,
            lineSpacing: 15,
          });
          break;

        case "list":
        case "ordered-list": {
          const isOrdered = block.type === "ordered-list";

          if (block.richParts?.length) {
            const lines = block.richParts.map((itemParts, index) => {
              const prefix = isOrdered ? `${index + 1}. ` : "• ";

              const richText = itemParts.map((part) => ({
                text: part.text,
                options: {
                  bold: part.bold,
                  italic: part.italic,
                  underline: part.link ? true : false,
                  fontSize,
                  color,
                },
              }));

              return [
                { text: prefix, options: { bold, fontFace, fontSize, color } },
                ...richText,
              ];
            });

            const finalRichText = lines.reduce((acc, line, idx) => {
              if (idx > 0) acc.push({ text: "\n", options: {} });
              acc.push(...line);
              return acc;
            }, [] as { text: string; options: any }[]);

            pptSlide.addText(finalRichText, {
              x,
              y,
              w,
              h,
              align: block.justifyContent === "flex-end" ? "right" : "left",
              valign: "top",
            });
          } else {
            const text = (block.items ?? [])
              .map((item, index) =>
                isOrdered ? `${index + 1}. ${item}` : `• ${item}`
              )
              .join("\n");

            pptSlide.addText(text, {
              x,
              y,
              w,
              h,
              fontFace,
              fontSize,
              bold,
              color,
              align: block.justifyContent === "flex-end" ? "right" : "left",
              valign: "top",
            });
          }
          break;
        }
        case "table":
          if (block.table) {
            const { headers, rows } = block.table;

            // Создаём кортеж из 4 границ для PptxGenJS
            const makeBorders = (
              color: string = "000000",
              pt: number = 1
            ): [any, any, any, any] => [
              { color, pt }, // top
              { color, pt }, // right
              { color, pt }, // bottom
              { color, pt }, // left
            ];

            const tableData = [
              headers.map((h) => ({
                text: h,
                options: {
                  bold: true,
                  fontFace: fontFace,
                  fontSize: fontSize,
                  color: color,
                  border: makeBorders(), // строго 4 элемента
                },
              })),
              ...rows.map((row) =>
                row.map((cell) => ({
                  text: cell,
                  options: {
                    bold: false,
                    fontFace: fontFace,
                    fontSize: fontSize,
                    color: color,
                    border: makeBorders(),
                  },
                }))
              ),
            ];

            pptSlide.addTable(tableData, {
              x,
              y,
              w,
              h,
              valign: "middle",
              align: "center",
            });
          }
          break;

        case "chart":
          if (block.chart && block.chart.type !== "polarArea") {
            pptSlide.addChart(
              block.chart.type,
              [
                {
                  name: block.chart.title || "Series 1",
                  labels: block.chart.labels,
                  values: block.chart.values,
                },
              ],
              {
                x,
                y,
                w,
                h: "50%",
                fontFace: fontFace,
                fontSize: fontSize,
                bold: bold,
                color: color,
              }
            );
          }
          break;

        case "image":
          if (!block.url) break;

          let imgX = block.xPercent;
          let imgY = block.yPercent;
          let imgW = block.widthPercent;
          let imgH = block.heightPercent;

          switch (slide.layout) {
            case "left-image":
              imgX = imgX ?? 0;
              imgY = imgY ?? 0;
              imgW = imgW ?? 40;
              imgH = imgH ?? 100;
              break;
            case "right-image":
              imgY = imgY ?? 0;
              imgW = imgW ?? 40;
              imgX = imgX ?? 100 - imgW!;
              imgH = imgH ?? 100;
              break;
            case "top-image":
              imgX = imgX ?? 0;
              imgY = imgY ?? 0;
              imgW = imgW ?? 100;
              imgH = imgH ?? 25;
              break;
            case "bottom-image":
              imgX = imgX ?? 0;
              imgY = imgY ?? 100 - imgH!;
              imgW = imgW ?? 100;
              imgH = imgH ?? 25;
              break;
            default:
              imgX = imgX ?? 0;
              imgY = imgY ?? 0;
              imgW = imgW ?? 50;
              imgH = imgH ?? 50;
          }

          pptSlide.addImage({
            path: block.url,
            x: (imgX / 100) * PPT_WIDTH,
            y: (imgY / 100) * PPT_HEIGHT,
            w: (imgW / 100) * PPT_WIDTH,
            h: (imgH / 100) * PPT_HEIGHT,
            sizing: {
              type: "cover",
              w: (imgW / 100) * PPT_WIDTH,
              h: (imgH / 100) * PPT_HEIGHT,
            },
          });
          break;

        default:
          break;
      }
    });
  });

  pptx.writeFile({ fileName: "presentation.pptx" });
};
