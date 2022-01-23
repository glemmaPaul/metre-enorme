/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import { GlobalStyle } from 'styles/global-styles';

import { HomePage } from './pages/HomePage/Loadable';
import { NotFoundPage } from './components/NotFoundPage/Loadable';
import { useTranslation } from 'react-i18next';

import { Layout, Menu, Space } from 'antd';

const { Header, Footer } = Layout;

export function App() {
  const { i18n } = useTranslation();
  return (
    <BrowserRouter>
      <Layout className="layout" style={{height:"100vh"}}>
        <Header>
          <div className="logo" />
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
            <Menu.Item key="home">Home</Menu.Item>
          </Menu>
        </Header>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route component={NotFoundPage} />
        </Switch>
        <Footer style={{ textAlign: 'center' }}>Kanjer</Footer>
      </Layout>
      <Helmet
        titleTemplate="%s - React Boilerplate"
        defaultTitle="React Boilerplate"
        htmlAttributes={{ lang: i18n.language }}
      >
        <meta name="description" content="A React Boilerplate application" />
      </Helmet>

      
      <GlobalStyle />
    </BrowserRouter>
  );
}
