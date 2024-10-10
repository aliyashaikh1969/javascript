import express from "express";
import bcrypt from "bcrypt";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKj-6qScPViVlztnZ43mtmchG-HjIgcJI",
  authDomain: "ecom-website-b1077.firebaseapp.com",
  projectId: "ecom-website-b1077",
  storageBucket: "ecom-website-b1077.appspot.com",
  messagingSenderId: "638892616606",
  appId: "1:638892616606:web:165fb71c35bd0297fe848f",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore();
//init server
const app = express();

//middlewares
app.use(express.static("public"));
app.use(express.json());

//route
//home route
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.get("/product", (req, res) => {
  res.sendFile("product.html", { root: "public" });
});

app.get("/sign", (req, res) => {
  res.sendFile("signup.html", { root: "public" });
});
app.post("/sign", (req, res) => {
  const { name, email, number, password, tac } = req.body;

  if (name.length < 3) {
    res.json({ alert: "name must be 3 letter long" });
  } else if (!email.length) {
    res.json({ alert: "enter your email" });
  } else if (password.length < 8) {
    res.json({ alert: "password must be 8 letter long " });
  } else if (number.length < 10) {
    res.json({ alert: "invalid number , enter valid number" });
  } else if (!tac) {
    res.json({ alert: "accept ours term and condition" });
  } else {
    //store the data in db

    const users = collection(db, "users");

    getDoc(doc(users, email)).then((user) => {
      if (user.exists()) {
        return res.json({ alert: "email already exists" });
      } else {
        //encrypt the password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            req.body.password = hash;
            req.body.seller = false;

            //set the doc
            setDoc(doc(users, email), req.body).then((data) => {
              res.json({
                name: req.body.name,
                email: req.body.email,
                seller: req.body.seller,
              });
            });
          });
        });
      }
    });
  }
});

app.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "public" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email.length || !password.length) {
    return res.json({ alert: "fill both the inputs" });
  }

  const users = collection(db, "users");

  getDoc(doc(users, email)).then((user) => {
    if (!user.exists()) {
      return res.json({ alert: "email.dos not exists" });
    } else {
      bcrypt.compare(password, user.data().password, (err, result) => {
        if (result) {
          let data = user.data();
          return res.json({
            name: data.name,
            email: data.email,
            seller: data.seller,
          });
        } else {
          res.json({ alert: "password is incorrect" });
        }
      });
    }
  });
});
app.listen(3000, () => {
  console.log("okay");
});
