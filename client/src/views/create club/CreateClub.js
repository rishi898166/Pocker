import { React, useState } from "react";
import Navbar from "../navbar/Navbar";
import ImageIcon from "@material-ui/icons/Image";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { createClub } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import styles from "./CreateClub.module.css";
import TextField from "@mui/material/TextField";
import { useHistory } from "react-router-dom";

export default function CreateClub() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [displayImage, setdisplayImage] = useState(null);
  const [status, setstatus] = useState(0);
  const [progress, setprogress] = useState(0);
  const { currentUser } = useAuth();
  const history = useHistory();

  const handleImage = (e) => {
    setdisplayImage(URL.createObjectURL(e.target.files[0]));
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    if (image && name) {
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
            createClub(
              clubid,
              downloadURL,
              name,
              currentUser.uid,
              currentUser.displayName
            );

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
          <h2>Create a Club</h2>
          <div style={{ height: 30 }} />
          <form>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Club Name"
            />
            <div style={{ height: 75 }} />
            <div className={styles.image}>
              <h3>Select an Image</h3>
              <label for="myfile">
                <ImageIcon />
              </label>
              <input
                style={{ display: "none" }}
                type="file"
                id="myfile"
                name="myfile"
                accept=".jpg, .png, .jpeg, .jfif, .gif, .bmp, .tif, .tiff|image/*"
                onChange={handleImage}
              />
            </div>

            <div style={{ height: 30 }} />
            {displayImage && (
              <img src={displayImage} style={{ width: 200 }} alt={"pic"} />
            )}
          </form>
          <div style={{ height: 30 }} />
          <button onClick={handleSubmit} className={styles.createBtn}>
            Create
          </button>

          {status === 1 && (
            <div style={{ color: "green" }}>
              Creating a new Club ... {progress.toFixed(1)} %
            </div>
          )}

          {status === 2 && (
            <div style={{ color: "green" }}>Club Created Successfully !</div>
          )}
        </div>
      </div>
    </div>
  );
}
