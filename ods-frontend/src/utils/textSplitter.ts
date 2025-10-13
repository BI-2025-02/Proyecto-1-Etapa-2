// utils/textSplitter.ts
export function splitTextsByParagraphs(input: string): string[] {
  return input
    .replace(/\r\n/g, "\n") // normaliza saltos de línea de Windows
    .trim()
    // divide cuando hay una o más líneas vacías o una línea que sea solo "---"
    .split(/\n\s*\n|^---+$/gm)
    .map((t) => t.trim())
    .filter(Boolean);
}
