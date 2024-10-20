import React from 'react';
import { PiPlantBold } from 'react-icons/pi';

const MainPage = () => {
  return (
    <div style={styles.container}>
        <PiPlantBold style={styles.icon} />
      <h1 style={styles.title}>Welcome to Carbon Meter</h1>
      <p style={styles.description}>
        Carbon Meter helps you measure the carbon emissions generated by your code. 
        By analyzing your source code, we provide insights into the environmental impact of your development efforts, 
        empowering you to refactor and optimize your code for a greener future.
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: '20px',
  },
  title: {
    fontSize: '36px',
    marginBottom: '20px',
    color: '#4CAF50',
  },
  description: {
    fontSize: '18px',
    color: '#666',
    maxWidth: '600px',
    lineHeight: '1.6',
  },
  icon: {
    fontSize: '150px',
    color: 'green', // 아이콘을 녹색으로 설정
    marginBottom: '20px',
  }
};

export default MainPage;
