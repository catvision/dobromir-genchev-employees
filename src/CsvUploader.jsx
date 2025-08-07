import React, { useState, useRef } from 'react';
import ErrorLogCSV from './ErrorLogCSV';
import BestPairGrid from './BestPairGrid';
import ProjectDiagram from './ProjectDiagram';
import styles from './CsvUploader.module.css'; 

const CsvUploader = () => {

    const dsProjects = {};
    const [bestPair, setBestPair] = useState({ empIdOne: null, empIdTwo: null, projectId: null, days: 0 });
    const [parseErrors, setParseErrors] = useState([]);
    const [showDiagram, setShowDiagram] = useState(false);
    const dsDiagram = useRef({})

    const parseCsvRow = (rowText, rowIndex) => {
        const parts = rowText.split(',');
        if (parts.length !== 4) {
            setParseErrors(prev => [...prev, { rowIndex, reason: 'incorrect number of columns', rowText }]);
            return null;
        }

        const [empIdRaw, projectIdRaw, dateFromRaw, dateToRaw] = parts.map(p => p.trim());
        const empId = Number(empIdRaw);
        const projectId = Number(projectIdRaw);
        const dateFrom = parseDateToTimestamp(dateFromRaw);
        const dateTo = parseDateToTimestamp(dateToRaw);

        const isValid = !isNaN(empId) && !isNaN(projectId) && !isNaN(dateFrom) && !isNaN(dateTo);
        if (!isValid) {
            if (rowIndex > 0) // Skip header row
                setParseErrors(prev => [...prev, { rowIndex, reason: 'Invalid data types', rowText }]);
            return null;
        }

        if (dateTo < dateFrom) {
            setParseErrors(prev => [...prev, { rowIndex, reason: 'dateTo is before dateFrom', rowText }]);
            return null;
        }

        // Store in dsProjects
        if (!dsProjects[projectId]) {
            dsProjects[projectId] = {};
        }

        if (!dsProjects[projectId][empId]) {
            dsProjects[projectId][empId] = [];
        }

        dsProjects[projectId][empId].push({
            dateFrom: dateFrom,
            dateTo: dateTo
        });


    };

    const parseDateToTimestamp = (dateStr) => {
        if (dateStr == 'NULL' || dateStr === 'null' || dateStr === '') {
            return Math.floor(Date.now() / 1000); // current time in seconds
        }

        if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
            // never do this return new Date(dateStr).getTime();
            const [year, month, day] = dateStr.split('-');
            return Math.floor(new Date(year, month - 1, day).getTime() / 1000); // convert to seconds
        }

        if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
            const [month, day, year] = dateStr.split('/');
            return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
        }

        if (/\d{2}-\d{2}-\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
        }

        if (/\d{2}\.\d{2}\.\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('.');
            return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
        }

        return NaN; // unknown format
    }

    const calculateBestPair = () => {
        let maxDays = 0;
        let curBestPair = { empIdOne: null, empIdTwo: null, projectId: null, days: 0 };


        for (const projectId in dsProjects) {
            const employees = dsProjects[projectId];
            const empIds = Object.keys(employees);
            let curProjectOverlaps = [];

            for (let i = 0; i < empIds.length; i++) {
                for (let j = i + 1; j < empIds.length; j++) {
                    const empIdOne = empIds[i];
                    const empIdTwo = empIds[j];

                    const timesOneInd = Object.keys(employees[empIdOne]);
                    const timesTwoInd = Object.keys(employees[empIdTwo]);

                    for (let t1 = 0; t1 < timesOneInd.length; t1++) {
                        for (let t2 = 0; t2 < timesTwoInd.length; t2++) {

                            const dateFromOne = employees[empIdOne][t1].dateFrom;
                            const dateToOne = employees[empIdOne][t1].dateTo;
                            const dateFromTwo = employees[empIdTwo][t2].dateFrom;
                            const dateToTwo = employees[empIdTwo][t2].dateTo;

                            const overlapStart = Math.max(dateFromOne, dateFromTwo);
                            const overlapEnd = Math.min(dateToOne, dateToTwo);
                            const daysOverlap = Math.max(0, overlapEnd - overlapStart);

                            //add a pair or increment existing paircur
                            if (daysOverlap > 0) {

                                curProjectOverlaps[empIdOne + "_" + empIdTwo] =
                                    (curProjectOverlaps[empIdOne + "_" + empIdTwo] || 0) + Math.ceil(daysOverlap / (24 * 60 * 60)); // convert seconds to days

                                const totalOverlap = curProjectOverlaps[empIdOne + "_" + empIdTwo];
                                if (totalOverlap > maxDays) {
                                    maxDays = totalOverlap;
                                    curBestPair = { empIdOne, empIdTwo, projectId, days: totalOverlap };
                                    console.log(`New best pair found: ${empIdOne} & ${empIdTwo} on project ${projectId} with ${totalOverlap} days overlap`);
                                }
                            }
                        }
                    }
                }
            }
            console.log(projectId, '=>', curProjectOverlaps);
        }

        setBestPair(curBestPair);
        dsDiagram.current = dsProjects; // Store the projects data for diagram
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.trim().split('\n');

            setParseErrors([]); // Reset errors
            lines
                .map((row, index) => parseCsvRow(row, index))
                .filter(row => row !== null);

            // setCsvData(rows); //debug raw file if need to
            console.log("Parsed dsProjects:", dsProjects);
            calculateBestPair();
            console.log("Best Pair:", bestPair);
        };

        reader.readAsText(file);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Upload CSV</h2>

            <div className={styles.fileInputWrapper}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                />
            </div>

            {parseErrors.length > 0 && (
                <div className={styles.section}>
                    <ErrorLogCSV errors={parseErrors} />
                </div>
            )}

            {bestPair.empIdOne && (
                <div className={styles.section}>
                    <BestPairGrid bestPair={bestPair} />
                </div>
            )}

            {bestPair.empIdOne && (
                <button className={styles.button} onClick={() => setShowDiagram(true)}>
                    Show Projects Diagram
                </button>
            )}

            {showDiagram && (
                <div className={styles.diagramWrapper}>
                    <ProjectDiagram ds={dsDiagram.current} showProjectId={bestPair.projectId} />
                </div>
            )}
        </div>
    );

};

export default CsvUploader;
