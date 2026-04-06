export function parseChartBlock(str: string) {
  const lines = str.split("\n").filter(Boolean);
  const obj: any = {};

  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    let value = rest.join(":").trim();

    try {
      if (/^[\[\{]/.test(value)) {
        obj[key.trim()] = JSON.parse(value);
      } else {
        obj[key.trim()] = JSON.parse(value);
      }
    } catch {
      obj[key.trim()] = value.replace(/^"(.*)"$/, "$1");
    }
  }

  return obj;
}
