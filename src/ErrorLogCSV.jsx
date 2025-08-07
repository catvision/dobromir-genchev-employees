import React from 'react';
import styles from './ErrorLogCSV.module.css'; // Make sure this file exists in the same folder and is named exactly 'ErrorLogCSV.module.css'

export default function ErrorLogCSV({ errors }) {
  if (errors.length === 0) return null;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Parse Errors</h2>
      <ul className={styles.list}>
        {errors.map((err, idx) => (
          <li key={idx}>
            <strong>Row {err.rowIndex}:</strong> {err.reason}
            <code className={styles.code}>{err.rowText}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
