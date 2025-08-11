import React, { useState } from 'react';
import '../styles/Signup.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    regNumber: '',
    code: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    alert('Signup submitted!');
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2 className="form-title">Sign Up</h2>

        <div className="form-group">
          <input
            type="text"
            name="fullName"
            placeholder=" "
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <label>Full Name</label>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder=" "
            value={formData.username}
            onChange={handleChange}
            required
          />
          <label>User Name</label>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="regNumber"
            placeholder=" "
            value={formData.regNumber}
            onChange={handleChange}
            required
          />
          <label>Registration Number</label>
        </div>

        <div className="form-group">
          <input
            type="text"
            name="code"
            placeholder=" "
            value={formData.code}
            onChange={handleChange}
            required
          />
          <label>Code</label>
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder=" "
            value={formData.password}
            onChange={handleChange}
            required
          />
          <label>Password</label>
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder=" "
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <label>Confirm Password</label>
        </div>

        <button type="submit">Confirm</button>
      </form>
    </div>
  );
}
