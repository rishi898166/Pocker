import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { useAuth } from "../contexts/AuthContext";
import { useHistory, Link } from "react-router-dom";

import Navbar from "./navbar/Navbar";
import { getUserData } from "../firebase";
import ClubRoom from "./club room/ClubRoom";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [club, setclub] = useState(null);
  const [loading, setloading] = useState(true);

  const getdata = async () => {
    const userinfo = await getUserData(currentUser.displayName);
    console.log(userinfo);
    setclub(userinfo.club);
    setloading(false);
  };

  useEffect(() => {
    getdata();
  }, []);

  return (
    <div className={styles.main}>
      <Navbar />
      {!loading && (
        <>
          {!club && <NonClubs />}
          {club && <ClubRoom id={club} />}
        </>
      )}
      {loading && <h3>Loading ...</h3>}
    </div>
  );
}

function NonClubs() {
  const history = useHistory();
  const { currentUser, logout } = useAuth();
  async function handleLogout() {
    try {
      await logout();
      history.replace("/login");
    } catch (error) {
      alert("Failed to Log Out");
    }
  }
  return (
    <div className={styles.body}>
      <div>
        <h2 style={{ color: "white" }}>
          Join or Create a club to start playing with others.
        </h2>
      </div>
      <div className={styles.body2}>
        <div className={styles.section}>
          <Link
            to="/create-club"
            style={{ textDecoration: "none", color: "white" }}
          >
            <button className={styles.createClubBtn}>Create Club</button>
          </Link>
        </div>
        <div className={styles.section}>
          <Link
            to="/join-club"
            style={{ textDecoration: "none", color: "white" }}
          >
            <button className={styles.joinClubBtn}>Join Club</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
