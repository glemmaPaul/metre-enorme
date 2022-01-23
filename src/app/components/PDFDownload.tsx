import React, { useState } from 'react';
import { Form, Input, Button, AutoComplete, DatePicker } from 'antd';

const { RangePicker } = DatePicker;

function Swatch({ color }) {
  return (
    <div
      style={{
        border: '1px solid #000',
        backgroundColor: color,
        width: '60px',
        height: '30px',
      }}
    />
  );
}

const colorOptions = [
  {
    label: 'jaune - Activités physique',
    value: '#ffde18',
  },
  {
    label: 'vert - Explorer le monde',
    value: '#97c065',
  },
  {
    label: 'violet - Activités artistique',
    value: '#885ead',
  },
  {
    label: 'rose - Apprendre et vivre ensemble',
    value: '#fe78bb',
  },
  {
    label: 'rouge - Langage écrit et oral',
    value: '#fe0100',
  },
  {
    label: 'bleu - Structurer sa pensée',
    value: '#40caf3',
  },
];

export default function PDFDownload({
  onDownload,
  onReset,
  isDownloading = false,
}) {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
    onDownload(values);
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
        <Form.Item label="Color" required={true} name="color">
          <AutoComplete options={colorOptions} />
        </Form.Item>

        <Form.Item label="Color preview" shouldUpdate>
          {form => {
            return <Swatch color={form.getFieldValue('color')} />;
          }}
        </Form.Item>

        <Form.Item label="Class" required={true} name="year">
          <Input name="year" />
        </Form.Item>

        <Form.Item
          label="Reporting Date"
          rules={[{ required: true, message: 'Please input reporting range' }]}
          name="report_dates"
        >
          <RangePicker name="report_dates" picker="month" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={isDownloading}>
            Download
          </Button>
          <Button
            type="dashed"
            style={{ marginLeft: '10px' }}
            onClick={onReset}
          >
            Reset
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
