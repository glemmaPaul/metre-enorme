import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import debugFactory from 'debug';
import { generateHTML } from './pdf';
import puppeteer from 'puppeteer';
import config from './config'

import { CSVOutputData, PDFInputData } from './types';

const debug = debugFactory('enorme:csv');

const dateFormat = 'MM/YYYY';

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

async function parseRecords(records, start, end, viewOptions) {
  const headers = records[0];
  const category = headers[0];
  const students = headers.slice(2, headers.length);

  // Slice off top
  const competencies = records.slice(1, records.length);

  students.map((student, index) => {
    debug(
      `Generating PDF for ${student}, from ${start.format(
        'MM/YYYY',
      )} to ${end.format('MM/YYYY')}`,
    );

    // Pick images
    const studentCompetencies = competencies.filter(competency => {
      const competencyDate = moment(competency[index + 2], dateFormat);

      return start <= competencyDate && end >= competencyDate;
    });

    const images = studentCompetencies.map(item => `./images/${item[1]}`);

    // Validate of all images are existent
    images.forEach(image => {
      if (fs.existsSync(image) === false) {
        console.error(
          `Error in generating for "${student}", cannot retrieve "${image}", does not exist`,
        );
      }
    });

    const duplicates = students
      .slice(0, index)
      .reduce((number, otherStudent) => {
        if (student === otherStudent) {
          return number + 1;
        }

        return number;
      }, 0);

    let filename = `${student}`;

    if (duplicates > 0) {
      filename = `${filename}-(${duplicates})`;
    }

    generatePDF(`./output/${filename}.pdf`, {
      studentName: student,
      year: 'SP',
      category: category,
      reportDate: moment(end).format('MMMM YYYY'),
      images,
      ...viewOptions,
    });
  });
}

function organizeRecords(
  records: [any],
  startDate = null,
  endDate = null,
): CSVOutputData {
  const studentColumnOffset = 2;
  const headers = records[0];
  const category = headers[0];
  const students = headers.slice(studentColumnOffset, headers.length);
  const competencies = records.slice(1, records.length);

  return {
    students: students.map((student, index) => {
      // Pick images
      const studentCompetencies = competencies.filter(competency => {
        return competency[index + studentColumnOffset];
      });

      return {
        student,
        competencies: studentCompetencies.map(item => ({
          imagePath: config.serverURL + path.join('/images/competency', item[1]),
          title: item[0],
          date: item[index + studentColumnOffset],
        })),
      };
    }),
    category,
    headers,
  };
}

function HTML2PDF(html: string) {}

export async function organizeCSV(filePath: string): Promise<PDFInputData> {
  const records = await loadCSV(filePath);

  const pdfData = organizeRecords(records);
  return pdfData;
}

export default async function generatePDF(
  input: PDFInputData
): Promise<Buffer> {
  const html = generateHTML(input);
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://google.com', { waitUntil: ['domcontentloaded', 'networkidle0', 'load']})
  console.log(html);
  const pdf = await page.pdf({
    format: 'letter',
    printBackground: true,
    margin: {
      top: '20px',
      bottom: '20px',
      right: '20px',
      left: '20px',
    },
  });

  await browser.close();
  return pdf;
}
