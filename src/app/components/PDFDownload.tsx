
import React, {useState} from 'react';
import { Form, Input, Button, Checkbox } from 'antd';

export default function PDFDownload({
  onDownload,
  onReset,
  isDownloading = false,
}) {

  const onFinish = (values: any) => {
    console.log('Success:', values);
    onDownload(values)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
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

        <Form.Item
          label="Color"
          required={true}
          name="color"
        >
          <Input name="color" />
        </Form.Item>

        <Form.Item
          label="Year"
          required={true}
          name="year"
        >
          <Input name="year" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isDownloading}>
            Download
          </Button>
          <Button type="dashed" style={{ marginLeft: '10px' }} onClick={onReset}>Reset</Button>
        </Form.Item>
      </Form>
    </div>
  );
};
