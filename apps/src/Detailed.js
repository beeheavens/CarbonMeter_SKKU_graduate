import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Detailed = () => {
  const [record, setRecord] = useState(null);
  const { codeTitle } = useParams(); // URL에서 codeTitle 가져오기
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch('http://localhost:12345/getRecordByCodeTitle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ codeTitle }), // 서버로 codeTitle 전달
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecord(data); // 가져온 데이터 설정
        } else {
          console.error('Failed to fetch record');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchRecord();
  }, [codeTitle]);

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleCompare = () => {
    navigate(`/compare/${codeTitle}`); // 비교 페이지로 이동
  };

  if (!record) {
    return (
      <div style={styles.container}>
        <h2>Loading record details...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{record.codeTitle} - Detailed Info</h2>
      <div style={styles.detailCard}>
        <p style={styles.field}><strong>Timestamp:</strong> {record.emissionsData.timestamp}</p>
        <p style={styles.field}><strong>Run ID:</strong> {record.emissionsData.run_id}</p>
        <p style={styles.field}><strong>Emissions:</strong> {record.emissionsData.emissions} kg CO₂</p>
        <p style={styles.field}><strong>CPU Power:</strong> {record.emissionsData.cpu_power} W</p>
        <p style={styles.field}><strong>CPU Energy:</strong> {record.emissionsData.cpu_energy} J</p>
        <p style={styles.field}><strong>Energy Consumed:</strong> {record.emissionsData.energy_consumed} kWh</p>
        <p style={styles.field}><strong>Country:</strong> {record.emissionsData.country_name}</p>
        <p style={styles.field}><strong>Region:</strong> {record.emissionsData.region}</p>
        <p style={styles.field}><strong>Code:</strong> <pre style={styles.code}>{record.code}</pre></p>
      </div>
      <div style={styles.buttonContainer}>
        <button style={styles.backButton} onClick={handleBack}>Back</button>
        <button style={styles.compareButton} onClick={handleCompare}>Compare</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    marginBottom: '20px',
    color: '#333',
  },
  detailCard: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '20px',
    lineHeight: '1.8em', // 줄 간격을 넓게 설정
    maxHeight: '600px', // 카드의 최대 높이를 설정
    overflowY: 'auto', // 내용이 넘치면 스크롤이 나타나도록 설정
  },
  field: {
    marginBottom: '15px', // 각 항목 간의 간격을 넓게 설정
    fontSize: '16px',
  },
  code: {
    backgroundColor: '#f4f4f4',
    padding: '10px',
    borderRadius: '5px',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '600px',
  },
  backButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  compareButton: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#FF9800',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Detailed;
