import { React, useState } from "react";
import styles from "./AdminPanel.module.css";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import image from "../../../assets/backdrop.png";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { addClubFund, getAllClubs } from "../../../firebase";
import { useEffect } from "react";

export default function AdminPanel() {
  const [loading, setloading] = useState(true)
  const [clublist, setClublist] = useState([])

  const getData = async () => {
    const data = await getAllClubs()
    let arr = []
    data.forEach((club) => {
      console.log(club.data())
      arr.push(club.data())
    })

    setClublist(arr)
    setloading(false)
  }

  useEffect(() => {
    getData();
  }, [])
  return (
    <div className={styles.main}>
      <h2>Clubs</h2>
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
        className={styles.list}
      >
        {
          !loading &&
          <div>
            {
              clublist.map((data, index)=>{
                return(<ListItem key={index} clubName={data.name} clubId={data.id} img={data.logo}/>)
              })
            }

          </div>

          
        }
      </List>
    </div>
  );
}

function ListItem(props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const handleClick = () => {
    setOpen(!open);
  };

  const giveFund = async () => {
    if(amount > 0) {
      addClubFund(props.clubId, amount)
    }else{
      alert("Add Amount")
    }
  };

  
  return (
    <div>
      <ListItemButton onClick={handleClick} className={styles.listItem}>
        <div className={styles.image}>
          <img src={props.img} />
        </div>
        <ListItemText primary={props.clubName} secondary={props.clubId} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <TextField
              id="outlined-basic"
              label="Amount"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button
              variant="contained"
              disableElevation
              style={{ height: 50, width: 140, marginLeft: 8 }}
              onClick={giveFund}
            >
              Give Fund
            </Button>
          </ListItemButton>
        </List>
      </Collapse>
    </div>
  );
}
