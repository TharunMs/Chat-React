import React, { useContext, useState } from 'react';
import './Login.css';
import { UserContext } from './UserContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [log,setLog] = useState('Login');
  const {setUser,setId} = useContext(UserContext);

  function handleUser(e) {
    setUsername(e.target.value);
  }

  function handlePass(e) {
    setPassword(e.target.value);
  }

  async function handleRegister() {
    try {
      const url = log === 'Register' ? 'register' : 'login';
      const result = await fetch(`http://localhost:4000/${url}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ username, password }),
      });
      const res = await result.json();
      setId(res.id);
      setUser(res.username);
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }
  

  return (
    <div className="login-container">
      <div className="login-form">
        <input type="text" value={username} onChange={handleUser} placeholder="username" />
        <input type="password" value={password} onChange={handlePass} placeholder="password" />
        <button onClick={handleRegister}>{log}</button>
        <p>{log === "Register" ? "Already a member?" : "New User?"}<button onClick={()=>log === "Register" ? setLog('Login') : setLog('Register')}>{log === 'Register' ? 'Login' : 'Register'}</button></p>
      </div>
    </div>
  );
}
