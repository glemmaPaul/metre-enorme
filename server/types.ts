export interface StudentCompetency {
  imagePath: string;
  date: string;
  title: string;
}

export interface StudentInputData {
  name: string;
  competencies: StudentCompetency[];
}

export interface CSVParseOptions {
  startDate: Date;
  endDate: Date;
}

export interface CSVOutputData {
  category: string;
  students: [StudentInputData];
  headers: [string?];
}

export interface PDFInputData extends CSVOutputData {
  year: string;
  color: string;
  startDate: Date;
  endDate: Date;
}
