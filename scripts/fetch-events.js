import { db, auth } from './firebase-config.js';

import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const eventsContainer = document.getElementById("events-container");
const messageBox = document.getElementById("messageBox");

let currentUserUID = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserUID = user.uid;
    loadEvents();
  } else {
    alert("Please log in to book events.");
    window.location.href = "../pages/login.html";
  }
});

async function loadEvents() {
  try {
    const q = query(collection(db, "events"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      messageBox.textContent = "No events found.";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const event = docSnap.data();
      const eventId = docSnap.id;

      const eventCard = document.createElement("div");
      eventCard.classList.add("event-card");

      eventCard.innerHTML = `
        <h2>${event.title}</h2>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Time:</strong> ${event.time}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Description:</strong> ${event.description}</p>
        <button class="book-btn" data-id="${eventId}" data-title="${event.title}">Book Now</button>
      `;

      eventsContainer.appendChild(eventCard);
    });

    attachBookingListeners();
  } catch (error) {
    console.error("Error fetching events:", error);
    messageBox.textContent = "Error loading events.";
  }
}

function attachBookingListeners() {
  const buttons = document.querySelectorAll(".book-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const eventId = btn.getAttribute("data-id");
      const eventTitle = btn.getAttribute("data-title");

      try {
        await addDoc(collection(db, "bookings"), {
          userId: currentUserUID,
          eventId,
          eventTitle,
          timestamp: new Date()
        });

        btn.disabled = true;
        btn.textContent = "Booked ✅";
        btn.style.backgroundColor = "#aaa";
        messageBox.style.color = "green";
        messageBox.textContent = `Booked "${eventTitle}" successfully!`;
      } catch (error) {
        console.error("Booking failed:", error);
        messageBox.style.color = "red";
        messageBox.textContent = "Failed to book event.";
      }
    });
  });
}
