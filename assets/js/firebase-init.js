// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js"
import {
    getFirestore,
    doc,
    setDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js"
import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js"

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
// for (let i=0; i<2; i++) {
    // await setDoc(
        // doc(db, `users/${user}/videoId/${videoId[i]}`),
        // { "title": title[i] },
        // { merge: true }
    // )

    // for (let j=0; j < 3; j++) {
        // await setDoc(
            // doc(db, `users/${user}/videoId/${videoId[i]}/loops/loop${j}`),
            // { start: 2+j, end: 10+j },
            // { merge: true }
        // )
    // }
// }

// Test auth
const auth = getAuth(window.fbApp)
async function handleGoogleAuth(event) {
    const provider = new GoogleAuthProvider()
    window.CRED = await signInWithPopup(auth, provider)
    const uid = window.CRED.user.uid
    const today = new Date()
    console.log(`Logged in as ${uid}`)

    window.appendFirebase = async function (videoId, newItem) {
        await setDoc(
            doc(db, `users/${uid}/videoId/${videoId}/loops/${newItem.name}`),
            newItem,
            {merge: true}
        )
    }

    window.removeFromFirebase = async function (videoId, name) {
        await deleteDoc(
            doc(db, `users/${uid}/videoId/${videoId}/loop/${name}`)
        )
    }

    // append instead of overwrite data.
    // await setDoc(
    //     doc(db, `users/${uid}/videoId/aaa`),
    //     {date: `${today}`},
    //     { merge: true }
    // )
}
addClickListener("btn-auth", handleGoogleAuth)

