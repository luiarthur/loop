// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js"
import {
    getFirestore,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteField,
    collection,
    collectionGroup,
    deleteDoc,
    onSnapshot,
    query, where
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

// const videoId = ["JyjFCbB6qhA", "sK0J62VFC78"]
// const title = ["Dreamer - Kiefer", "Blue Serge - Bill Evans"]
// const user = "alui"

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
    const credentials = await signInWithPopup(auth, provider)
    const uid = credentials.user.uid
    console.log(`Logged in as ${uid}`)

    window.render = async (currentVideoId) => {
        const data = window.doc_data

        // Repopulate current loops.
        function repopulateLoops(videoId) {
            const div = document.getElementById("div-saved-loops")
            div.textContent = ""

            Object.values(data).forEach(item => {
                if (item.videoId == videoId) {
                    div.appendChild(window.loopComponent(item))
                }
            })
        }
        repopulateLoops(currentVideoId)

        // Repopulate previous videos.
        const selection = document.getElementById("select-video-names")
        selection.innerHTML = "<option disabled selected value>-- select saved video --</option>"

        // Store unique video ids and titles in an Object.
        const title = {}
        Object.values(data).forEach(item => {
            title[item.videoId] = item.title
        })

        Object.keys(title).forEach(id => {
            const option = document.createElement("option")
            option.setAttribute("video-id", id)
            option.value = title[id]
            option.textContent = option.value
            selection.appendChild(option)
        })

        selection.addEventListener("change", () => {
            const selectedItem = selection.options.item(selection.selectedIndex)
            const videoId = selectedItem.getAttribute("video-id")
            window.LOOPER.reset()
            window.PLAYER.cueVideoById(videoId, 0)
            repopulateLoops(videoId)
        })
    }

    // Listen for changes in Firestore.
    window.unsubscribe = onSnapshot(doc(db, "users", uid), (doc) => {
        window.doc_data = doc.data()
        render(window.PLAYER.getVideoData().video_id)
    })

    // Append a single loop.
    window.appendFirebase = async (newItem) => {
        const ref = doc(db, "users", uid)
        await setDoc(ref, newItem, { merge: true })
    }

    // Remove a single loop.
    window.removeLoopFromFirebase = async (key) => {
        await updateDoc(doc(db, "users", uid), {[key]: deleteField()})
    }

}
document.getElementById("btn-auth").addEventListener("click", handleGoogleAuth)