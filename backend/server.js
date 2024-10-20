import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // 로그인 성공 시 메인 페이지로 이동
        navigate('/main');
      } else {
        alert('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div>
      {/* 기존 로그인 UI 코드 */}
      <form onSubmit={handleLogin}>
        {/* ... */}
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate('/register')}>Register</button>
    </div>
  );
};

export default Login;
