/**
 * Configuration for multipart upload handler
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { formatErrorResponse } from './utils';

const possibleFileTypes = [
  'text/x-comma-separated-values',
  'text/comma-separated-values',
  'application/octet-stream',
  'application/vnd.ms-excel',
  'application/x-csv',
  'text/x-csv',
  'text/csv',
  'application/csv',
  'application/excel',
  'application/vnd.msexcel',
  'text/plain',
];

/**
 * Makes sure to pass through only csv files
 */
const csvFilter = (req, file, cb) => {
  if (possibleFileTypes.some(fileType => file.mimetype.includes(fileType))) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only csv file.'), false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirPath = path.join(__dirname, '..', '.tmp');

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    cb(null, dirPath);
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, `${Date.now()}-csv-${file.originalname}`);
  },
});

const uploadFile = multer({ storage: storage, fileFilter: csvFilter });

export default uploadFile;
