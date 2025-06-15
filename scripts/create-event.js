import { db, auth } from './firebase-config.js';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const eventForm = document.getElementById("eventForm");
const messageBox = document.getElementById("messageBox");

let currentUserUID = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUID = user.uid;

    const userDoc = await (await getDoc(doc(db, "users", currentUserUID))).data();
    if (userDoc.role !== "organizer") {
      alert("Access denied. Only organizers can create events.");
      window.location.href = "../index.html";
    }
  } else {
    alert("Please login first.");
    window.location.href = "../pages/login.html";
  }
});

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const venue = document.getElementById("venue").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !date || !time || !venue || !description) {
    messageBox.textContent = "All fields are required.";
    messageBox.style.color = "red";
    return;
  }

  try {
    const eventRef = await addDoc(collection(db, "events"), {
      title,
      date,
      time,
      venue,
      description,
      createdBy: currentUserUID,
      timestamp: serverTimestamp()
    });

    messageBox.textContent = "Event created successfully!";
    messageBox.style.color = "green";
    eventForm.reset();
  } catch (error) {
    console.error("Error adding event: ", error);
    messageBox.textContent = "Error creating event.";
    messageBox.style.color = "red";
  }
});
