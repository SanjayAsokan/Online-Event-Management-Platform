import { db, auth } from './firebase-config.js';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const welcomeMessage = document.getElementById("welcomeMessage");
const recentBookings = document.getElementById("recentBookings");
const logoutBtn = document.getElementById("logoutBtn");
const userDisplay = document.getElementById("userDisplay");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in!");
    window.location.href = "../index.html";
    return;
  }

  const uid = user.uid;

  userDisplay.textContent = user.email || "Logged In";

  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      welcomeMessage.className = "welcomeMessage"
      welcomeMessage.innerText = `Welcome, ${userData.name || "User"} 👋`;
    }
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }

  try {
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("userId", "==", uid),
      orderBy("timestamp", "desc"),
      limit(2)
    );
    const snapshot = await getDocs(bookingsQuery);

    recentBookings.innerHTML = "";

    if (snapshot.empty) {
      recentBookings.innerHTML = "<p>You haven't booked any events yet.</p>";
    } else {
      for (const docSnap of snapshot.docs) {
        const booking = docSnap.data();
        const eventDoc = await getDoc(doc(db, "events", booking.eventId));
        const eventTitle = eventDoc.exists() ? eventDoc.data().title : "Unknown Event";

        const card = document.createElement("div");
        card.className = "testimonial-card";
        card.innerHTML = `
          <p><strong>${eventTitle}</strong><br>
          Booking Time: ${new Date(booking.timestamp.seconds * 1000).toLocaleString()}</p>
          <span>Ticket Confirmed</span>
        `;

        const feedbackBtn = document.createElement("a");
        feedbackBtn.href = `../pages/feedback.html?eventId=${booking.eventId}`;
        feedbackBtn.textContent = "Give Feedback";
        feedbackBtn.className = "feedback-button";
        card.appendChild(feedbackBtn);

        recentBookings.appendChild(card);
      }
    }
  } catch (err) {
    recentBookings.innerHTML = "<p>Error loading bookings.</p>";
    console.error("Bookings fetch failed:", err);
  }
});

logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "../index.html";
});
