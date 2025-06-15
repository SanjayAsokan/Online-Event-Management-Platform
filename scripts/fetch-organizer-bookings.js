import { db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const bookingList = document.getElementById('booking-list');
const messageBox = document.getElementById('messageBox');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;

    try {
      const eventsQuery = query(collection(db, "events"), where("createdBy", "==", uid));
      const eventsSnapshot = await getDocs(eventsQuery);

      if (eventsSnapshot.empty) {
        messageBox.textContent = "You haven't created any events yet.";
        return;
      }

      let foundBookings = false;

      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data();
        const eventId = eventDoc.id;

        const bookingsQuery = query(
          collection(db, "bookings"),
          where("eventId", "==", eventId)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);

        if (!bookingsSnapshot.empty) {
          foundBookings = true;

          for (const bookingDoc of bookingsSnapshot.docs) {
            const bookingData = bookingDoc.data();

            let userName = "Unknown";
            let userEmail = "N/A";

            try {
              const userRef = doc(db, "users", bookingData.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userDetails = userSnap.data();
                userName = userDetails.name || "User";
                userEmail = userDetails.email || "No Email";
              }
            } catch (userErr) {
              console.warn("User fetch failed for", bookingData.userId, userErr);
            }

            const card = document.createElement('div');
            card.className = 'booking-card';
            card.innerHTML = `
              <h3>${eventData.title}</h3>
              <p><strong>Booked By:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Booking Time:</strong> ${bookingData.timestamp?.seconds
                ? new Date(bookingData.timestamp.seconds * 1000).toLocaleString()
                : "Unknown"
              }</p>
            `;
            bookingList.appendChild(card);
          }
        }
      }

      if (!foundBookings) {
        messageBox.textContent = "No bookings found for your events.";
      }

    } catch (error) {
      console.error("Error fetching bookings:", error);
      messageBox.textContent = "An error occurred while loading bookings.";
    }

  } else {
    messageBox.textContent = "You must be logged in to view bookings.";
  }
});
