import { initializeApp, getApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult,
  browserLocalPersistence, setPersistence,
  sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink,
  onAuthStateChanged, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase web config is public by design. Protect data with Firebase Security Rules.
const firebaseConfig = {
  apiKey: "AIzaSyBHJcZVTFfKKEpPphQR4IpPzbzrDbo_tkk",
  authDomain: "project-prototype-1-2d8d2.firebaseapp.com",
  projectId: "project-prototype-1-2d8d2",
  storageBucket: "project-prototype-1-2d8d2.firebasestorage.app",
  messagingSenderId: "539135917374",
  appId: "1:539135917374:web:31a361d87eb82aaa00406f",
  measurementId: "G-DXC937R6WH"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const PENDING_EMAIL_KEY = "firebasePendingSignInEmail";
const $ = (id) => document.getElementById(id);

let profileElementsReady = false;
let currentUser = null;
let customPhotoPath = null;

function showMessage(message, isError = false) {
  const status = $("authStatus");
  if (!status) { alert(message); return; }
  status.textContent = message;
  status.style.color = isError ? "#ff7777" : "inherit";
  status.hidden = false;
}
function hideMessage() {
  const status = $("authStatus");
  if (status) { status.textContent = ""; status.hidden = true; }
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

function ensureProfileUI() {
  if (profileElementsReady) return;
  const content = document.querySelector(".login-modal-content");
  if (!content) return;
  const profile = document.createElement("section");
  profile.id = "accountProfile";
  profile.className = "account-profile";
  profile.hidden = true;
  profile.innerHTML = `
    <div class="profile-avatar-wrap">
      <img id="profileAvatar" alt="Your profile picture" />
      <label class="profile-photo-label" for="profilePhotoInput">Change photo</label>
      <input id="profilePhotoInput" type="file" accept="image/png,image/jpeg,image/webp" hidden />
    </div>
    <label class="profile-field-label" for="profileDisplayName">Display name</label>
    <input id="profileDisplayName" type="text" maxlength="60" autocomplete="name" placeholder="Your name" />
    <div class="profile-actions">
      <button id="saveProfileBtn" class="primary-btn" type="button">Save profile</button>
      <button id="removeProfilePhotoBtn" class="profile-secondary-btn" type="button">Remove photo</button>
      <button id="signOutBtn" class="profile-secondary-btn" type="button">Sign out</button>
    </div>
    <p class="profile-hint">PNG, JPG or WebP. Maximum file size: 5 MB.</p>
  `;
  content.appendChild(profile);
  $("profilePhotoInput").addEventListener("change", handlePhotoUpload);
  $("saveProfileBtn").addEventListener("click", saveProfile);
  $("removeProfilePhotoBtn").addEventListener("click", removeProfilePhoto);
  $("signOutBtn").addEventListener("click", async () => {
    try { await signOut(auth); closeLoginModal(); }
    catch (error) { console.error(error); showMessage("Could not sign out. Please try again.", true); }
  });
  profileElementsReady = true;
}

function updateLoginUI(user) {
  currentUser = user || null;
  const loginButton = $("loginBtn");
  if (loginButton) {
    loginButton.textContent = user ? "My Account" : "Login";
    loginButton.classList.toggle("logged-in", Boolean(user));
    loginButton.onclick = () => {
      if (user) openLoginModal();
      else openLoginModal();
    };
  }
  const loginControls = [
    $("userEmail"), $("emailContinueBtn"), $("googleSignInBtn"),
    document.querySelector(".login-divider")
  ];
  loginControls.forEach((element) => {
    if (element) element.hidden = Boolean(user);
  });
  const title = $("loginModalTitle");
  if (title) title.textContent = user ? "Your Account" : "Sign In / Log In";
  const profile = $("accountProfile");
  if (profile) profile.hidden = !user;
  if (user) populateProfile(user);
}

function populateProfile(user) {
  ensureProfileUI();
  const profile = $("accountProfile");
  if (!profile) return;
  profile.hidden = false;
  $("profileDisplayName").value = user.displayName || "";
  $("profileAvatar").src = user.photoURL || defaultAvatarDataUri();
  $("profileAvatar").onerror = () => { $("profileAvatar").src = defaultAvatarDataUri(); };
  $("removeProfilePhotoBtn").hidden = !user.photoURL;
  loadProfileRecord(user).catch((error) => {
    console.error("Profile read error:", error);
    showMessage("Your account is signed in, but profile details could not be loaded.", true);
  });
}

function defaultAvatarDataUri() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="64" fill="#1e3a8a"/><circle cx="64" cy="47" r="23" fill="#bfdbfe"/><path d="M20 119c5-25 21-38 44-38s39 13 44 38" fill="#bfdbfe"/></svg>';
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

async function loadProfileRecord(user) {
  const snapshot = await getDoc(doc(db, "users", user.uid));
  if (!snapshot.exists()) return;
  const data = snapshot.data();
  if (data.displayName && $("profileDisplayName") && !$("profileDisplayName").value) {
    $("profileDisplayName").value = data.displayName;
  }
  customPhotoPath = data.photoPath || null;
  if (data.photoURL) {
    $("profileAvatar").src = data.photoURL;
    $("removeProfilePhotoBtn").hidden = false;
  }
}

async function saveProfile() {
  if (!currentUser) return;
  const button = $("saveProfileBtn");
  const displayName = $("profileDisplayName").value.trim();
  if (!displayName) { showMessage("Please enter a display name.", true); return; }
  button.disabled = true;
  try {
    await updateProfile(currentUser, { displayName });
    await setDoc(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid,
      displayName,
      email: currentUser.email || null,
      photoURL: currentUser.photoURL || null,
      photoPath: customPhotoPath,
      updatedAt: serverTimestamp()
    }, { merge: true });
    showMessage("Profile saved.");
    updateLoginUI(currentUser);
  } catch (error) {
    console.error("Profile save error:", error);
    showMessage(error.message || "Could not save your profile.", true);
  } finally {
    button.disabled = false;
  }
}

async function handlePhotoUpload(event) {
  if (!currentUser) return;
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!file) return;
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) { showMessage("Choose a JPG, PNG or WebP image.", true); return; }
  if (file.size > 5 * 1024 * 1024) { showMessage("The image must be 5 MB or smaller.", true); return; }

  const button = $("saveProfileBtn");
  button.disabled = true;
  try {
    const path = `users/${currentUser.uid}/profile/avatar`;
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file, { contentType: file.type });
    const photoURL = await getDownloadURL(imageRef);
    await updateProfile(currentUser, { photoURL });
    customPhotoPath = path;
    await setDoc(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || $("profileDisplayName").value.trim() || null,
      email: currentUser.email || null,
      photoURL,
      photoPath: path,
      updatedAt: serverTimestamp()
    }, { merge: true });
    $("profileAvatar").src = photoURL;
    $("removeProfilePhotoBtn").hidden = false;
    showMessage("Profile picture updated.");
  } catch (error) {
    console.error("Profile photo upload error:", error);
    showMessage(error.message || "Could not upload the profile picture.", true);
  } finally {
    button.disabled = false;
  }
}

async function removeProfilePhoto() {
  if (!currentUser) return;
  const button = $("removeProfilePhotoBtn");
  button.disabled = true;
  try {
    if (customPhotoPath) {
      try { await deleteObject(ref(storage, customPhotoPath)); }
      catch (error) { if (error.code !== "storage/object-not-found") throw error; }
    }
    const providerPhoto = currentUser.providerData.find((item) => item.photoURL)?.photoURL || null;
    await updateProfile(currentUser, { photoURL: providerPhoto });
    customPhotoPath = null;
    await setDoc(doc(db, "users", currentUser.uid), {
      photoURL: providerPhoto,
      photoPath: null,
      updatedAt: serverTimestamp()
    }, { merge: true });
    $("profileAvatar").src = providerPhoto || defaultAvatarDataUri();
    button.hidden = true;
    showMessage("Profile picture removed.");
  } catch (error) {
    console.error("Profile photo removal error:", error);
    showMessage(error.message || "Could not remove the profile picture.", true);
  } finally {
    button.disabled = false;
  }
}

async function handleGoogleSignIn() {
  hideMessage();
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithRedirect(auth, googleProvider);
  }
  catch (error) { console.error(error); showMessage(error.message || "Google sign-in failed.", true); }
}

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
  button.disabled = true;
  try {
    const completionUrl = window.location.origin + window.location.pathname;
    await sendSignInLinkToEmail(auth, email, { url: completionUrl, handleCodeInApp: true });
    localStorage.setItem(PENDING_EMAIL_KEY, email);
    showMessage("Sign-in link sent. Check your email and open the link in this browser.");
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Could not send the sign-in link.", true);
  } finally { button.disabled = false; }
}

async function completeEmailLinkSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return;
  let email = localStorage.getItem(PENDING_EMAIL_KEY);
  if (!email) email = window.prompt("Enter the email address where you received the sign-in link:");
  if (!email) { showMessage("Email is required to finish signing in.", true); openLoginModal(); return; }
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailLink(auth, email.trim(), window.location.href);
    localStorage.removeItem(PENDING_EMAIL_KEY);
    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    closeLoginModal();
    showMessage("Email sign-in successful.");
  } catch (error) {
    console.error(error);
    showMessage("This sign-in link may be expired or already used. Request a new link and try again.", true);
    openLoginModal();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  ensureProfileUI();
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
    if (event.target?.dataset?.close === "true") closeLoginModal();
  });

  // Register the auth-state listener before processing redirect results so the
  // navigation button always reflects Firebase's persisted signed-in state.
  onAuthStateChanged(auth, (user) => {
    updateLoginUI(user);
    if (user) closeLoginModal();
  }, (error) => {
    console.error("Firebase auth-state error:", error);
    showMessage("Could not verify your sign-in state. Refresh and try again.", true);
  });

  try { await getRedirectResult(auth); }
  catch (error) { console.error(error); showMessage("Google sign-in did not complete. Please try again.", true); }

  try { await completeEmailLinkSignIn(); }
  catch (error) { console.error(error); }
});
