import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

declare global {
  var CSRF_TOKEN: string;
  var SESSION_ID: string;
  var AUTO_CLOSE: boolean;
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
