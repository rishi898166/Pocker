/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-duplicate-props */
import React from "react";
import styles from "./ClubRoom.module.css";
import OFCTable from "../../assets/OFC Table.png";
import TexasTable from "../../assets/Texas Table.png";
import PLOTable from "../../assets/PLO Table.png";
import { Link, useHistory } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { addNotification, getClub, getTables, getUserDatabyUID, deleteLobby, joinLobby, kickMember, leaveClub, transferFund } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import DeleteIcon from '@material-ui/icons/Delete';

export default function ClubRoom(props) {
  const [tables, settables] = useState();
  const [club, setClub] = useState();
  const [loading, setloading] = useState(true);
  const { currentUser } = useAuth();
  const [toggle, settoggle] = useState(false);
  const id = props.id;
  const history = useHistory();

  const getData = async () => {
    console.log(id)
    const res = await getTables(id);
    const clubData = await getClub(id);
    console.log(res, clubData);
    settables(res);
    setClub(clubData);
  };

  const handleToggle = () => {
    settoggle(!toggle);
  };

  useEffect(() => {
    getData()
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        {club && (
          <>
            <div
              style={{ display: "flex", flexDirection: "row", marginLeft: 30 }}
            >
              <img
                src={club.logo}
                alt=""
                style={{ height: 50, width: 50, objectFit: "cover" }}
              />
              <div style={{ marginLeft: 30 }}>
                <h2>{club.name}</h2>
                <span>({club.id})</span>
              </div>
            </div>
            {
              club.admin === currentUser.uid &&
              <h3>Fund : {club.fund}</h3>
            }
            <div
              style={{ display: "flex", flexDirection: "row", marginRight: 30 }}
            >
              <button
                type="button"
                className={styles.Btn}
                onClick={handleToggle}
              >
                {toggle ? "View Club" : "View Members"}
              </button>
              {
                club.admin !== currentUser.uid &&
                <button
                  type="button"
                  className={styles.Btn}
                  onClick={(e) => {
                    alert("You left this club")
                    leaveClub(club.id, currentUser.displayName, currentUser.uid).then(() => {
                      window.location.reload(true);
                    })
                  }}
                >
                  Leave
                </button>
              }
              {
                club.admin === currentUser.uid &&

                <Link
                  to="/create-table"
                  style={{ textDecoration: "none", color: "white" }}
                >
                  <button type="button" className={styles.Btn}>
                    Add Table +
                  </button>
                </Link>
              }
            </div>
          </>
        )}
      </div>

      {(!club || !tables) && <div>Loading ...</div>}

      {(club && tables) && toggle && <DisplayMembers user={currentUser} data={club} />}

      {(club && tables) && !toggle && <DisplayTables tables={tables} data={club} id={id} />}
    </div>
  );
}

function DisplayTables(props) {
  console.log(props)
  const [tables, setTables] = useState()
  const clubdata = props.data;
  const id = props.id
  const data = [];
  const { currentUser } = useAuth();

  useEffect(() => {
    getData()
  }, [])

  if (tables) {
    tables.forEach((doc) => {
      data.push(doc.data());
    });
  }
  console.log(data);

  const join = async (id) => {
    console.log(id);
    joinLobby(id, currentUser.uid);
  };

  const getData = async () => {
    const res = await getTables(id);
    setTables(res)
  }

  const del = async (tid) => {
    deleteLobby(tid)
    const res = await getTables(id);
    setTables(res)
  }



  return (
    <div>
      {data.map((table) => {
        return (
          <div className={styles.card}>
            <img
              src={
                table.game === "TEXAS"
                  ? TexasTable
                  : table.game === "PLO"
                    ? PLOTable
                    : OFCTable
              }
            />
            <div style={{ height: 19 }} />
            <p>Hosted By - {table.username}</p>
            <div style={{ height: 19 }} />
            <div>
              <Link
                to={"/lobby/" + table.id}
                style={{ textDecoration: "none", color: "white" }}
              >
                <button
                  type="button"
                  className={styles.joinNowBtn}
                  onClick={() => join(table.id)}
                >
                  Join Now
                </button>
              </Link>
              {
                currentUser.uid === clubdata.admin &&
                <button
                  type="button"
                  className={styles.delBtn}
                  onClick={() => del(table.id)}
                >
                  <DeleteIcon className={styles.icon} />
                </button>
              }

            </div>
          </div>
        );
      })}
    </div>
  );
}

function DisplayMembers(props) {
  const [userlist, setuserlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("")
  const data = props.data;
  const user = props.user;

  const getData = async () => {
    let userData = [];
    for (let i = 0; i < data.members.length; i++) {
      const element = data.members[i];
      userData.push(await getUserDatabyUID(element));
    }
    console.log(userData);
    setuserlist(userData);
    setLoading(false);
  };

  const giveInvite = async () => {
    const message = "You have been invited to join club " + data.name + " by " + user.displayName + ". Use code " + data.id + " to join club."
    addNotification(username, message).then((res) => {
      if (res) { alert("Invite Sent") }
    })
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <h2>Club Members</h2>
      <div
        style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", color: "white" }}>
        <input type='text' value={username} placeholder="Enter Username" onChange={(e) => setUsername(e.target.value)} />
        <button type="button" onClick={giveInvite}>Invite</button>
      </div>
      {!loading &&
        userlist.map((card, index) => {
          return (
            <div key={index} className={styles.wrapper}>
              <div className={styles.userListing}>
                <img src={card.data.imageUrl} alt="" style={{ height: 50, width: 50, objectFit: "cover" }} />
                <p>{card.id}</p>
              </div>
              {user.uid === data.admin && (
                <div className={styles.actions}>
                  <GiveFund user={card} club={data} />
                  <KickButton user={card} club={data} />
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

function GiveFund(props) {
  const [amount, setamount] = useState(0);

  const giveFund = async () => {
    if (amount > 0) {
      if (props.club.fund > amount) {
        await transferFund(
          props.user.id,
          props.club.id,
          props.user.data.fund,
          props.club.fund,
          amount
        );
        setamount(0);
      } else {
        alert(
          "Your club does not have enough fund. Please contact admin for more funds"
        );
        setamount(0);
      }
    } else {
      alert("Enter amount to transfer");
    }
  };

  return (
    <div className={styles.GiveFund}>
      <input
        type="number"
        value={amount}
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => {
          if (e.target.value > 0) {
            setamount(e.target.value);
          }
        }}
      />
      <button type="button" onClick={giveFund} className={styles.giveFundBtn}>
        Give Fund
      </button>
    </div>
  );
}

function KickButton(props) {
  const history = useHistory();
  const kick = async () => {
    console.log(props.club, props.user);
    kickMember(
      props.user.id,
      props.club.id,
      props.club.members,
      props.user.data.id
    );
    history.replace("/")
  };

  return (
    <button type="button" onClick={kick} className={styles.kickBtn}>
      Kick
    </button>
  );
}
