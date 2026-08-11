declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: Record<string, WorkSheet>;
  }

  export interface WorkSheet {}

  export interface WritingOptions {
    type?: 'base64' | 'binary' | 'buffer' | 'file' | 'array';
    bookType?: 'xlsx' | 'xlsm' | 'xlsb' | 'csv' | 'txt' | 'html';
  }

  export const utils: {
    json_to_sheet<T>(data: T[]): WorkSheet;
    book_new(): WorkBook;
    book_append_sheet(workbook: WorkBook, worksheet: WorkSheet, name: string): void;
  };

  export function writeFile(workbook: WorkBook, filename: string, opts?: WritingOptions): void;
}
