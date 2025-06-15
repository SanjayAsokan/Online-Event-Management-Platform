// admin-dashboard.js
import { db, auth } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const adminWelcome = document.getElementById('adminWelcome');
const adminEmailDisplay = document.getElementById('adminEmailDisplay');
const totalUsersEl = document.getElementById('totalUsers');
const totalEventsEl = document.getElementById('totalEvents');
const userList = document.getElementById('userList');
const eventList = document.getElementById('eventList');
const newEventList = document.getElementById('newEventList');
const completedEventList = document.getElementById('completedEventList');

const overviewSection = document.getElementById('overviewSection');
const usersSection = document.getElementById('usersSection');
const eventsSection = document.getElementById('eventsSection');
const newEventsSection = document.getElementById('newEventsSection');
const completedEventsSection = document.getElementById('completedEventsSection');

const overviewTab = document.getElementById('overviewTab');
const usersTab = document.getElementById('usersTab');
const eventsTab = document.getElementById('eventsTab');
const newEventsTab = document.getElementById('newEventsTab');
const completedEventsTab = document.getElementById('completedEventsTab');

function showSection(section) {
  overviewSection.classList.add('hidden');
  usersSection.classList.add('hidden');
  eventsSection.classList.add('hidden');
  newEventsSection.classList.add('hidden');
  completedEventsSection.classList.add('hidden');

  overviewTab.classList.remove('active');
  usersTab.classList.remove('active');
  eventsTab.classList.remove('active');
  newEventsTab.classList.remove('active');
  completedEventsTab.classList.remove('active');

  if (section === 'overview') {
    overviewSection.classList.remove('hidden');
    overviewTab.classList.add('active');
  } else if (section === 'users') {
    usersSection.classList.remove('hidden');
    usersTab.classList.add('active');
  } else if (section === 'events') {
    eventsSection.classList.remove('hidden');
    eventsTab.classList.add('active');
  } else if (section === 'newEvents') {
    newEventsSection.classList.remove('hidden');
    newEventsTab.classList.add('active');
  } else if (section === 'completedEvents') {
    completedEventsSection.classList.remove('hidden');
    completedEventsTab.classList.add('active');
  }
}

overviewTab.addEventListener('click', () => showSection('overview'));
usersTab.addEventListener('click', () => showSection('users'));
eventsTab.addEventListener('click', () => showSection('events'));
newEventsTab.addEventListener('click', () => showSection('newEvents'));
completedEventsTab.addEventListener('click', () => showSection('completedEvents'));

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = '../index.html';
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    adminEmailDisplay.textContent = user.email;

    try {
      const usersSnapshot = await getDocs(query(collection(db, 'users'), orderBy('timestamp', 'desc')));
      totalUsersEl.textContent = usersSnapshot.size;

      let index = 1;
      userList.innerHTML = '';
      usersSnapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index++}</td>
          <td>${userData.name || '-'}</td>
          <td>${userData.email}</td>
          <td>${userData.role}</td>
          <td>${userData.timestamp?.seconds ? new Date(userData.timestamp.seconds * 1000).toLocaleString() : '-'}</td>
        `;
        userList.appendChild(tr);
      });

      const eventsSnapshot = await getDocs(query(collection(db, 'events'), orderBy('date', 'desc')));
      totalEventsEl.textContent = eventsSnapshot.size;

      let eIndex = 1;
      eventList.innerHTML = '';
      newEventList.innerHTML = '';
      completedEventList.innerHTML = '';
      let newIndex = 1, completeIndex = 1;
      const now = new Date();

      for (const docSnap of eventsSnapshot.docs) {
        const eventData = docSnap.data();
        const eventDate = new Date(eventData.date);
        const organizerId = eventData.organizerId || eventData.createdBy || '-';

        let organizerName = '-';
        if (organizerId) {
          const orgDoc = await getDoc(doc(db, 'users', organizerId));
          if (orgDoc.exists()) {
            organizerName = orgDoc.data().name || orgDoc.data().email || '-';
          }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${eIndex++}</td>
          <td>${eventData.title}</td>
          <td>${eventData.date}</td>
          <td>${eventData.venue}</td>
          <td>${organizerName}</td>
        `;
        eventList.appendChild(tr);

        const categorizedTr = document.createElement('tr');
        categorizedTr.innerHTML = `
          <td>${eventDate > now ? newIndex++ : completeIndex++}</td>
          <td>${eventData.title}</td>
          <td>${eventData.date}</td>
          <td>${eventData.venue}</td>
          <td>${organizerName}</td>
        `;

        if (eventDate > now) {
          newEventList.appendChild(categorizedTr);
        } else {
          completedEventList.appendChild(categorizedTr);
        }
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  } else {
    window.location.href = '../index.html';
  }
});
