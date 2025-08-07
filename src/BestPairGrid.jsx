import React from 'react';

const BestPairGrid = ({ bestPair }) => {
    return (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
                <tr>
                    <th>Employee ID #1</th>
                    <th>Employee ID #2</th>
                    <th>Project ID</th>
                    <th>Days Worked Together</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{bestPair.empIdOne ?? 'N/A'}</td>
                    <td>{bestPair.empIdTwo ?? 'N/A'}</td>
                    <td>{bestPair.projectId ?? 'N/A'}</td>
                    <td>{bestPair.days}</td>
                </tr>
            </tbody>
        </table>
    );
};

export default BestPairGrid;