export interface StudentInputData {
  name: string;
}

export interface CSVOutputData {
  category: string;
  students: [StudentInputData];
  headers: [string?];
}

export interface PDFInputData extends CSVOutputData {
  year: string;
  color: string;
}
