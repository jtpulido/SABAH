import { Outlet } from 'react-router-dom';
import Footer from '../pages/pie_de_pagina/Footer';

const Layout = () => {
  return (
    <div className="container">
      <Outlet style={{ flex: 1 }} />
      <Footer className="Footer" />
    </div>
  );
};

export default Layout;
