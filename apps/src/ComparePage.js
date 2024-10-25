import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { CategoryScale } from 'chart.js';
import Chart from 'chart.js/auto';

Chart.register(CategoryScale); // Register the Category scale

const ComparePage = () => {
  const [userCode, setUserCode] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const { codeTitle } = useParams();
  const navigate = useNavigate();

  const handleCompare = async () => {
    try {
      const response = await fetch('http://localhost:12345/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeTitle, userCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setCompareResult(data); // 서버에서 받은 비교 결과 설정
      } else {
        console.error('Error comparing codes:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 비율 계산 함수
  const calculatePercentage = (newValue, oldValue) => {
    if (oldValue === 0) return 'N/A'; // 0으로 나누는 경우 처리
    const percentageChange = ((newValue - oldValue) / oldValue) * 100;
    return `${percentageChange.toFixed(2)}%`;
  };

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const emissionsData = {
    labels: ['Stored Emissions', 'User Emissions'],
    datasets: [
      {
        label: 'Emissions (kg CO₂)',
        data: compareResult
          ? [compareResult.storedRecord.emissionsData.emissions, compareResult.userEmissionsData.emissions]
          : [0, 0],
        backgroundColor: ['#4CAF50', '#f44336'],
      },
    ],
  };

  const cpuEnergyData = {
    labels: ['Stored CPU Energy', 'User CPU Energy'],
    datasets: [
      {
        label: 'CPU Energy (J)',
        data: compareResult
          ? [compareResult.storedRecord.emissionsData.cpu_energy, compareResult.userEmissionsData.cpu_energy]
          : [0, 0],
        backgroundColor: ['#4CAF50', '#f44336'],
      },
    ],
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPane}>
        <h2>Compare Your Code</h2>
        <textarea
          style={styles.codeInput}
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          placeholder="Enter your Python code here..."
        />
        <div style={styles.buttonContainer}>
          <button style={styles.backButton} onClick={handleBack}>
            Back
          </button>
          <button style={styles.compareButton} onClick={handleCompare}>
            Compare
          </button>
        </div>
      </div>
      <div style={styles.rightPane}>
        <h2>Comparison Result</h2>
        {compareResult ? (
          <div style={styles.resultContainer}>
            <p><strong>Carbon Emission Difference:</strong> {compareResult.emissionDifference} kg CO₂</p>
            <p><strong>CPU Energy Difference:</strong> {compareResult.cpuEnergyDifference} J</p>
            <p><strong>Carbon Emission Improvement (%) :</strong> {calculatePercentage(compareResult.userEmissionsData.emissions, compareResult.storedRecord.emissionsData.emissions)}</p>
            <p><strong>CPU Energy Improvement (%) :</strong> {calculatePercentage(compareResult.userEmissionsData.cpu_energy, compareResult.storedRecord.emissionsData.cpu_energy)}</p>
            <div style={styles.chartContainer}>
              <Bar data={emissionsData} />
            </div>
            <div style={styles.chartContainer}>
              <Bar data={cpuEnergyData} />
            </div>
          </div>
        ) : (
          <p>No comparison data available yet.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    padding: '20px',
    backgroundColor: '#f0f0f0',
  },
  leftPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginRight: '20px',
  },
  rightPane: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto', // Add scrolling if the content is too large
  },
  codeInput: {
    flex: 1,
    fontSize: '16px',
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    outline: 'none',
    marginBottom: '20px',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  compareButton: {
    padding: '12px 25px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  backButton: {
    padding: '12px 25px',
    fontSize: '16px',
    backgroundColor: '#4CAF50', // Compare 버튼과 동일한 색상으로 설정
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  resultContainer: {
    marginTop: '20px',
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
  },
  chartContainer: {
    marginTop: '20px',
    height: '300px', // Adjust the chart size
  },
};

export default ComparePage;
