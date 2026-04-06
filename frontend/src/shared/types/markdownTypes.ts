export interface Theme {
  id: string;
  name: string;

  colors: {
    background?: string;
    backgroundImages?: string[];
    heading: string;
    paragraph: string;
  };

  fonts: {
    heading: string;
    paragraph: string;
  };
}

export interface SlideBlock {
  id: string;
  type: string;
  text?: string;
  items?: string[];
  richParts?: RichTextPart[][];
  url?: string;
  language?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
  chart?: {
    type:
      | "bar"
      | "line"
      | "pie"
      | "doughnut"
      | "radar"
      | "polarArea"
      | "scatter";
    labels: string[];
    values: number[];
    title?: string;
    colors?: string[];
  };
  widthPercent?: number;
  heightPercent?: number;

  xPercent?: number;
  yPercent?: number;

  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    lineHeight?: number;
    color?: string;
  };

  justifyContent?: "flex-start" | "flex-end";

  cellId?: string;
}

export interface RichTextPart {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  link?: string;
}

export interface PlateSlide {
  id: string;
  title: string;
  layout?:
    | "left-image"
    | "right-image"
    | "top-image"
    | "bottom-image"
    | "center"
    | "text-only"
    | "grid-2x2";
  content: SlideBlock[];
  alignItems?: "flex-start" | "flex-end" | "center";
  theme?: Theme;
  markdownText: string;
}
