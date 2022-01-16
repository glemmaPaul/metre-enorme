import mustache from 'mustache';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

import { PDFInputData } from './types';

const htmlFolder = path.join(__dirname, '../html');

export function generateHTML(pdfData: PDFInputData): string {
  const achievementsHTML = fs
    .readFileSync(path.join(htmlFolder, 'achievements.html'))
    .toString();

  const viewOptions = {
    ...pdfData,
    students: pdfData.students.map((student) => {
      return {
        ...student,
        category: pdfData.category,
        reportDate: '2021',
        year: pdfData.year,
      }
    }),
    color: pdfData.color,
   
  }

  return mustache.render(achievementsHTML, viewOptions);
}

var options = {
  format: 'A4',
  base: `file://${__dirname}/html/`,
  footer: { height: '30px' },
  header: { height: '50px' },
};

export default async function generatePDF(
  input: PDFInputData,
): Promise<Buffer> {
  const html = generateHTML(input);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'networkidle2'
  })

  const pdf = await page.pdf({ format: 'a4', printBackground: true });

  await browser.close();

  return pdf;
}
