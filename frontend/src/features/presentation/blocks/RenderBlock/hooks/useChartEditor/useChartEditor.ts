import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../app/store";
import { SlideBlock } from "../../../../../../shared/types";
import { updateBlock } from "../../../../../../app/store/slices/editorSlice";

interface useChartEditorProps {
  initialChart: NonNullable<SlideBlock["chart"]>;
}

export const useChartEditor = ({ initialChart }: useChartEditorProps) => {
  const [chart, setChart] = useState({ ...initialChart });

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  useEffect(() => {
    setChart({ ...initialChart });
  }, [initialChart]);

  const updateLabel = (idx: number, value: string) => {
    setChart((c) => ({
      ...c,
      labels: c.labels.map((l, i) => (i === idx ? value : l)),
    }));
  };

  const updateValue = (idx: number, value: number) => {
    setChart((c) => ({
      ...c,
      values: c.values.map((v, i) => (i === idx ? value : v)),
    }));
  };

  const addDataPoint = () => {
    setChart((c) => ({
      ...c,
      labels: [...c.labels, `Label ${c.labels.length + 1}`],
      values: [...c.values, 0],
      colors: Array.isArray(c.colors) ? [...c.colors, "#4bc0c0"] : c.colors,
    }));
  };

  const removeDataPoint = (idx: number) => {
    setChart((c) => ({
      ...c,
      labels: c.labels.filter((_, i) => i !== idx),
      values: c.values.filter((_, i) => i !== idx),
      colors: Array.isArray(c.colors)
        ? c.colors.filter((_, i) => i !== idx)
        : c.colors,
    }));
  };
  return {
    chart,
    theme,
    updateLabel,
    updateValue,
    addDataPoint,
    removeDataPoint,
    setChart,
  };
};
