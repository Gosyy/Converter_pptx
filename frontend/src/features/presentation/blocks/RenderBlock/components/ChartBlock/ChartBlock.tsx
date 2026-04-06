import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
} from "react-chartjs-2";
import { Box } from "@mui/material";
import { SlideBlock, Theme } from "../../../../../../shared/types";
import { buildChartData, buildChartOptions } from "../../lib";

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title
);

interface ChartBlockProps {
  chart: NonNullable<SlideBlock["chart"]>;
  theme: Theme;
  isMini?: boolean;
}

const chartComponents = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
  scatter: Scatter,
} as const;

const ChartBlock: React.FC<ChartBlockProps> = ({ chart, theme, isMini }) => {
  const { type, labels, values, title, colors } = chart;
  const ChartComponent = chartComponents[type];
  if (!ChartComponent) return null;

  const data = buildChartData({ type, labels, values, colors, title, theme });
  const options = buildChartOptions({
    type,
    theme,
    title,
    isMini,
  });

  const textColor = theme.colors.paragraph;
  const fontFamily = theme.fonts.paragraph;

  const width = isMini ? 370 : 1000;
  const height = isMini ? 270 : 900;

  return (
    <Box
      sx={{
        fontFamily,
        color: textColor,
        maxWidth: isMini ? 700 : 600,
        maxHeight: isMini ? 500 : 385,
        position: "relative",
        textAlign: "left",
      }}
    >
      <ChartComponent
        data={data}
        options={options}
        width={width}
        height={height}
      />
    </Box>
  );
};

export default ChartBlock;
