import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import fs from 'fs';
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
    const response = await axios.post(`${baseURL}api/parse/csv/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setIsUploading(false);

    setCSVData(response.data);
  }

  async function downloadPDF({ color, year, report_dates }) {
    setIsDownloading(true);

    // we expect momentjs dates
    const start_date = report_dates[0].startOf('month')
    const end_date = report_dates[1].endOf('month')
    const response = await axios.post(
      `${baseURL}api/generate/pdf`,
      {
        ...(csvData || {}),
        year,
        color,
        start_date,
        end_date,
      },
      { responseType: 'blob' },
    );
    setIsDownloading(false);

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export-metre-enorme.pdf'); //or any other extension
    document.body.appendChild(link);
    link.click();
  }

  function resetFields() {
    setCSVData(null);
  }

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
            onDownload={downloadPDF}
            onReset={resetFields}
            isDownloading={isDownLoading}
          />
        )}
      </Content>
    </>
  );
}
