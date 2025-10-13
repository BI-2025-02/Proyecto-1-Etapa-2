// src/utils/csv.ts
import Papa from "papaparse";
import * as XLSX from "xlsx";

/** Tipo de datos esperado en el entrenamiento */
export interface TrainingData {
  text: string;
  label: string;
}

/** 
 * Función para leer un archivo CSV o XLSX y devolver un arreglo de objetos { text, label }
 */
export async function parseTrainingFile(file: File): Promise<TrainingData[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return await parseCSV(file);
  } else if (extension === "xlsx" || extension === "xls") {
    return await parseExcel(file);
  } else {
    throw new Error("Formato no soportado. Usa un archivo .csv o .xlsx");
  }
}

/** 🔹 Leer CSV con PapaParse */
async function parseCSV(file: File): Promise<TrainingData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
  const rows = (results.data || []) as unknown[];
        if (rows.length === 0) {
          return reject(new Error("El archivo CSV está vacío o no contiene filas con datos."));
        }

        const parsed = rows
          .map((row) => {
            // Normalizar keys a minúsculas para búsqueda flexible
              const lower: Record<string, unknown> = {};
              Object.keys((row || {}) as Record<string, unknown>).forEach((k) => {
                lower[k.toLowerCase().trim()] = (row as Record<string, unknown>)[k];
              });

            const text =
              lower["text"] ?? lower["texto"] ?? lower["message"] ?? "";
            const label = lower["label"] ?? lower["etiqueta"] ?? lower["class"] ?? "";

            return { text: String(text).trim(), label: String(label).trim() };
          })
          .filter((r) => r.text.length > 0 && r.label.length > 0);

        if (parsed.length === 0) {
          return reject(
            new Error(
              "No se encontraron columnas válidas 'text' y 'label' con datos. Asegúrate de que el CSV tenga encabezados y que las filas contengan texto y etiqueta."
            )
          );
        }

        resolve(parsed as TrainingData[]);
      },
      error: (error: unknown) => reject(error),
    });
  });
}

/** 🔹 Leer Excel con SheetJS (XLSX) */
async function parseExcel(file: File): Promise<TrainingData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as unknown[];

      const rows = json || [];
      if (rows.length === 0) {
        return reject(new Error("El archivo Excel está vacío."));
      }

      const parsed = rows
        .map((row) => {
          const lower: Record<string, unknown> = {};
          Object.keys((row || {}) as Record<string, unknown>).forEach((k) => {
            lower[k.toLowerCase().trim()] = (row as Record<string, unknown>)[k];
          });

          const text = lower["text"] ?? lower["texto"] ?? lower["message"] ?? "";
          const label = lower["label"] ?? lower["etiqueta"] ?? lower["class"] ?? "";

          return { text: String(text).trim(), label: String(label).trim() };
        })
        .filter((r) => r.text.length > 0 && r.label.length > 0);

      if (parsed.length === 0) {
        return reject(
          new Error(
            "No se encontraron columnas válidas 'text' y 'label' con datos en el Excel. Asegúrate de que la primera hoja tenga encabezados y filas con datos."
          )
        );
      }

      resolve(parsed as TrainingData[]);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
