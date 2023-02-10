import { React, useState } from "react";
import Navbar from "../navbar/Navbar";
import styles from "./JoinClub.module.css";
import TextField from "@mui/material/TextField";
import { useAuth } from "../../contexts/AuthContext";
import { joinClub } from "../../firebase";
import { useHistory } from "react-router-dom";

export default function JoinClub() {
  const [clubId, setClubId] = useState("");
  const { currentUser } = useAuth();
  const history = useHistory();

  const handleSubmit = () => {
    const query = joinClub(clubId, currentUser.displayName, currentUser.uid);
    if (query !== null) {
      history.replace("/");
    }
  };
  return (
    <div className={styles.main}>
      <Navbar />
      <div>
        <section className={styles.card}>
          <p>Ask the Club Owner for club ID</p>
          <TextField
            id="clubId"
            label="Club ID"
            variant="outlined"
            value={clubId}
            onChange={(e) => setClubId(e.target.value)}
            className={styles.clubIdTextField}
            style={{
              position: "absolute",
              width: 355,
              height: 68,
              left: 51,
              top: 135,
            }}
          />
          <button
            type="button"
            className={styles.joinNowBtn}
            onClick={handleSubmit}
          >
            Join Now
          </button>
        </section>
      </div>
    </div>
  );
}
