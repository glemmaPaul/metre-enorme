import React from 'react';
import { Layout } from 'antd';

const { Content } = Layout;

export default function EnormeContent({ children }) {
  return <Content style={{ padding: '50px' }}>{children}</Content>;
}
