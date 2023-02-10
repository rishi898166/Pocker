/* eslint-disable no-unused-vars */
import { React, useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import ImageIcon from "@material-ui/icons/Image";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { createClub, getUserDatabyUID, updateProfilePic } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./Profile.module.css";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";

export default function Profile() {
  const [image, setImage] = useState(null);
  const [displayImage, setdisplayImage] = useState(null);
  const [status, setstatus] = useState(0);
  const [progress, setprogress] = useState(0);
  const { currentUser } = useAuth();
  const history = useHistory();
  const [user, setuser] = useState()
  const [loading, setLoading] = useState(true)

  const getData = async () => {
    const data = await getUserDatabyUID(currentUser.uid);
    setdisplayImage(data.data.imageUrl)

    setuser(data.data)
    setLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  const handleImage = (e) => {
    setdisplayImage(URL.createObjectURL(e.target.files[0]));
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    if (image) {
      setstatus(1);

      var clubid = Math.floor(100000 + Math.random() * 900000);

      const storage = getStorage();
      const storageRef = ref(storage, "clublogo/" + clubid + "-" + image.name);

      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + prog + "% done");
          setprogress(prog);
        },
        (error) => {
          alert(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);

            updateProfilePic(currentUser.displayName, downloadURL)

            setstatus(2);
            history.replace("/");
          });
        }
      );
    } else {
      alert("Enter all the fields");
    }
  };

  return (
    <div className={styles.main}>
      <Navbar />
      <div className={styles.body}>
        <div className={styles.card}>
          <h2 style={{ color: "white", fontSize: 30 }}>Profile</h2>
          <div style={{ height: 30 }} />
          <form>
            {displayImage && (
              <img src={displayImage} className={styles.profileImage}
                alt={"pic"} />
            )}
            <div className={styles.image}>
              <h4 style={{ marginRight: 20 }}>Change Profile Picture</h4>
              <label for="myfile">
                <ImageIcon />
              </label>
              <input style={{ display: "none" }} type="file" id="myfile" name="myfile"
                accept=".jpg, .png, .jpeg, .jfif, .gif, .bmp, .tif, .tiff|image/*" onChange={handleImage} />
            </div>
            {!loading &&
              <div>
                <div />
                <p className={styles.pStyle}><span className={styles.spanStyle}>Username</span>  <b className={styles.bStyle}>@{currentUser.displayName}</b></p>
                <p className={styles.pStyle}><span className={styles.spanStyle}>Email</span>  <b className={styles.bStyle}>{currentUser.email}</b></p>
                <p className={styles.pStyle}><span className={styles.spanStyle}>Phone</span>  <b className={styles.bStyle}>{user.phone}</b></p>
              </div>
            }
          </form>
          <div style={{ height: 30 }} />
          <button onClick={handleSubmit} className={styles.createBtn}>
            Update
          </button>
          {status === 1 && (
            <div style={{ color: "green" }}>
              Updating Profile ... {progress.toFixed(1)} %
            </div>
          )}
          {status === 2 && (
            <div style={{ color: "green" }}>Profile updated Successfully !</div>
          )}
        </div>
      </div>
    </div>
  );
}
