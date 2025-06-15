import { db, auth } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const speakerForm = document.getElementById('speakerForm');
const messageBox = document.getElementById('messageBox');
const speakerList = document.getElementById('speakerList');
const eventSelect = document.getElementById('eventSelect');

let organizerId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in.");
    window.location.href = "../index.html";
    return;
  }

  organizerId = user.uid;
  await loadEventOptions();
  await loadSpeakers();
});

async function loadEventOptions() {
  const q = query(collection(db, "events"), where("createdBy", "==", organizerId));
  const snap = await getDocs(q);

  snap.forEach(docSnap => {
    const option = document.createElement('option');
    option.value = docSnap.id;
    option.textContent = docSnap.data().title;
    eventSelect.appendChild(option);
  });
}

speakerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const topic = document.getElementById('topic').value;
  const bio = document.getElementById('bio').value;
  const time = document.getElementById('time').value;
  const eventId = document.getElementById('eventSelect').value;

  try {
    await addDoc(collection(db, "speakers"), {
      name, topic, bio, time, eventId, organizerId
    });
    messageBox.textContent = "Speaker added!";
    speakerForm.reset();
    speakerList.innerHTML = "";
    await loadSpeakers();
  } catch (error) {
    console.error(error);
    messageBox.textContent = "Error adding speaker.";
  }
});

async function loadSpeakers() {
  const q = query(collection(db, "speakers"), where("organizerId", "==", organizerId));
  const snap = await getDocs(q);

  if (snap.empty) {
    speakerList.innerHTML = "<p>No speakers added yet.</p>";
    return;
  }

  snap.forEach(docSnap => {
    const s = docSnap.data();
    const div = document.createElement("div");
    div.className = "speaker-card";
    div.innerHTML = `
      <h3>${s.name}</h3>
      <p><strong>Topic:</strong> ${s.topic}</p>
      <p><strong>Bio:</strong> ${s.bio}</p>
      <p><strong>Time:</strong> ${s.time}</p>
    `;
    speakerList.appendChild(div);
  });
}
