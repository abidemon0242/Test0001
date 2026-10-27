
import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Replace YOUR_API_KEY with the apiKey shown in Firebase Console.
// Keep the other values exactly as shown here.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "project-prototype-1-2d8d2.firebaseapp.com",
  projectId: "project-prototype-1-2d8d2",
  storageBucket: "project-prototype-1-2d8d2.firebasestorage.app",
  messagingSenderId: "539135917374",
  appId: "1:539135917374:web:31a361d87eb82aaa00406f",
  measurementId: "G-DXC937R6WH"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const PENDING_EMAIL_KEY = "firebasePendingSignInEmail";

const $ = (id) => document.getElementById(id);

function showMessage(message, isError = false) {
  const status = $("authStatus");
  if (!status) {
    alert(message);
    return;
  }

  status.textContent = message;
  status.style.color = isError ? "#ff7777" : "inherit";
  status.hidden = false;
}

function hideMessage() {
  const status = $("authStatus");
  if (status) {
    status.textContent = "";
    status.hidden = true;
  }
}

function openLoginModal() {
  const modal = $("loginModal");
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeLoginModal() {
  const modal = $("loginModal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  hideMessage();
}

function updateLoginUI(user) {
  const loginButton = $("loginBtn");
  if (!loginButton) return;

  loginButton.textContent = user
    ? `Sign out (${user.displayName || user.email || "Account"})`
    : "Login";

  loginButton.classList.toggle("logged-in", Boolean(user));
  loginButton.onclick = () => {
    if (auth.currentUser) {
      signOut(auth).catch((error) => {
        console.error(error);
        showMessage("Could not sign out. Please try again.", true);
      });
    } else {
      openLoginModal();
    }
  };

  const googleButton = $("googleAuthButton");
  const emailButton = $("emailContinueBtn");

  if (googleButton) googleButton.disabled = Boolean(user);
  if (emailButton) emailButton.disabled = Boolean(user);
}

// Google sign-in: redirect flow is generally suitable for mobile browsers.
async function handleGoogleSignIn() {
  hideMessage();

  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error("Google sign-in error:", error);
    showMessage(error.message || "Google sign-in failed.", true);
  }
}

// Send a passwordless sign-in link to the user's email.
async function handleEmailSignIn() {
  hideMessage();

  const emailInput = $("userEmail");
  const button = $("emailContinueBtn");
  const email = emailInput?.value.trim();

  if (!email || !emailInput.checkValidity()) {
    emailInput?.focus();
    showMessage("Enter a valid email address.", true);
    return;
  }

  if (button) button.disabled = true;

  try {
    const completionUrl =
      window.location.origin + window.location.pathname;

    await sendSignInLinkToEmail(auth, email, {
      url: completionUrl,
      handleCodeInApp: true
    });

    localStorage.setItem(PENDING_EMAIL_KEY, email);
    showMessage("Sign-in link sent. Check your email and open the link in this browser.");
  } catch (error) {
    console.error("Email-link error:", error);
    showMessage(error.message || "Could not send the sign-in link.", true);
  } finally {
    if (button) button.disabled = false;
  }
}

// Complete email-link sign-in when the user returns from their email.
async function completeEmailLinkSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return;

  let email = localStorage.getItem(PENDING_EMAIL_KEY);

  if (!email) {
    email = window.prompt(
      "Enter the email address where you received the sign-in link:"
    );
  }

  if (!email) {
    showMessage("Email is required to finish signing in.", true);
    openLoginModal();
    return;
  }

  try {
    await signInWithEmailLink(auth, email.trim(), window.location.href);
    localStorage.removeItem(PENDING_EMAIL_KEY);

    // Remove authentication parameters from the address bar.
    window.history.replaceState(
      {},
      document.title,
      window.location.origin + window.location.pathname
    );

    closeLoginModal();
    showMessage("Email sign-in successful.");
  } catch (error) {
    console.error("Email-link completion error:", error);
    showMessage(
      "This sign-in link may be expired or already used. Request a new link and try again.",
      true
    );
    openLoginModal();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const googleContainer = $("googleSignInBtn");

  if (googleContainer && !$("googleAuthButton")) {
    const button = document.createElement("button");
    button.id = "googleAuthButton";
    button.type = "button";
    button.className = "primary-btn";
    button.textContent = "Continue with Google";
    button.style.width = "100%";
    googleContainer.replaceChildren(button);
    button.addEventListener("click", handleGoogleSignIn);
  }

  $("emailContinueBtn")?.addEventListener("click", handleEmailSignIn);
  $("closeLoginModal")?.addEventListener("click", closeLoginModal);

  $("loginModal")?.addEventListener("click", (event) => {
    if (event.target?.dataset?.close === "true") {
      closeLoginModal();
    }
  });

  try {
    await getRedirectResult(auth);
  } catch (error) {
    console.error("Google redirect result error:", error);
    showMessage("Google sign-in did not complete. Please try again.", true);
  }

  onAuthStateChanged(auth, (user) => {
    updateLoginUI(user);
    if (user) closeLoginModal();
  });

  try {
    await completeEmailLinkSignIn();
  } catch (error) {
    console.error("Email-link handling error:", error);
  }
});
