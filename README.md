# React CSV Uploader

A simple React app that allows users to upload a CSV file, validate the contents, and find the best pair of employees who worked together on the same project.

## 📦 Features

- Upload and parse CSV files
- Supports multiple date formats
- Validates CSV structure and content
- Calculates best pair of employees based on overlapping work periods
- Logs any invalid rows

## 🛠️ Installation

Make sure you have **Node.js** and **npm** installed.

### 1. Clone the repository

```bash
git clone https://github.com/catvision/dobromir-genchev-employees.git
cd react-csv-uploader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Then open your browser at [http://localhost:3000](http://localhost:3000).

---

## 📁 File Format

The CSV file must follow this structure:

```
EmpID, ProjectID, DateFrom, DateTo
143, 12, 2013-11-01, 2014-01-05
218, 10, 2012-05-16, NULL
```

- `DateTo` can be `NULL` (treated as today)
- Supported date formats: `YYYY-MM-DD`, `MM/DD/YYYY`, `DD-MM-YYYY`, `DD.MM.YYYY`

---

## 🚀 Build for Production

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.
