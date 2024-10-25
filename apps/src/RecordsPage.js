import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RecordPage = () => {
  const [records, setRecords] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부 상태 추가
  const [userInfo, setUserInfo] = useState(null); // 로그인된 사용자의 정보를 저장
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedEmail = localStorage.getItem('userEmail');
    if (loggedIn && storedEmail) {
      setIsLoggedIn(true);
      setUserInfo({ email: storedEmail });

      // 서버로부터 MongoDB 데이터를 가져옴
      fetchRecords(storedEmail);
    }
  }, []);

  const fetchRecords = async (email) => {
    try {
      const response = await fetch('http://localhost:12345/getRecords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // 이메일을 서버로 전송
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data); // 가져온 데이터를 상태에 저장
      } else {
        console.error('Error fetching records:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (codeTitle) => {
    try {
      const response = await fetch('http://localhost:12345/deleteRecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeTitle }),
      });
    } catch (error) {
      console.error('Error:', error);
    }
    fetchRecords(userInfo.email);
  };

  const handleDetail = (record) => {
    navigate(`/detailed/${record.codeTitle}`, { state: record });
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <h2>Please log in to view your records.</h2>
      </div>
    );
  }
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{userInfo.email}'s Emission Records</h2>
      <div style={styles.recordList}>
        {records.length > 0 ? (
          records.map((record) => (
            <div key={record._id} style={styles.recordCard}>
              <h3 style={styles.recordName}>{record.codeTitle}</h3>
              <p style={styles.recordEmission}>Emission: {record.emissionsData.emissions}</p>
              <p style={styles.recordDate}>Date: {record.emissionsData.timestamp}</p>
              <div style={styles.buttonContainer}>
                <button style={styles.deleteButton} onClick={() => handleDelete(record.codeTitle)}>Delete</button>
                <button style={styles.detailButton} onClick={() => handleDetail(record)}>Detail</button>
              </div>
            </div>
          ))
        ) : (
          <p style={styles.noRecordsText}>No records found.</p>
        )}
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
  recordList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '600px',
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  recordName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  recordEmission: {
    fontSize: '16px',
    color: '#666',
  },
  recordDate: {
    fontSize: '14px',
    color: '#999',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  detailButton: {
    padding: '10px',
    fontSize: '14px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  deleteButton: {
    padding: '10px',
    fontSize: '14px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  noRecordsText: {
    fontSize: '18px',
    color: '#666',
  },
};

export default RecordPage;
