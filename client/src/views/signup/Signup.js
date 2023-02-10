import React, { useState } from "react";
import styles from "./Signup.module.css";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory, Link } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const { isUsernameValid } = useAuth();
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email && !password && !username && !phone) {
      return setError("Please fill in all the fields");
    }
    setError("");
    setLoading(true);
    try {
      let check = await isUsernameValid(username);
      console.log(check);
      if (!check) {
        setError("Username is already taken");
        setLoading(false);
        return;
      } else {
        await signup(email, password, username, phone);
        history.push("/");
      }
    } catch (e) {
      console.log(e);
      setError("Failed to Sign Up");
    }
    setLoading(false);
  }
  return (
    <div className={styles.main}>
      <div className={styles.signupWrapper}>
        <h1>Sign up</h1>
        <div style={{ height: 30 }} />
        {error && <h3 style={{ color: "red" }}>{error}</h3>}
        <div style={{ height: 30 }} />
        <input
          className={styles.inputField}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ height: 70 }} />
        <input
          className={styles.inputField}
          type={"password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ height: 70 }} />
        <input
          className={styles.inputField}
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div style={{ height: 70 }} />
        <input
          className={styles.inputField}
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div style={{ height: 70 }} />
        <button
          className={styles.loginBtn}
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
        >
          Sign Up
        </button>
        <div style={{ height: 30 }} />
        <h4>
          Already a user? <Link to="/login" className={styles.signUpChange}>Log In</Link>
        </h4>
      </div>
    </div>
  );
}
