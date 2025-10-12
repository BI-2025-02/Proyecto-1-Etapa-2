export function parseCSV(text: string): { textos: string[]; labels: number[] } {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { textos: [], labels: [] };
  const header = lines[0].toLowerCase();
  const data = (header.includes("text") && header.includes("label")) ? lines.slice(1) : lines;
  const textos: string[] = [], labels: number[] = [];

  for (const line of data) {
    const i = line.lastIndexOf(",");
    if (i === -1) continue;
    const texto = line.slice(0, i).replace(/^"|"$/g, "").trim();
    const label = Number(line.slice(i + 1).trim());
    if (!Number.isNaN(label)) { textos.push(texto); labels.push(label); }
  }
  return { textos, labels };
}
