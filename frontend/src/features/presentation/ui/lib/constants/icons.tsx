import TextFieldsIcon from "@mui/icons-material/TextFieldsOutlined";
import CodeIcon from "@mui/icons-material/CodeOutlined";
import FormatQuoteIcon from "@mui/icons-material/FormatQuoteOutlined";
import TableChartIcon from "@mui/icons-material/TableChartOutlined";
import ListIcon from "@mui/icons-material/ListOutlined";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";
import TitleIcon from "@mui/icons-material/TitleOutlined";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeftOutlined";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRightOutlined";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTopOutlined";
import VerticalAlignCenterIcon from "@mui/icons-material/VerticalAlignCenterOutlined";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottomOutlined";

export const settingsIcons = [
  {
    id: "heading",
    title: "Добавить заголовок",
    icon: <TitleIcon />,
    action: "add-heading",
  },
  {
    id: "paragraph",
    title: "Добавить текст",
    icon: <TextFieldsIcon />,
    action: "add-paragraph",
  },
  { id: "code", title: "Добавить код", icon: <CodeIcon />, action: "add-code" },
  {
    id: "quote",
    title: "Добавить цитату",
    icon: <FormatQuoteIcon />,
    action: "add-quote",
  },
  {
    id: "table",
    title: "Добавить таблицу",
    icon: <TableChartIcon />,
    action: "add-table",
  },
  {
    id: "list",
    title: "Добавить список",
    icon: <ListIcon />,
    action: "add-list",
  },
  {
    id: "chart",
    title: "Добавить график",
    icon: <BarChartIcon />,
    action: "add-chart",
  },
  {
    id: "justify-start",
    title: "Выровнять влево",
    icon: <FormatAlignLeftIcon />,
    action: "justify-start",
  },
  {
    id: "justify-end",
    title: "Выровнять вправо",
    icon: <FormatAlignRightIcon />,
    action: "justify-end",
  },
  {
    id: "align-start",
    title: "Сверху",
    icon: <VerticalAlignTopIcon />,
    action: "align-start",
  },
  {
    id: "align-center",
    title: "По центру",
    icon: <VerticalAlignCenterIcon />,
    action: "align-center",
  },
  {
    id: "align-end",
    title: "Снизу",
    icon: <VerticalAlignBottomIcon />,
    action: "align-end",
  },
];
