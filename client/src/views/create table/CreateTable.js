import { React, useState } from "react";
import Navbar from "../navbar/Navbar";

import { createTable, getUserData } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./CreateTable.module.css";
import { useHistory } from "react-router-dom";
import { Select } from "@material-ui/core";
import { MenuItem } from "@mui/material";
import { useEffect } from "react";

export default function CreateTable() {
  const [game, setGame] = useState("TEXAS");
  const { currentUser } = useAuth();
  const history = useHistory();
  const [userData, setuserData] = useState(null);
  const [loading, setloading] = useState(true);

  const getdata = async () => {
    const userinfo = await getUserData(currentUser.displayName);
    setuserData(userinfo);
    setloading(false);
  };

  useEffect(() => {
    getdata();
  }, []);

  const handleSubmit = (e) => {
    if (game && !loading) {
      const timestamp = Date.now();
      createTable(userData, game, currentUser.displayName, timestamp);
      history.replace("/")
    } else {
      alert("Enter all the fields");
    }
  };

  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.body}>
        <div className={styles.wrapper}>
          <h2 style={{ color: "white" }}>Create a Table</h2>
          <div style={{ height: 30 }} />
          <form>
            <div style={{ height: 75 }} />
            <div className={styles.image}>
              <h3 style={{ color: "white" }}>Select an Game</h3>
              <br />
              <Select
                value={game}
                label="Select"
                labelWidth={50}
                onChange={(e) => setGame(e.target.value)}
                style={{ backgroundColor: "white", marginLeft: 20}}
              >
                <MenuItem value={"TEXAS"} >Texas Hold Em'</MenuItem>
                <MenuItem value={"PLO"} >Pot Limit Omaha</MenuItem>
              </Select>
            </div>

            <div style={{ height: 30 }} />
          </form>
          <div style={{ height: 30 }} />
          <button onClick={handleSubmit} className={styles.createBtn} >
            Create Table
          </button>
        </div>
      </div>
    </div>
  );
}
