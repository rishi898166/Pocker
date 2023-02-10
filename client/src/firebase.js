import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { useHistory } from "react-router";

//===================================== Credentials
const firebaseConfig = {
  apiKey: "AIzaSyBhplA68Tyt3lGUEnnL0ZzBxiACmvLjVFk",
  authDomain: "pock-7df29.firebaseapp.com",
  projectId: "pock-7df29",
  storageBucket: "pock-7df29.appspot.com",
  messagingSenderId: "850541290832",
  appId: "1:850541290832:web:fec653752fd20108707855",
  measurementId: "G-LSL48MNGG7"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore();

//===================================== Exports
export {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  storage,
  updateProfile,
  db,
};

export default app;

export async function updateGameTable(lobbyID, state) {
  try {
    const ref = doc(db, "lobby", lobbyID);

    return await updateDoc(ref, {
      state: JSON.stringify(state),
    });
  } catch (e) {
    return alert(e);
  }
}

export async function createClub(clubid, logoUrl, name, uid, username) {
  try {
    await setDoc(doc(db, "clubs", clubid.toString()), {
      name: name,
      admin: uid,
      logo: logoUrl,
      id: clubid,
      members: [],
      fund: 5000,
    });
    joinClub(clubid, username, uid);
  } catch (err) {
    alert(err);
  }
}

export async function joinClub(clubid, username, uid) {
  try {
    const clubref = doc(db, "clubs", clubid.toString());
    const clubData = await getDoc(clubref);

    if (clubData.exists()) {
      let members = clubData.data().members;
      members.push(uid);

      const userref = doc(db, "users", username.toString());

      const userquery = await updateDoc(userref, {
        club: clubid,
      });

      return await updateDoc(clubref, {
        members: members,
      });
    } else {
      alert("Club not found !");
      return null;
    }
  } catch (e) {
    alert(e);
    return null;
  }
}

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}


export async function leaveClub(clubid, username, uid) {
  try {
    const clubref = doc(db, "clubs", clubid.toString());
    const clubData = await getDoc(clubref);

    if (clubData.exists()) {
      let members = clubData.data().members;
      members = removeItemOnce(members, uid)

      const userref = doc(db, "users", username.toString());

      const userquery = await updateDoc(userref, {
        club: null,
      });

      await updateDoc(clubref, {
        members: members,
      });
      
    } else {
      alert("Club not found !");
      return null;
    }
  } catch (e) {
    alert(e);
    return null;
  }
}

export async function getUserData(username) {
  try {
    const ref = doc(db, "users", username.toString());
    const res = await getDoc(ref);

    if (res.exists()) {
      return res.data();
    } else {
      alert("User not found !");
      return null;
    }
  } catch (e) {
    alert(e);
    return null;
  }
}

export async function getUserDatabyUID(uid) {
  try {
    const q = query(collection(db, "users"), where("id", "==", uid));

    const querySnapshot = await getDocs(q);

    const res = {
      data: querySnapshot.docs[0].data(),
      id: querySnapshot.docs[0].id,
    };
    return res;
  } catch (err) {
    alert(err);
  }
}

export async function createTable(user, game, username, timestamp) {
  try {
    await setDoc(doc(db, "lobby", timestamp.toString()), {
      username: username,
      admin: null,
      id: timestamp,
      members: [],
      clubid: user.club.toString(),
      status: "OPEN",
      game: game,
      state: null,
      isPublic: false,
    });
  } catch (err) {
    alert(err);
  }
}

export async function createPublicTable(game, timestamp) {
  const nextid = Date.now();
  try {
    await setDoc(doc(db, "lobby", timestamp.toString()), {
      username: null,
      admin: null,
      id: timestamp,
      previd: timestamp,
      members: [],
      status: "OPEN",
      game: game,
      isPublic: true,
      state: null,
    });
  } catch (err) {
    alert(err);
  }
}

export async function resetLobby(id) {
  const nextid = Date.now();
 
  const ref = doc(db, "lobby", id.toString());
  await updateDoc(ref, {
    members: [],
    nextid: nextid,
  });
}

export async function deleteLobby(id) {
  const ref = doc(db, "lobby", id.toString());
  await deleteDoc(ref)
}

export async function updateLobby(id, currentid) {
  const nextid = Date.now();

  if(id === "texaspublic"){
    await createPublicTable("TEXAS", nextid);
  }else if(id === "plopublic"){
    await createPublicTable("PLO", nextid);
  }
  const ref = doc(db, "lobby", id.toString());
  await updateDoc(ref, {
    currentid: currentid,
    nextid: nextid,
  });
}

export async function getTables(clubid) {
  try {
    const q = query(
      collection(db, "lobby"),
      where("clubid", "==", clubid.toString())
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot;
  } catch (err) {
    alert(err);
  }
}

export async function getLobby(id) {
  try {
    const ref = doc(db, "lobby", id.toString());
    const res = await getDoc(ref);

    if (res.exists()) {
      return res.data();
    } else {
      alert("User not found !");
      return null;
    }
  } catch (e) {
    alert(e);
    return null;
  }
}

export async function getClub(id) {
  try {
    const ref = doc(db, "clubs", id.toString());
    const res = await getDoc(ref);

    if (res.exists()) {
      return res.data();
    } else {
      alert("User not found !");
      return null;
    }
  } catch (e) {
    alert(e);
    return null;
  }
}

export async function joinLobby(id, uid) {
  try {
    const lobbyref = doc(db, "lobby", id.toString());
    const lobbyData = await getDoc(lobbyref);

    if (lobbyData.exists()) {
      let members = lobbyData.data().members;
      let status = lobbyData.data().status;
      if (!members.includes(uid) && members.length < 9 && status === "OPEN") {
        members.push(uid);
        if(members.length === 1){
          return await updateDoc(lobbyref, {
            admin: uid,
            members: members,
          });
        }else{
          return await updateDoc(lobbyref, {
            members: members,
          });
        }
      }
    } else {
      alert(id.toString() + " lobby not found !");
      return null;
    }
  } catch (e) {
    alert(e);
    return null;
  }
}

export async function startGame(lobbyID) {
  try {
    const ref = doc(db, "lobby", lobbyID.toString());

    return await updateDoc(ref, {
      status: "CLOSED",
    });
  } catch (e) {
    return alert(e);
  }
}

export async function openLobby(lobbyID) {
  try {
    const ref = doc(db, "lobby", lobbyID.toString());

    return await updateDoc(ref, {
      status: "OPEN",
    });
  } catch (e) {
    return alert(e);
  }
}

export async function transferFund(
  username,
  clubid,
  userfund,
  clubfund,
  amount
) {
  const newclubfund = parseInt(clubfund) - parseInt(amount);
  const newuserfund = parseInt(userfund) + parseInt(amount);
  try {
    const clubref = doc(db, "clubs", clubid.toString());
    await updateDoc(clubref, {
      fund: newclubfund,
    });

    const userref = doc(db, "users", username.toString());
    await updateDoc(userref, {
      fund: newuserfund,
    });

    alert("Fund transfered to @" + username);
  } catch (e) {
    return alert(e);
  }
}

export async function kickMember(username, clubid, members, uid) {
  const index = members.indexOf(uid);
  if (index > -1) {
    members.splice(index, 1);
  }

  try {
    const clubref = doc(db, "clubs", clubid.toString());
    await updateDoc(clubref, {
      members: members,
    });

    const userref = doc(db, "users", username.toString());
    await updateDoc(userref, {
      club: null,
    });

    alert("Kicked @" + username + " from club");
  } catch (e) {
    return alert(e);
  }
}

export async function deductFund(uid, amount) {
  const userData = await getUserDatabyUID(uid);
  const newamount = parseInt(userData.data.fund) - amount;
  try {
    const userref = doc(db, "users", userData.id.toString());
    return await updateDoc(userref, {
      fund: newamount,
    });
  } catch (e) {
    return alert(e);
  }
}

export async function addFund(uid, amount) {
  const userData = await getUserDatabyUID(uid);
  const newamount = parseInt(userData.data.fund) + amount;
  try {
    const userref = doc(db, "users", userData.id.toString());
    return await updateDoc(userref, {
      fund: newamount,
    });
  } catch (e) {
    return alert(e);
  }
}

export async function addNotification(username, message) {
  const timestamp = Date.now();
  try {
    await setDoc(
      doc(
        db,
        "users",
        username.toString(),
        "notification",
        timestamp.toString()
      ),
      {
        time: timestamp,
        message: message,
        status: true,
      }
    );

    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export async function addCareer(username, game, status) {
  const timestamp = Date.now();
  try {
    await setDoc(
      doc(db, "users", username.toString(), "career", timestamp.toString()),
      {
        time: timestamp,
        game: game,
        status: status,
      }
    );

    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export async function addClubFund(clubid, amount) {
  const clubref = doc(db, "clubs", clubid.toString());
  const clubdata = (await getDoc(clubref)).data();
  const newamount = parseInt(clubdata.fund) + parseInt(amount);
  try {
    await updateDoc(clubref, {
      fund: newamount,
    });
    alert("Fund Sent");
  } catch (e) {
    return alert(e);
  }
}

export async function getAllClubs() {
  try {
    const querySnapshot = await getDocs(collection(db, "clubs"));
    return querySnapshot;
  } catch (err) {
    alert(err);
  }
}

export async function getCareer(username) {
  try {
    const querySnapshot = await getDocs(
      collection(db, "users", username.toString(), "career")
    );
    return querySnapshot;
  } catch (err) {
    alert(err);
  }
}

export async function getNotifications(username) {
  try {
    const querySnapshot = await getDocs(
      collection(db, "users", username.toString(), "notification")
    );
    return querySnapshot;
  } catch (err) {
    alert(err);
  }
}

export async function updateProfilePic(username, link) {
  try {
    const userref = doc(db, "users", username.toString());
    return await updateDoc(userref, {
      imageUrl: link,
    });
  } catch (e) {
    return alert(e);
  }
}
