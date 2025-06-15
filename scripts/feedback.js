import { auth, db } from '../scripts/firebase-config.js';
import {
  doc, getDoc, setDoc, serverTimestamp, collection
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const eventId = new URLSearchParams(window.location.search).get("eventId");
const eventTitleInput = document.getElementById("eventTitle");
const ratingInput = document.getElementById("rating");
const commentInput = document.getElementById("comment");
const form = document.getElementById("feedbackForm");
const messageBox = document.getElementById("messageBox");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to give feedback.");
    window.location.href = "../index.html";
    return;
  }

  currentUser = user;

  try {
    const eventDoc = await getDoc(doc(db, "events", eventId));
    if (eventDoc.exists()) {
      eventTitleInput.value = eventDoc.data().title || "Untitled Event";
    } else {
      messageBox.textContent = "Event not found.";
      form.style.display = "none";
    }
  } catch (err) {
    console.error("Error loading event:", err);
    messageBox.textContent = "Could not load event info.";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const feedbackRef = doc(collection(db, "feedbacks"));
    await setDoc(feedbackRef, {
      userId: currentUser.uid,
      eventId,
      rating: parseInt(ratingInput.value),
      comment: commentInput.value,
      timestamp: serverTimestamp()
    });

    messageBox.style.color = "green";
    messageBox.textContent = "Feedback submitted successfully!";
    form.reset();
  } catch (err) {
    console.error("Error submitting feedback:", err);
    messageBox.style.color = "red";
    messageBox.textContent = "Failed to submit feedback.";
  }
});
