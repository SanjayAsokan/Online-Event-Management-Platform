import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (signupBtn) {
    signupBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;
      const messageBox = document.getElementById('register-message');
      messageBox.textContent = '';

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        await setDoc(doc(db, "users", uid), {
          name: name,
          email: email,
          role: role,
          timestamp: serverTimestamp()
        });
        messageBox.style.color = "green";
        messageBox.textContent = "Registration successful! Redirecting...";
        setTimeout(() => window.location.href = "login.html", 500);
      } catch (error) {
        messageBox.style.color = "red";
        messageBox.textContent = error.message;
      }
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const messageBox = document.getElementById('login-message');
      messageBox.textContent = '';
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          messageBox.style.color = "green";
          messageBox.textContent = "Login successful! Redirecting...";
          setTimeout(() => {
            if (role === "organizer") {
              window.location.href = "organizer-dashboard.html";
            }
            else if (role === "user") {
              window.location.href = "user-dashboard.html";
            }
            else {
              window.location.href = "admin-dashboard.html";

            }
          }, 1000);
        }
        else {
          throw new Error("User role not found in database.");
        }
      } catch (error) {
        messageBox.style.color = "red";
        messageBox.textContent = error.message;
      }
    });
  }
});
