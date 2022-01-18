interface Config {
  pdfImageURL: string;
}

const port = process.env.PORT || 4000;
const serverURL = process.env.HOST || 'localhost';

const config: Config = {
  pdfImageURL: `http://${serverURL}:${port}`,
};

export default config;
