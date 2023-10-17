// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js"
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC9sdcNN9pcl2ec3VaThjwa4DQmx_9wYI8",
    authDomain: "loopit-7cd36.firebaseapp.com",
    projectId: "loopit-7cd36",
    storageBucket: "loopit-7cd36.appspot.com",
    messagingSenderId: "34891474769",
    appId: "1:34891474769:web:09a16954b882a5bb21d570",
    measurementId: "G-HZXKPHT2WG"
}

// Initialize Firebase
window.fbApp = initializeApp(firebaseConfig)
const analytics = getAnalytics(window.fbApp)

const db = getFirestore(window.fbApp)

const videoId = ["JyjFCbB6qhA", "sK0J62VFC78"]
const title = ["Dreamer - Kiefer", "Blue Serge - Bill Evans"]
const user = "alui"

// Insert data.
for (let i=0; i<2; i++) {
    await setDoc(
        doc(db, `users/${user}/videoId/${videoId[i]}`),
        { "title": title[i] },
        { merge: true }
    )

    await setDoc(
        doc(db, `users/${user}/videoId/${videoId[i]}/loops/loop${i}`),
        { start: 2+i, end: 10+i },
        { merge: true }
    )
}