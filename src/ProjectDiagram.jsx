import React, { useState, useRef, useEffect } from 'react';

const ProjectDiagram = ({ ds, showProjectId }) => {
    const canvasRef = useRef(null);

    // Get screen width and height
    const scrWidth = typeof window !== 'undefined' ? document.body.getBoundingClientRect().width : 800;


    const ctxLeftMargin = Math.floor(scrWidth * 0.1);
    const ctxTopMargin = 100;
    const rowPerPixel = 30;
    let dayPerPixel = 0; //pixels per day
    let firstDayDt = 0; //first day in seconds
    let lastDayDt = 0; //last day in seconds
    //ordinate position of specific employee
    let emplCoordinateY = {};
    //unique color per empl
    let emplColors = {};

   

    const getColor = (index) => {
        const hue = (index * 137.508) % 360;
        return `hsl(${hue}, 70%, 50%)`;
    };

    const getMinMaxDt = (ds) => {
        const emplIds = Object.keys(ds);
        let minDt = Infinity;
        let maxDt = -Infinity;

        for (let i = 0; i < emplIds.length; i++) {
            const empId = emplIds[i];
            emplCoordinateY[empId] = ctxTopMargin + i * rowPerPixel;
            emplColors[empId] = getColor(i);

            const times = ds[empId];
            for (let k = 0; k < times.length; k++) {
                const time = times[k];
                if (time.dateFrom < minDt) minDt = time.dateFrom;
                if (time.dateTo > maxDt) maxDt = time.dateTo;
            }
        }

        return { minDt, maxDt };
    };

    const drawSelfWork = (ds) => {
        const emplIds = Object.keys(ds);
        const ctx = canvasRef.current.getContext('2d');

        for (let i = 0; i < emplIds.length; i++) {
            const empId = emplIds[i];
            const times = ds[empId];
            ctx.fillStyle = emplColors[empId];
            for (let k = 0; k < times.length; k++) {
                let x = ctxLeftMargin + Math.ceil((times[k].dateFrom - firstDayDt) / (24 * 60 * 60)) * dayPerPixel;
                let y = emplCoordinateY[empId];
                let width = Math.ceil((times[k].dateTo - times[k].dateFrom) / (24 * 60 * 60)) * dayPerPixel;
                ctx.fillRect(x, y, width, rowPerPixel - 2);
            }
        }


    };

    const drawLegend = (ds) => {
        const emplIds = Object.keys(ds);
        const ctx = canvasRef.current.getContext('2d');

        ctx.font = '18px Arial';
        //try to ajust font size to fit left margin
        let marW = ctx.measureText('Employee ID #999').width;
        while (ctxLeftMargin < marW) {
            ctx.font = parseInt(ctx.font) - 1 + 'px Arial';
            marW = ctx.measureText('Employee ID #999').width;
        }

        for (let i = 0; i < emplIds.length; i++) {
            const empId = emplIds[i];
            ctx.fillStyle = emplColors[empId];
            let x = 0;
            let y = emplCoordinateY[empId];
            ctx.fillText('Employee ID #' + empId, x + 5, y + rowPerPixel / 2);
        }

        ctx.font = '10px Arial';
        ctx.fillStyle = '#ffe2e2ff';
        const totalDays = Math.ceil((lastDayDt - firstDayDt) / (24 * 60 * 60));
        const cellW = ctx.measureText('12.12.2025').width;
        // lets try to display half of all possible labels
        const step = Math.ceil(totalDays / (scrWidth / cellW / 2));
        for (let i = 0; i <= totalDays; i += step) {
            const x = ctxLeftMargin + i * dayPerPixel;
            const date = new Date(firstDayDt * 1000 + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            ctx.fillText(dateStr, x, ctxTopMargin - 5);
        }


    };

    const drawOverlaps = (ds) => {

        const empIds = Object.keys(ds);
         let overlapsMap = {};
        //Prepare map of overlaps
        for (let i = 0; i < empIds.length; i++) {
            for (let j = i + 1; j < empIds.length; j++) {
                const empIdOne = empIds[i];
                const empIdTwo = empIds[j];

                const timesOneInd = Object.keys(ds[empIdOne]);
                const timesTwoInd = Object.keys(ds[empIdTwo]);

                for (let t1 = 0; t1 < timesOneInd.length; t1++) {
                    for (let t2 = 0; t2 < timesTwoInd.length; t2++) {

                        const dateFromOne = ds[empIdOne][t1].dateFrom;
                        const dateToOne = ds[empIdOne][t1].dateTo;
                        const dateFromTwo = ds[empIdTwo][t2].dateFrom;
                        const dateToTwo = ds[empIdTwo][t2].dateTo;

                        const overlapStart = Math.max(dateFromOne, dateFromTwo);
                        const overlapEnd = Math.min(dateToOne, dateToTwo);
                        const daysOverlap = Math.max(0, overlapEnd - overlapStart);
                        if (daysOverlap <= 0) continue;

                        if (!overlapsMap[empIdOne]) {
                            overlapsMap[empIdOne] = [];
                        }
                        if (!overlapsMap[empIdTwo]) {
                            overlapsMap[empIdTwo] = [];
                        }
                        overlapsMap[empIdOne].push({
                            start: overlapStart,
                            end: overlapEnd,
                            color: emplColors[empIdTwo]
                        });
                        overlapsMap[empIdTwo].push({
                            start: overlapStart,
                            end: overlapEnd,
                            color: emplColors[empIdOne]
                        });

                    }
                }
            }
        }
        //Draw overlaps
        const ctx = canvasRef.current.getContext('2d');
        for (let e = 0; e < empIds.length; e++) {
            const empId = empIds[e];
            const overlaps = overlapsMap[empId];

            if (!overlaps || overlaps.length === 0) continue;

            const ovrH =Math.min(6, Math.ceil((rowPerPixel / 2) / overlaps.length));
            ctx.lineWidth = 1;  
            for (let i = 0; i < overlaps.length; i++) {
                const overlap = overlaps[i];
                const x = ctxLeftMargin + Math.ceil((overlap.start - firstDayDt) / (24 * 60 * 60)) * dayPerPixel;
                const width = Math.ceil((overlap.end - overlap.start) / (24 * 60 * 60)) * dayPerPixel;
                const y = emplCoordinateY[empId] + (rowPerPixel / 2) + (ovrH * i)-5; //offset down
                ctx.fillStyle = "#222222ff";
                ctx.fillRect(x, y, width, ovrH);
                ctx.strokeStyle = overlap.color;
                ctx.strokeRect(x, y, width, ovrH); // draw a small rectangle for overlap
            }
        }


    }

    const showDiagram = (prjKey) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        console.log('Show diagram for project:', prjKey);
        const projectData = ds[prjKey];
        if (!projectData) {
            console.error('No data found for project:', prjKey);
            return;
        }
        ctx.clearRect(0, 0, scrWidth, 600);
        ctx.fillStyle = '#0d0b0bff';
        ctx.fillRect(0, 0, scrWidth, 600);
        emplCoordinateY = {};
        emplColors = {};
        //calculate units 
        const { minDt, maxDt } = getMinMaxDt(projectData);
        const totalDays = Math.ceil((maxDt - minDt) / (24 * 60 * 60));
        dayPerPixel = (scrWidth - ctxLeftMargin) / totalDays;
        console.log(`Total days: ${totalDays}, Day per pixel: ${dayPerPixel}`);
        firstDayDt = minDt;
        lastDayDt = maxDt;
        drawLegend(projectData);
        drawSelfWork(projectData);
        drawOverlaps(projectData);
    };

    const keys = Object.keys(ds);

    useEffect(() => {
        showDiagram(showProjectId);
        // eslint-disable-next-line
    }, [showProjectId, ds]);

    return (
        <div>
            <h2>Project Diagram</h2>

            <div>
                {keys.map((key) => (
                    <button
                        key={key}
                        onClick={() => showDiagram(key)}
                        style={{ margin: '5px' }}
                    >
                        {key}
                    </button>
                ))}
            </div>

            <canvas ref={canvasRef} width={scrWidth} height={600} />

        </div>

    );
};

export default ProjectDiagram;