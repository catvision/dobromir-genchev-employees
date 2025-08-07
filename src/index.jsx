import React from 'react';
import ReactDOM from 'react-dom/client';
import CsvUploader from './CsvUploader';

const App = () => (
  <div>
    <h1>Pair of employees who have worked together</h1>
    <CsvUploader />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
