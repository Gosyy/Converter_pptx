export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

export const updateUser = async (payload: UpdateUserPayload) => {
  const res = await fetch(`${process.env.REACT_APP_API_URL}/user/edit`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Ошибка");
  }
  return res.json();
};
