import React, { useState } from 'react';
import { Form, DatePicker, Button, message } from 'antd';

const { RangePicker } = DatePicker;

export default function CSVForm({ onDownload, isUploading = false }) {
  const [uploadedFile, setUploadedFile] = useState(null);

  const onFinish = (values: any) => {
    console.log('Success:', values);
    console.log(uploadedFile);
    if (!uploadedFile) {
      message.warning("You have to select a csv file")
    }
    if (uploadedFile && onDownload) {
      onDownload({
        ...values,
        file: uploadedFile,
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const onFileSelected = e => {
    setUploadedFile(e.target.files[0]);
  };

  return (
    <div>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        target="_blank"
      >
        <Form.Item wrapperCol={{ offset: 2, span: 16 }} label="CSV File">
          <input type="file" onChange={onFileSelected} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isUploading}>
            Upload
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
