import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import fs from 'fs';
import Content from 'app/components/Content';
import CSVForm from 'app/components/CSVForm';
import PDFDownload from 'app/components/PDFDownload';

const baseURL = 'http://localhost:4000/';

export function HomePage() {
  const [csvData, setCSVData] = useState(null);
  const [isDownLoading, setIsDownloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  async function parseCSVInput(inputData) {
    setIsUploading(true)
    const formData = new FormData();
    console.log(inputData);
    formData.append('color', inputData.color);
    formData.append('file', inputData.file);
    const response = await axios.post(`${baseURL}api/parse/csv/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    setIsUploading(false)

    setCSVData(response.data);
  }

  async function downloadPDF({ color, year }) {
    setIsDownloading(true)
    const response = await axios.post(`${baseURL}api/generate/pdf`, {
      ...(csvData || {}),
      year,
      color,
    }, { responseType: 'blob' });
    setIsDownloading(false)

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'export-metre-enorme.pdf'); //or any other extension
    document.body.appendChild(link);
    link.click();
  }

  function resetFields() {
    setCSVData(null)
  }

  return (
    <>
      <Helmet>
        <title>Home Page</title>
        <meta name="description" content="A Boilerplate application homepage" />
      </Helmet>
      <Content>
        {!csvData && <CSVForm onDownload={parseCSVInput} />}
        {csvData && <PDFDownload onDownload={downloadPDF} onReset={resetFields} isDownloading={isDownLoading} />}
      </Content>
    </>
  );
}
