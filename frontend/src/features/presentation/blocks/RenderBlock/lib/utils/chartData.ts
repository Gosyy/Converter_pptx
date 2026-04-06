import { Theme } from "../../../../../../shared/types";
import { ChartData, ChartOptions, ChartType } from "chart.js";

export function buildChartData({
  type,
  labels,
  values,
  colors,
  title,
  theme,
}: {
  type: "bar" | "line" | "scatter" | "pie" | "doughnut" | "polarArea" | "radar";
  labels: string[];
  values: number[];
  colors?: string[] | undefined;
  title?: string | undefined;
  theme: Theme;
}) {
  const bgColors = Array.isArray(colors)
    ? colors
    : labels.map(() => colors || theme.colors.heading);

  return {
    labels,
    datasets: [
      {
        label: title || "Данные",
        data: values,
        backgroundColor:
          type === "pie" || type === "doughnut" || type === "polarArea"
            ? bgColors
            : bgColors.map((c) => c + "99"),
        borderColor: bgColors,
        borderWidth: 2,
        fill: type === "line" || type === "radar",
        tension: 0.3,
      },
    ],
  };
}

export function buildChartOptions({
  type,
  theme,
  title,
  isMini,
}: {
  type: string;
  theme: Theme;
  title?: string;
  isMini?: boolean;
}) {
  const textColor = theme.colors.paragraph;
  const fontFamily = theme.fonts.paragraph;

  return {
    responsive: !isMini,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position:
          type === "pie" || type === "doughnut" || type === "polarArea"
            ? "right"
            : "top",
        labels: {
          color: textColor,
          font: { family: fontFamily, size: isMini ? 14 : 14, weight: "400" },
        },
      },
      title: {
        display: true,
        text: title,
        color: theme.colors.heading,
        font: { family: theme.fonts.heading, size: 16, weight: "700" },
      },
      tooltip: {
        titleFont: { family: fontFamily, size: isMini ? 12 : 12 },
        bodyFont: { family: fontFamily, size: isMini ? 12 : 12 },
      },
    },
    scales:
      type === "pie" || type === "doughnut" || type === "polarArea"
        ? undefined
        : {
            x: {
              ticks: {
                color: textColor,
                font: { family: fontFamily, size: isMini ? 2 : 12 },
              },
              grid: { color: "#e0e0e0" },
            },
            y: {
              ticks: {
                color: textColor,
                font: { family: fontFamily, size: isMini ? 2 : 12 },
              },
              grid: { color: "#e0e0e0" },
            },
          },
  } as any;
}

export function buildChartDimensions(isMini?: boolean) {
  return {
    width: isMini ? 370 : 1000,
    height: isMini ? 270 : 900,
  };
}
