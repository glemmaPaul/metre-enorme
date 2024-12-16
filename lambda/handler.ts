
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { parse } from 'csv-parse/sync';
import Mustache from 'mustache';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { parse as parseDate, format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';

import achievementsHTML from "./achievements.html"
import kgJuneBug from "./KGJuneBug.ttf"

interface Competency {
  title: string;
  date: string;
  imagePath: string;
}

interface Student {
  student: string;
  competencies: Competency[];
}

interface CSVOutputData {
  category: string;
  students: Student[];
  headers: string[];
}

interface PDFInputData extends CSVOutputData {
  year: string;
  color: string;
  startDate: Date;
  endDate: Date;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No input provided' }),
      };
    }

    // Expecting JSON body with:
    // {
    //   "csv": "<base64 encoded csv>",
    //   "start_date": "YYYY-MM-DD",
    //   "end_date": "YYYY-MM-DD",
    //   "year": "2020-2021",
    //   "color": "#000"
    // }
    const body = JSON.parse(event.body);
    if (!body.csv) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No CSV provided in request body' }),
      };
    }

    const csvData = Buffer.from(body.csv, 'base64').toString('utf-8');
    const records: string[][] = parse(csvData, { delimiter: ',' });

    const pdfData = organizeCSV(records);

    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    const year = body.year || '2020-2021';
    const color = body.color || '#000';

    const html = generateHTML({
      ...pdfData,
      startDate,
      endDate,
      year,
      color,
    });

    const preview = body.preview || false;

    if (preview) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html,
      };
    }

    const pdfBuffer = await generatePDF(html);

    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/pdf' },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

function organizeCSV(records: string[][]): CSVOutputData {
  const studentColumnOffset = 2;
  const headers = records[0];
  const category = headers[0];
  const students = headers.slice(studentColumnOffset);
  const competencies = records.slice(1);

  const studentsParsed = students.map((student, index) => {
    const studentCompetencies = competencies.filter(comp => comp[index + studentColumnOffset]);
    return {
      student,
      competencies: studentCompetencies.map(item => ({
        title: item[0],
        imagePath: 'https://kanjer-competency-assets.s3.eu-west-3.amazonaws.com/images/' + item[1], // Adjust or host images externally
        date: item[index + studentColumnOffset],
      })),
    };
  });

  const filteredStudents = studentsParsed.filter(s => s.competencies.length > 0);

  return {
    category,
    students: filteredStudents,
    headers,
  };
}

function generateHTML(pdfData: PDFInputData) {
  const template = achievementsHTML;

  const dateFormat = 'MM/yyyy';
  const reportDate = formatDate(pdfData.endDate, 'MMMM yyyy', { locale: fr });

  // Filter competencies by date range
  const filteredStudents = pdfData.students.reduce((aggr, student) => {
    const filteredCompetencies = student.competencies.filter(competency => {
      if (!competency.date) return false;
      const parsedDate = parseDate(competency.date, dateFormat, new Date());
      return parsedDate > pdfData.startDate && parsedDate < pdfData.endDate;
    });

    if (filteredCompetencies.length > 0) {
      aggr.push({
        ...student,
        competencies: filteredCompetencies,
        category: pdfData.category,
        reportDate,
        year: pdfData.year,
      });
    }

    return aggr;
  }, [] as Student[]);

  if (filteredStudents.length === 0) {
    throw new Error('No student competencies found for Reporting Dates');
  }

  const view = {
    ...pdfData,
    customFont: Buffer.from(kgJuneBug).toString('base64'),
    students: filteredStudents,
  };

  return Mustache.render(template, view);
}

async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: [...chromium.args, '--no-sandbox', '--disable-web-security'],
    executablePath: await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin'),
    defaultViewport: chromium.defaultViewport,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle2' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return Buffer.from(pdf);
}