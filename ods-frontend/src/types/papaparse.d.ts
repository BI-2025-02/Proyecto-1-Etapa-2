declare module 'papaparse' {
  interface ParseResult<T = unknown> {
    data: T[];
    errors: unknown[];
    meta: unknown;
  }

  interface ParseConfig<T = unknown> {
    header?: boolean;
    skipEmptyLines?: boolean | string;
    complete?: (results: ParseResult<T>) => void;
    error?: (err: unknown) => void;
  }

  export function parse<T = unknown>(input: File | string, config?: ParseConfig<T>): void;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
