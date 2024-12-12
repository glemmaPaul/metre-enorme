import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { message } from 'antd'
import Content from 'app/components/Content';
import CSVForm from 'app/components/CSVForm';
import PDFDownload from 'app/components/PDFDownload';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/';

export function HomePage() {
  const [csvData, setCSVData] = useState(null);
  const [isDownLoading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);



  async function parseCSVInput(inputData) {
    setIsUploading(true);
    const formData = new FormData();

    formData.append('file', inputData.file);
    const response = await axios
      .post(`${baseURL}api/parse/csv/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .catch(error => {
        return error.response;
      });

    setIsUploading(false);

    if (response.data.type === 'error') {
      message.error(response.data.message)
    } else {
      setCSVData(response.data);
    }
  }

  async function downloadPDF({ color, year, report_dates }) {
    setIsDownloading(true);

    // we expect momentjs dates
    const start_date = report_dates[0].startOf('month');
    const end_date = report_dates[1].endOf('month');
    let response: any = null;
    try {
      response = await axios.post(
        `${baseURL}api/generate/pdf`,
        {
          ...(csvData || {}),
          year,
          color,
          start_date,
          end_date,
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

    // Create blob URL safely
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

  useEffect(() => {
    // Execute lambda public endpoint to start the ec2 instance
    // https://t56gewwhm5scizjmyaneqpgc3u0gxrrh.lambda-url.eu-west-3.on.aws/
    message.info('Starting the backend');

    axios.get('https://t56gewwhm5scizjmyaneqpgc3u0gxrrh.lambda-url.eu-west-3.on.aws/').then((response) => {
      message.success('Backend started');
    }).catch((error) => {
      message.error('Error starting the backend');
    });
  }, []);

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
