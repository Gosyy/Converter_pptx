export interface Presentation {
  id: string;
  title: string;
  content: any;
  theme?: any;
}

const API_URL = process.env.REACT_APP_API_URL;

export const fetchPresentations = async (): Promise<Presentation[]> => {
  try {
    const res = await fetch(`${API_URL}/presentation/my-presentations`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Ошибка загрузки презентаций");
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
