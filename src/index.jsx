import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './Components/App';
import 'bootstrap/dist/css/bootstrap.min.css'; // <--- pastikan ini juga ditambahkan
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
