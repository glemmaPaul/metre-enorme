interface Config {
  pdfImageURL: string;
}

const port = process.env.PORT || 4000;

const config: Config = {
  pdfImageURL: `http://localhost:${port}`,
};

export default config;
