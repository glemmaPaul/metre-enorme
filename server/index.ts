// @ts-nocheck

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { formatErrorResponse } from './utils'
import uploadConfiguration from './upload';
import { organizeCSV } from './csv';
import generatePDF from './pdf';

const app = express();
const apiRouter = express.Router();
const imageRouter = express.Router();

const rootDir = process.env.ROOT_DIR || __dirname;

const competenciesPath = path.join(rootDir, '/competencies/images')
const fontsPath = path.join(rootDir, '/fonts')
const port = process.env.PORT || 4000

console.log('Competencies Path', competenciesPath)

// parse application/json
app.use(bodyParser.json({ limit: '1mb' }))
app.use(cors());



function errorResponse(message) {
  return { type: 'error', message };
}

imageRouter.get('/competency/:image', bodyParser.urlencoded({ extended: true }), (req, res) => {
  const filePath = path.join(competenciesPath, req.params.image)
  if (!fs.existsSync(filePath)) {
    return res.status(404).send()
  }

  return res.sendFile(filePath)
});

apiRouter.post(
  '/parse/csv',
  uploadConfiguration.single('file'),
  async (req, res) => {
    // @ts-ignore
    if (!req.file) {
      return res.status(400).send(errorResponse('No Files uploaded'));
    }

    // @ts-ignore
    try {
      const pdfBuffer = await organizeCSV(req.file.path)
      return res.status(200).send(pdfBuffer);
    } catch (e) {
      return res.status(400).send(formatErrorResponse(e))
    }
  },
);


apiRouter.post('/generate/pdf', async (req, res) => {
  const startDate = new Date(req.body.start_date)
  const endDate = new Date(req.body.end_date)
  let pdf = null
  try {
    pdf = await generatePDF({
      ...req.body,
      startDate,
      endDate,
    })

    const pdfBuffer = Buffer.from(pdf)

    // Set proper headers for PDF download
    res.set({ 'Content-Type': 'application/pdf' });
    res.send(pdfBuffer)

  } catch (e) {
    return res.status(400).send(formatErrorResponse(e))
  }

  
});

app.use('/api', apiRouter);
app.use('/images', imageRouter);

app.use('/fonts', express.static(fontsPath))

// Serve them build
app.use(express.static('build'));

// SHow better error
app.use((err, req, res, next) => {
  res.status(500)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(formatErrorResponse(err)))
})

app.listen(port, function() {
  console.log(`App listening at Port ${port}`)
});
