import { React, useState } from "react";
import styles from "./AdminLogin.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";

export default function AdminLogin() {
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
      history.push("/admin-panel");
    } catch (e) {
      console.log(e);
      setError("Failed to Log In");
    }
    setLoading(false);
  }
  return (
    <div className={styles.body}>
      <div style={{ color: "red" }}>{error}</div>
      <div className={styles.wrapper}>
        <div>
          <div>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
            />
          </div>
          <div>
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
            />
          </div>
        </div>
        <div>
          <button
            className={styles.loginButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
