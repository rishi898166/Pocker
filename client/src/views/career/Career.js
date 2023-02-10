import React, { useEffect, useState } from "react";
import styles from "./Career.module.css";

import Navbar from "../navbar/Navbar";
import { getCareer } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

export default function Career() {
  const wonStyle = { backgroundColor: "#7bf17f", color: "black" };
  const lostStyle = { backgroundColor: "#F04C4C", color: "white" };

  const [loading, setloading] = useState(true)
  const [career, setcareer] = useState([])
  const { currentUser } = useAuth()

  const getData = async () => {
    const data = await getCareer(currentUser.displayName)
    let arr = []
    data.forEach((club) => {
      console.log(club.data())
      arr.push(club.data())
    })

    setcareer(arr)
    setloading(false)
  }

  useEffect(() => {
    getData();
  }, [])


  const formatMonth = (month) =>{
    switch(month) {
      case 0:
        return "Jan"
        break;
      case 1:
        return "Feb" 
        break;
      case 2:
        return "Mar" 
        break;
      case 3:
        return "Apr" 
        break;
      case 4:
        return "May" 
        break;
      case 5:
        return "Jun" 
        break;
      case 6:
        return "Jul" 
        break;
      case 7:
        return "Aug" 
        break;
      case 8:
        return "Sep" 
        break;
      case 9:
        return "Oct" 
        break;
      case 10:
        return "Nov" 
        break;
      case 11:
        return "Dec" 
        break;
      default:
        return null
    }
  }
  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.body}>
        {
          !loading &&
          <div className={styles.wrapper}>
            {
              career.map((data, index) => {
                const date = new Date(data.time)
                var seconds = date.getSeconds();
                var minutes = date.getMinutes();
                var hour = date.getHours();

                var year = date.getFullYear();
                var month = date.getMonth(); // beware: January = 0; February = 1, etc.
                var day = date.getDate();

                return(
                  <div key={index} className={styles.listing} style={ data.status ? wonStyle : lostStyle}>
                    <div className={styles.content}>
                      <div className={styles.gameInfo}>
                        <h4>{data.game}</h4>
                        <p>{hour}:{minutes} - {day} {formatMonth(month)}, {year}</p>
                      </div>
                      <div className={styles.gameStatus}>
                        <h2>{ data.status ? "Won" : "Lost"}</h2>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        }
      </div>
    </div>
  );
}
