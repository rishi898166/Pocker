import React, { useState } from "react";
import styles from "./Login.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email && !password) {
      return setError("Please fill in all the fields");
    }
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      history.push("/");
    } catch (e) {
      console.log(e);
      setError("Failed to Log In");
    }
    setLoading(false);
  }

  return (
    <div className={styles.main}>
      <div className={styles.loginWrapper}>
        <h1>Log in</h1>
        <div style={{ height: 30 }} />
        {error && <h3 style={{ color: "red" }}>{error}</h3>}
        <div style={{ height: 30 }} />
        <input className={styles.inputField} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ height: 70 }} />
        <input className={styles.inputField} type="password" placeholder="Password" value={password} onChange={(e) =>
          setPassword(e.target.value)}
        />
        <div style={{ height: 70 }} />
        <button className={styles.loginBtn} type="button" onClick={handleSubmit} disabled={loading}>
          Log In
        </button>
        <div style={{ height: 30 }} />
        <h4>
          Need an account?
          <Link to="/signup" className={styles.signUpChange}>Sign Up</Link>
        </h4>
      </div>
    </div>
  );
}
