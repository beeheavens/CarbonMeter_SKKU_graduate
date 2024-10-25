import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 가져오기

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState(null); // 로그인된 사용자의 정보를 저장
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅

  // 로그인 여부 확인
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedEmail = localStorage.getItem('userEmail'); // 이메일 저장 확인
    if (isLoggedIn && storedEmail) {
      setUserInfo({ email: storedEmail });
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:12345/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 200) {
        alert('Login successful!');
        localStorage.setItem('isLoggedIn', 'true'); // 로그인 여부 저장
        localStorage.setItem('userEmail', email); // 사용자 이메일 저장
        setUserInfo({ email }); // 사용자 정보를 상태에 저장
        navigate('/'); // 로그인 성공 시 메인 페이지로 이동
      } else {
        alert(data.message); // 로그인 실패 시 메시지 표시
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/register'); // Register 페이지로 이동
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setUserInfo(null);
    alert('Logged out successfully.');
  };

  // 로그인된 상태라면 사용자 정보를 보여줌
  if (userInfo) {
    return (
      <div style={styles.container}>
        <div style={styles.form}>
          <h2 style={styles.title}>Welcome, {userInfo.email}</h2>
          <button style={styles.button} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Login</h2>
        
        <div style={styles.inputContainer}>
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div style={styles.inputContainer}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <div style={styles.buttonContainer}>
          <button type="submit" style={styles.button}>Login</button>
          <button onClick={handleRegister} style={styles.button}>Register</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  form: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#666',
  },
  input: {
    width: '95%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center', // 버튼을 가운데로 정렬
    gap: '10px',
    flexDirection: 'column', // 버튼을 세로로 배치
  },
  button: {
    width: '100%', // 버튼을 폼 너비에 맞게 설정
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default LoginPage;
