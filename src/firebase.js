import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var config = {
  apiKey: "AIzaSyBji_fEXi4g97Ky_LW5mljpKlYrQC9eYuA",
  authDomain: "boone-family-slack-chat.firebaseapp.com",
  databaseURL: "https://boone-family-slack-chat.firebaseio.com",
  projectId: "boone-family-slack-chat",
  storageBucket: "boone-family-slack-chat.appspot.com",
  messagingSenderId: "326650301966"
};
firebase.initializeApp(config);

export default firebase;
