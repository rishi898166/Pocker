import React, { useState } from "react";
import styles from "./Navbar.module.css";
import NotificationsIcon from "@material-ui/icons/Notifications";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
import { getUserDatabyUID } from "../../firebase";
export default function Navbar() {
  const { logout, currentUser } = useAuth();
  const [user, setuser] = useState();
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    const data = await getUserDatabyUID(currentUser.uid);
    setuser(data);
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <div>
      <div className={styles.navbar}>
        <div className={styles.navbarContent}>
          <h4 className={styles.logo}>Logo</h4>
          <div className={styles.midNav}>
            <p>
              <Link to="/" className={styles.activenavLink}>
                Clubs
              </Link>
            </p>
            <p>
              <Link to="/career" className={styles.navLink}>
                Career
              </Link>
            </p>
            <p>
              <Link to="/public-lobby" className={styles.navLink}>
                Lobby
              </Link>
            </p>
          </div>
          <div className={styles.rightNav}>
            {!loading && (
              <div className={styles.fund} style={{ textDecoration: "none", color: "white" }}>
                <AccountBalanceIcon className={styles.icon} />
                <p style={{ marginLeft: -15 }}>{user.data.fund}</p>
              </div>
            )}
            <Link to="/notify" style={{ textDecoration: "none", color: "white" }}>
              <NotificationsIcon className={styles.icon} />
            </Link>
            <Link to="/profile" style={{ textDecoration: "none", color: "white" }}>
              <AccountCircleIcon className={styles.icon} />
            </Link>
            <button type="button" onClick={logout} className={styles.logout}>
              <PowerSettingsNewIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
