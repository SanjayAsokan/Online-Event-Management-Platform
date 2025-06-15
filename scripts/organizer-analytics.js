import { db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const messageBox = document.getElementById("messageBox");
const chartCanvas = document.getElementById("ratingChart");
let organizerId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in.");
    window.location.href = "../index.html";
    return;
  }

  organizerId = user.uid;
  loadAnalytics();
});

async function loadAnalytics() {
  try {
    const eventsQuery = query(collection(db, "events"), where("createdBy", "==", organizerId));
    const eventsSnap = await getDocs(eventsQuery);

    if (eventsSnap.empty) {
      messageBox.textContent = "No events found.";
      return;
    }

    const eventData = [];

    for (const eventDoc of eventsSnap.docs) {
      const event = eventDoc.data();
      const eventId = eventDoc.id;

      const feedbackQuery = query(collection(db, "feedbacks"), where("eventId", "==", eventId));
      const feedbackSnap = await getDocs(feedbackQuery);

      let totalRating = 0;
      let count = 0;

      feedbackSnap.forEach((fb) => {
        totalRating += fb.data().rating;
        count++;
      });

      if (count > 0) {
        const avg = (totalRating / count).toFixed(2);
        eventData.push({ title: event.title, avgRating: avg, count });
      }
    }

    if (eventData.length === 0) {
      messageBox.textContent = "No feedback found for your events.";
      return;
    }

    drawChart(eventData);
  } catch (err) {
    console.error("Analytics error:", err);
    messageBox.textContent = "Failed to load analytics.";
  }
}

function drawChart(data) {
  const labels = data.map(d => d.title);
  const avgRatings = data.map(d => d.avgRating);
  const counts = data.map(d => d.count);

  new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Average Rating',
          data: avgRatings,
          backgroundColor: '#1d3557'
        },
        {
          label: 'Feedback Count',
          data: counts,
          backgroundColor: '#e76f51'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 5
        }
      }
    }
  });
}
