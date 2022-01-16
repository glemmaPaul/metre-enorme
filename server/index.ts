import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import uploadConfiguration from './upload';
import { organizeCSV } from './csv';
import generatePDF from './pdf';

const app = express();
const apiRouter = express.Router();
const imageRouter = express.Router();
const competenciesPath = path.join(__dirname, '../', 'public/competencies/images')

// parse application/json
app.use(bodyParser.json())
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
    const pdfBuffer = await organizeCSV(req.file.path)

    return res.status(200).send(pdfBuffer);
  },
);


apiRouter.post('/generate/pdf', async (req, res) => {
  console.log(req.body)
  const pdf = await generatePDF(req.body)

  return res.status(200).send(pdf)
});

app.use('/api', apiRouter);
app.use('/images', imageRouter);

// Serve them build
app.use(express.static('build'));

app.listen(process.env.PORT || 4000);
