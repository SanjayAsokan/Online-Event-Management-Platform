import { db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const feedbackContainer = document.getElementById("feedbackSummary");
const feedbackDetails = document.getElementById("feedbackDetails");
const eventName = document.getElementById("eventName");
const feedbackList = document.getElementById("feedbackList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login to view your event feedback.");
    window.location.href = "../index.html";
    return;
  }

  try {
    const eventsQuery = query(collection(db, "events"), where("createdBy", "==", user.uid));
    const eventsSnap = await getDocs(eventsQuery);

    if (eventsSnap.empty) {
      feedbackContainer.innerHTML = "<p>You haven't created any events yet.</p>";
      return;
    }

    feedbackContainer.innerHTML = "";

    for (const eventDoc of eventsSnap.docs) {
      const eventId = eventDoc.id;
      const eventData = eventDoc.data();

      const feedbackQuery = query(collection(db, "feedbacks"), where("eventId", "==", eventId));
      const feedbackSnap = await getDocs(feedbackQuery);

      const eventCard = document.createElement("div");
      eventCard.classList.add("event-card");
      eventCard.innerHTML = `
        <h3>${eventData.title}</h3>
        <p><strong>Date:</strong> ${eventData.date}</p>
        <p><strong>Feedbacks:</strong> ${feedbackSnap.size}</p>
        <button class="view-btn" data-event-id="${eventId}" data-event-title="${eventData.title}">View Feedback</button>
      `;

      feedbackContainer.appendChild(eventCard);

      eventCard.querySelector(".view-btn").addEventListener("click", async () => {
        eventName.textContent = eventData.title;
        feedbackList.innerHTML = "";

        const viewSnap = await getDocs(query(collection(db, "feedbacks"), where("eventId", "==", eventId)));

        if (viewSnap.empty) {
          feedbackList.innerHTML = "<li>No feedback received yet.</li>";
        } else {
          viewSnap.forEach(doc => {
            const { rating, comment } = doc.data();
            const li = document.createElement("li");
            li.innerHTML = `<strong>${rating}★</strong> - ${comment}`;
            feedbackList.appendChild(li);
          });
        }

        feedbackDetails.style.display = "block";
      });
    }
  } catch (err) {
    console.error("Error loading feedback:", err);
    feedbackContainer.innerHTML = "<p>Error loading feedback.</p>";
  }
});
