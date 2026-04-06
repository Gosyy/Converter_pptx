import { useState, useEffect } from "react";
import {
  fetchPresentations as fetchPresApi,
  deletePresentation as deletePresApi,
} from "../../../../../entities/presentation";

export interface Presentation {
  id: string;
  title: string;
  content: any;
  theme?: any;
}

export const usePresentations = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Presentation | null>(null);

  const fetchPresentations = async () => {
    setLoading(true);
    try {
      const data = await fetchPresApi();
      setPresentations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePresentation = async () => {
    if (!deleteTarget) return;

    try {
      await deletePresApi(deleteTarget.id);
      setPresentations((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  return {
    presentations,
    loading,
    deleteTarget,
    setDeleteTarget,
    fetchPresentations,
    deletePresentation,
  };
};
