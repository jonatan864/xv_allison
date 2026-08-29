import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';
import './responsive.css';
import './guest-responsive.css';
import './legacy-ui.css';
import './scanner-alert.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
