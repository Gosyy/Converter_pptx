export const getContext = async (
  file: File,
  model: string,
  text: string,
  clientId: string,
  onChunk?: (chunk: string) => void
) => {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("file", file);
  formData.append("model", model);
  formData.append("client_id", clientId);

  const resp = await fetch(`${process.env.REACT_APP_API_URL}/presentation/generate`, {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) throw new Error("Ошибка конвертации файла");

  const reader = resp.body?.getReader();
  let result = "";

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    const chunk = new TextDecoder().decode(value);
    result += chunk;
    onChunk?.(chunk);
  }

  return result;
};
