// src/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';


import Header from './components/Header';
import Footer from './components/Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 text-center text-xl flex flex-col relative overflow-hidden">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
