import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import debugFactory from 'debug';
import { generateHTML } from './pdf';
import puppeteer from 'puppeteer';
import config from './config';

import { CSVOutputData, CSVParseOptions } from './types';

const debug = debugFactory('enorme:csv');

export async function loadCSV(path): Promise<[any]> {
  const input = fs.readFileSync(path).toString('utf8');

  return new Promise((resolve, reject) => {
    parse(input, { delimiter: ',' }, (err, records) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(records);
    });
  });
}

function organizeRecords(
  records: [any],
  options: CSVParseOptions,
): CSVOutputData {
  const studentColumnOffset = 2;
  const headers = records[0];
  const category = headers[0];
  const students = headers.slice(studentColumnOffset, headers.length);
  const competencies = records.slice(1, records.length);

  const studentsParsed = students.map((student, index) => {
    // Pick images
    const studentCompetencies = competencies.filter(competency => {
      return competency[index + studentColumnOffset];
    });

    return {
      student,
      competencies: studentCompetencies.map(item => {
        return {
          imagePath:
            config.pdfImageURL + path.join('/images/competency', item[1]),
          title: item[0],
          date: item[index + studentColumnOffset],
        };
      }),
    };
  })

  return {
    students: studentsParsed.filter((student) => student.competencies.length > 0),
    category,
    headers,
  };
}

export async function organizeCSV(
  filePath: string,
  options: CSVParseOptions,
): Promise<CSVOutputData> {
  const records = await loadCSV(filePath);

  const pdfData = organizeRecords(records, options);
  return pdfData;
}
