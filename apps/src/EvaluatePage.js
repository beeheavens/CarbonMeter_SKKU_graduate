import React, { useState, useEffect } from 'react';

const EvaluatePage = () => {
  const [codeTitle, setCodeTitle] = useState(''); // 코드 제목 상태 추가
  const [code, setCode] = useState('');
  const [emissionData, setEmissionData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // 로그인된 사용자의 정보를 저장

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedEmail = localStorage.getItem('userEmail');
    if (loggedIn && storedEmail) {
      setIsLoggedIn(true);
      setUserInfo({ email: storedEmail });
    }
  }, []);

  const handleEvaluate = async () => {
    try {
      const response = await fetch('http://localhost:12345/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
          codeTitle, // 코드 제목도 서버로 전송
          code,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmissionData(data); // 서버로부터 받은 CO₂ 배출 데이터 설정
      } else {
        console.error('Error evaluating code:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderEmissionData = () => {
    if (!emissionData) return null;

    return (
      <tbody>
        <tr style={styles.row}>
          <th>Timestamp</th>
          <td>{emissionData.timestamp}</td>
        </tr>
        <tr style={styles.row}>
          <th>Run ID</th>
          <td>{emissionData.run_id}</td>
        </tr>
        <tr style={styles.row}>
          <th>Emissions</th>
          <td>{emissionData.emissions} kg CO₂</td>
        </tr>
        <tr style={styles.row}>
          <th>CPU Power</th>
          <td>{emissionData.cpu_power} W</td>
        </tr>
        <tr style={styles.row}>
          <th>CPU Energy</th>
          <td>{emissionData.cpu_energy} J</td>
        </tr>
        <tr style={styles.row}>
          <th>Energy Consumed</th>
          <td>{emissionData.energy_consumed} kWh</td>
        </tr>
        <tr style={styles.row}>
          <th>Country</th>
          <td>{emissionData.country_name}</td>
        </tr>
        <tr style={styles.row}>
          <th>Region</th>
          <td>{emissionData.region}</td>
        </tr>
      </tbody>
    );
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.tempcontainer}>
        <h2>Please log in to evaluate your codes.</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.leftPane}>
        <h2>Input your codes! {userInfo.email}</h2>
        <input
          type="text"
          value={codeTitle}
          onChange={(e) => setCodeTitle(e.target.value)}
          placeholder="Enter code title"
          style={styles.titleInput} // 스타일 추가
        />
        <textarea
          style={styles.codeInput}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your Python code here..."
        />
        <button style={styles.evaluateButton} onClick={handleEvaluate}>
          Evaluate
        </button>
      </div>
      <div style={styles.rightPane}>
        <h2>Carbon Emission</h2>
        {emissionData ? (
          <div style={styles.emissionContainer}>
            <h3>Evaluation Results</h3>
            <table style={styles.table}>
              {renderEmissionData()}
            </table>
          </div>
        ) : (
          <p>No emission data yet.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  tempcontainer: {
    padding: '40px',
    backgroundColor: '#f0f0f0',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
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
  },
  titleInput: {
    fontSize: '16px',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    outline: 'none',
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
  evaluateButton: {
    padding: '12px 25px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    alignSelf: 'center',
  },
  emissionContainer: {
    marginTop: '20px',
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '15px 0',
  },
  row: {
    height: '50px', // 각 행의 간격을 넓게 설정
  },
  th: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
  },
};

export default EvaluatePage;
