/**
 * Configuration for multipart upload handler
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Makes sure to pass through only csv files
 */
const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes('csv')) {
    cb(null, true);
  } else {
    cb('Please upload only csv file.', false);
  }
};

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dirPath = path.join(__dirname, '..', '.tmp')

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
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
