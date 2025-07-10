import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App'; // atau default jika di-export default
import './index.css'; // jika pakai TailwindCSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
