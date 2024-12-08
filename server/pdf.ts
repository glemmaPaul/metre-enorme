// @ts-nocheck

import mustache from 'mustache';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { parse as parseDate, format as formatDate } from 'date-fns';
import { fr } from 'date-fns/locale';

import { PDFInputData } from './types';

const rootDir = process.env.ROOT_DIR || __dirname;

const htmlFolder = path.join(rootDir, 'html');

const dateFormat = 'MM/yyyy';

export function generateHTML(pdfData: PDFInputData): string {
  const achievementsHTML = fs
    .readFileSync(path.join(htmlFolder, 'achievements.html'))
    .toString();

  const reportDate = formatDate(pdfData.endDate, 'MMMM yyyy', { locale: fr });

  const filteredStudents = pdfData.students.reduce((aggr, student) => {
    const filteredCompetencies = student.competencies.filter(competency => {
      if (!competency.date) {
        return false;
      }
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
  }, []);

  if (filteredStudents.length === 0) {
    throw new Error('No student competencies found for Reporting Dates');
  }

  const viewOptions = {
    ...pdfData,
    students: filteredStudents,
    color: pdfData.color,
  };

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
  
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: 'networkidle2',
  });

  await page.evaluateHandle('document.fonts.ready');

  const pdf = await page.pdf({ format: 'a4', printBackground: true });

  await browser.close();

  // Save for debug
  fs.writeFileSync('test.pdf', pdf);

  return pdf;
}
