const API_URL = process.env.REACT_APP_API_URL;

export const deletePresentation = async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/presentation/presentations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Ошибка удаления презентации");
  } catch (err) {
    console.error(err);
    throw err;
  }
};
