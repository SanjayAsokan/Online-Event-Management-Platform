import { db, auth } from './firebase-config.js';

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const bookingsContainer = document.getElementById("bookings-container");
const messageBox = document.getElementById("messageBox");

let currentUserUID = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUserUID = user.uid;
    loadUserBookings();
  } else {
    alert("Please login to view your bookings.");
    window.location.href = "../pages/login.html";
  }
});

async function loadUserBookings() {
  try {
    const q = query(collection(db, "bookings"), where("userId", "==", currentUserUID));
    const bookingsSnap = await getDocs(q);

    if (bookingsSnap.empty) {
      messageBox.textContent = "You haven't booked any events yet.";
      return;
    }

    for (const bookingDoc of bookingsSnap.docs) {
      const { eventId, eventTitle } = bookingDoc.data();

      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) continue;

      const event = eventSnap.data();

      const bookingCard = document.createElement("div");
      bookingCard.classList.add("booking-card");

      bookingCard.innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        <p class="tag">Booked ✅</p>
        <a href="../pages/feedback.html?eventId=${eventId}" class="feedback-btn">Give Feedback</a>
      `;

      bookingsContainer.appendChild(bookingCard);
    }
  } catch (error) {
    console.error("Error loading bookings:", error);
    messageBox.textContent = "Failed to load bookings.";
  }
}
