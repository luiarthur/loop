// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js"
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-analytics.js"
import {
    getFirestore,
    doc,
    getDocs,
    setDoc,
    updateDoc,
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

    // Repopulate previously saved videos.
    async function loadVideos() {
        const ref = await collection(db, "users", uid, "videoId")
        onSnapshot(ref, snapshot => {
            const selection = document.getElementById("select-video-names")
            selection.innerHTML = "<option disabled selected value>-- select saved video --</option>"

            snapshot.forEach(doc => {
                console.log("data.id: " + doc.id)
                let data = doc.data()
                const option = document.createElement("option")
                option.setAttribute("video-id", doc.id)
                option.value = data.title
                option.textContent = option.value
                selection.appendChild(option)
            })

            selection.addEventListener("change", () => {
                const selectedItem = selection.options.item(selection.selectedIndex)
                const videoId = selectedItem.getAttribute("video-id")
                console.log(`Loading ${videoId}...`)
                window.LOOPER.reset()
                window.PLAYER.cueVideoById(videoId, 0)
            })
        })
    }

    // Listen to changes videoId collection. Update UI accordingly.
    window.listenDoc = async (videoId) => {
        const docs = collection(db, "users", uid, "videoId", videoId, "loops")

        // Attempt to stop listening to any changes to documents in the
        // videoId's collection.
        try {
            console.log("Unsubscribed to old changes.")
            window.unsubscribe()
        } catch {
            console.log("No active listeners to unsubscribe.")
        }

        window.unsubscribe = onSnapshot(docs, (snapshot) => {
            console.log("Reload loops.")

            const div = document.getElementById("div-saved-loops")
            div.textContent = ""

            snapshot.forEach(doc => {
              let data = doc.data()
              div.appendChild(window.loopComponent(data))
            })
        })
    }

    // Append a single loop.
    window.appendFirebase = async (videoId, newItem) => {
        const ref = doc(
            db, "users", uid, "videoId", videoId, "loops", newItem.name
        )
        await setDoc(ref, newItem, {merge: true})

        const now = new Date()
        await setDoc(
            doc(db, "users", uid, "videoId", videoId),
            {
                lastUpdated: now.toISOString(),
                title: PLAYER.getVideoData().title
            },
            {merge: true}
        )
    }

    // FIXME: Not removing from firebase?!
    // Remove a single loop.
    window.removeLoopFromFirebase = async (videoId, name) => {
        await deleteDoc(
            doc(db, "users", uid, "videoId", videoId, "loops", name)
        )
    }

    // untested. I think removing collection is not permitted in firestore.
    window.removeVideoFromFirebase = async function (videoId) {
        await deleteDoc(
            doc(db, `users/${uid}/videoId/${videoId}`)
        )
    }

    await window.listenDoc(PLAYER.getVideoData().video_id)
    await loadVideos()
}
document.getElementById("btn-auth").addEventListener("click", handleGoogleAuth)