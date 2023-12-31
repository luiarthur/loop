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
    signOut,
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
const auth = getAuth(window.fbApp)

async function handleGoogleAuth(event) {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    connect()
}
    
async function handleSignOut(event) {
    signOut(auth).then(() => {
        const div = document.getElementById("div-saved-loops")
        div.textContent = ""

        const selection = document.getElementById("select-video-names")
        selection.innerHTML = "<option disabled selected value>-- select saved video --</option>"

        console.log("Sign-out successful!")
    }).catch((error) => {
        console.log("An error occured during sign-out.")
    })
}

function argsort(arr) {
  return arr.map((val, idx) => [val, idx])
            .sort(([a], [b]) => a > b ? 1 : -1)
            .map(([, idx]) => idx)
}

async function connect() {
    let uid
    try {
        uid = auth.currentUser.uid
        console.log(`Logged in as ${uid}`)
    } catch {
        console.log("No sign-in detected.")
        return
    }
    const ref = doc(db, "users", uid)

    window.render = async (currentVideoId) => {
        const data = window.doc_data

        // Repopulate current loops.
        function repopulateLoops(videoId) {
            const div = document.getElementById("div-saved-loops")
            div.textContent = ""

            const loops = Object.values(data).filter(
                item => item.videoId == videoId
            )

            const times = loops.map(loop => {
                const start = window.secondsToMinuteSeconds(loop.start)
                const end = window.secondsToMinuteSeconds(loop.end)
                const out = `${start}-${end}`
                return out
            })
            const sortedIdx = argsort(times)

            sortedIdx.forEach(i => {
                div.appendChild(window.loopComponent(loops[i]))
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
    window.unsubscribe = onSnapshot(ref, (doc) => {
        window.doc_data = doc.data()
        render(window.PLAYER.getVideoData().video_id)
    })

    // Append a single loop.
    window.appendFirebase = async (newItem) => {
        await setDoc(ref, newItem, { merge: true })
    }

    // Remove a single loop.
    window.removeLoopFromFirebase = async (key) => {
        await updateDoc(ref, {[key]: deleteField()})
    }

    // Rename title of a video.
    window.renameVideoTitle = async (videoId, newTitle) => {
        const newItems = {}
        Object.keys(window.doc_data).forEach(key => {
            if (window.doc_data[key].videoId == videoId) {
                newItems[key] = {...window.doc_data[key], title: newTitle}
            }
        })

        await updateDoc(ref, newItems)
    }
}
window.connect = connect
document.getElementById("btn-auth").addEventListener("click", handleGoogleAuth)
document.getElementById("btn-signout").addEventListener("click", handleSignOut)