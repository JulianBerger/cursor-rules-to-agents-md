export function toPosixPath(value: string): string {
  return value.replace(/\\/g, "/");
}

export function joinPath(...parts: string[]): string {
  const filtered = parts.filter((part) => part !== "").map(toPosixPath);
  if (filtered.length === 0) {
    return "";
  }

  const cleaned = filtered.map((part, index) => {
    if (index === 0) {
      return part.replace(/\/+$/g, "");
    }
    return part.replace(/^\/+/, "").replace(/\/+$/g, "");
  });

  return cleaned.join("/") || "/";
}

export function relativePath(from: string, to: string): string {
  const fromNormalized = toPosixPath(from).replace(/\/+$/, "");
  const toNormalized = toPosixPath(to);
  if (toNormalized.startsWith(`${fromNormalized}/`)) {
    return toNormalized.slice(fromNormalized.length + 1);
  }
  return toNormalized;
}
