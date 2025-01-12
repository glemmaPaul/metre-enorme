import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { message } from 'antd'
import Content from 'app/components/Content';
import CSVForm from 'app/components/CSVForm';
import PDFDownload from 'app/components/PDFDownload';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/';
const generatePDFLambda = process.env.REACT_APP_LAMBDA_URL || 'https://mi3xolp4ghx656xcieu24wfde40myzue.lambda-url.eu-west-3.on.aws/';

export function HomePage() {
  const [csvData, setCSVData] = useState(null) as any;
  const [isDownLoading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);



  async function parseCSVInput(inputData) {
    var reader = new FileReader();

    reader.onload = function (evt) {
      const result = evt.target?.result;

      if (!result) {
        message.error('Error reading file');
      }

      // Turn into base64
      const base64 = btoa(unescape(encodeURIComponent(result as string)));

      setCSVData({
        csv: base64,
        fileName: inputData.file.name,
      });

    }

    reader.readAsText(inputData.file, "UTF-8");
  }

  async function downloadPDF({ color, year, report_dates }) {
    setIsDownloading(true);

    // we expect momentjs dates
    const start_date = report_dates[0].startOf('month');
    const end_date = report_dates[1].endOf('month');

    

    let response: any = null;
    try {
      // Instead sent to lamba function
     response = await axios.post(
        generatePDFLambda,
        {
          "csv": csvData.csv,
          "year": year,
          "start_date": start_date.format('YYYY-MM-DD'),
          "end_date": end_date.format('YYYY-MM-DD'),
          "color": color,
        },
        { responseType: 'arraybuffer', },
      );
    } catch (error: any) {
      message.error('Error generating PDF' + error.message);
    }
    setIsDownloading(false);

    if (!response) {
      return;
    }


    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-metre-enorme.pdf`;
    
    // Append to body, click, and clean up
    document.body.appendChild(link);
    link.click();
    
    // Remove link and revoke blob URL to free memory
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  function resetFields() {
    setCSVData(null);
  }

  // useEffect(() => {
  //   // Execute lambda public endpoint to start the ec2 instance
  //   // https://t56gewwhm5scizjmyaneqpgc3u0gxrrh.lambda-url.eu-west-3.on.aws/
  //   message.info('Starting the backend');

  //   axios.get('https://t56gewwhm5scizjmyaneqpgc3u0gxrrh.lambda-url.eu-west-3.on.aws/').then((response) => {
  //     message.success('Backend started');
  //   }).catch((error) => {
  //     message.error('Error starting the backend');
  //   });
  // }, []);

  return (
    <>
      <Helmet>
        <title>Kanjer | PDF Download</title>
        <meta name="description" content="Upload for PDF download" />
      </Helmet>
      <Content>
        {!csvData && (
          <CSVForm onDownload={parseCSVInput} isUploading={isUploading} />
        )}
        {csvData && (
          <PDFDownload
            csvData={csvData}
            onDownload={downloadPDF}
            onReset={resetFields}
            isDownloading={isDownLoading}
          />
        )}
      </Content>
    </>
  );
}
