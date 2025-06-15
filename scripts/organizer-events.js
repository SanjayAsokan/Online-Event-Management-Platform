import { db, auth } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const container = document.getElementById('events-container');
const messageBox = document.getElementById('messageBox');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const q = query(collection(db, "events"), where("createdBy", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      messageBox.textContent = "You haven't created any events yet.";
      return;
    }

    querySnapshot.forEach(docSnap => {
      const event = docSnap.data();
      const card = document.createElement('div');
      card.className = 'event-card';
      card.setAttribute('data-id', docSnap.id);
      card.innerHTML = renderEventCard(event, docSnap.id);
      container.appendChild(card);
    });

  } else {
    messageBox.textContent = "You must be logged in to view your events.";
  }
});

container.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const eventId = btn.getAttribute("data-id");
  const card = btn.closest(".event-card");

  if (btn.classList.contains("delete-btn")) {
    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (confirmDelete) {
      await deleteDoc(doc(db, "events", eventId));
      card.remove();
      alert("Event deleted successfully!");
    }
  }

  if (btn.classList.contains("edit-btn")) {
    const title = card.querySelector("h2").innerText;
    const date = card.querySelector("p:nth-of-type(1)").innerText.replace("Date: ", "");
    const location = card.querySelector("p:nth-of-type(2)").innerText.replace("Location: ", "");
    const description = card.querySelector("p:nth-of-type(3)").innerText.replace("Description: ", "");
    card.innerHTML = renderEditForm(eventId, title, date, location, description);
  }

  if (btn.classList.contains("save-btn")) {
    const updated = {
      title: card.querySelector(".edit-title").value,
      date: card.querySelector(".edit-date").value,
      location: card.querySelector(".edit-location").value,
      description: card.querySelector(".edit-description").value
    };
    try {
      await updateDoc(doc(db, "events", eventId), updated);
      card.innerHTML = renderEventCard(updated, eventId);
      alert("Event updated!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update event.");
    }
  }

  if (btn.classList.contains("cancel-btn")) {
    const originalEvent = await getDoc(doc(db, "events", eventId));
    if (originalEvent.exists()) {
      card.innerHTML = renderEventCard(originalEvent.data(), eventId);
    }
  }
});

function renderEventCard(event, id) {
  return `
    <h2>${event.title}</h2>
    <p><strong>Date:</strong> ${event.date}</p>
    <p><strong>Location:</strong> ${event.venue}</p>
    <p><strong>Description:</strong> ${event.description}</p>
    <div class="event-actions">
      <button class="edit-btn" data-id="${id}">Edit</button>
      <button class="delete-btn" data-id="${id}">Delete</button>
    </div>
  `;
}

function renderEditForm(id, title, date, venue, description) {
  return `
    <input class="edit-title" type="text" value="${title}" />
    <input class="edit-date" type="date" value="${date}" />
    <input class="edit-location" type="text" value="${venue}" />
    <textarea class="edit-description">${description}</textarea>
    <div class="event-actions">
      <button class="save-btn" data-id="${id}">Save</button>
      <button class="cancel-btn" data-id="${id}">Cancel</button>
    </div>
  `;
}
