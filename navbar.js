import { injectCartDrawer } from "./cart.js";

import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "./firebase.js";

// ── Detect active page for nav highlight ──────────────────────────────────────
const path = window.location.pathname;
const isShop = path.includes("shop");

// ── Inject navbar HTML ────────────────────────────────────────────────────────
document.getElementById("navbar").innerHTML = `
  <header class="navbar">
    <a href="/index.html" class="logo">
      <span class="logo-icon">◈</span>
      <span class="logo-text">ALEKO</span>
    </a>
    <nav class="nav-links">
      <a href="/index.html"  ${!isShop ? 'class="active"' : ""}>Home</a>
      <a href="/shop.html"   ${isShop  ? 'class="active"' : ""}>Shop</a>
      <a href="#">Sale</a>
      <a href="#">Blog</a>
      <a href="#">Showcase</a>
    </nav>
    <div class="nav-actions" id="navActions">
      <button class="cart-button" id="cartBtn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <span class="cart-count">0</span>
      </button>
      <button class="login-button" id="loginBtn">Login</button>
      <button class="signup-button" id="signupBtn">Sign Up</button>
    </div>
  </header>
`;

// ── Inject auth modal HTML ────────────────────────────────────────────────────
document.getElementById("authModal").innerHTML = `
  <div class="auth-overlay" id="authOverlay">
    <div class="auth-modal">
      <button class="auth-close" id="authClose">✕</button>

      <div class="auth-logo">
        <span class="auth-logo-icon">◈</span>
        ALEKO
      </div>

      <div class="auth-tabs">
        <button class="auth-tab active" id="tabLogin">Sign In</button>
        <button class="auth-tab" id="tabSignup">Create Account</button>
      </div>

      <!-- LOGIN -->
      <div id="formLogin">
        <button class="auth-google" id="googleLoginBtn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div class="auth-divider">
          <div class="auth-divider-line"></div>
          <span>or sign in with email</span>
          <div class="auth-divider-line"></div>
        </div>
        <div class="auth-message" id="loginMessage"></div>
        <form id="loginForm">
          <div class="auth-field">
            <label>Email</label>
            <input type="email" id="loginEmail" placeholder="you@example.com" required>
          </div>
          <div class="auth-field">
            <label>Password</label>
            <input type="password" id="loginPassword" placeholder="••••••••" required>
          </div>
          <button type="submit" class="auth-submit" id="loginSubmit">Sign In</button>
        </form>
      </div>

      <!-- SIGNUP -->
      <div id="formSignup" style="display:none">
        <button class="auth-google" id="googleSignupBtn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div class="auth-divider">
          <div class="auth-divider-line"></div>
          <span>or sign up with email</span>
          <div class="auth-divider-line"></div>
        </div>
        <div class="auth-message" id="signupMessage"></div>
        <form id="signupForm">
          <div class="auth-field">
            <label>Email</label>
            <input type="email" id="signupEmail" placeholder="you@example.com" required>
          </div>
          <div class="auth-field">
            <label>Password</label>
            <input type="password" id="signupPassword" placeholder="Min. 6 characters" required>
          </div>
          <div class="auth-field">
            <label>Confirm Password</label>
            <input type="password" id="signupConfirm" placeholder="••••••••" required>
          </div>
          <button type="submit" class="auth-submit" id="signupSubmit">Create Account</button>
        </form>
      </div>

    </div>
  </div>
`;

// ── Navbar scroll effect ──────────────────────────────────────────────────────
window.addEventListener("scroll", () => {
  const nb = document.querySelector(".navbar");
  if (!nb) return;
  nb.style.background = window.scrollY > 20
    ? "rgba(10,10,10,0.92)"
    : "rgba(255,255,255,0.04)";
  nb.style.borderColor = window.scrollY > 20
    ? "rgba(255,255,255,0.14)"
    : "rgba(255,255,255,0.1)";
});

// ── Nav link active state (for # links only) ──────────────────────────────────
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href && href !== "#") return;
    e.preventDefault();
    document.querySelectorAll(".nav-links a").forEach(l => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// ── Modal open / close ────────────────────────────────────────────────────────
function openModal(tab = "login") {
  document.getElementById("authOverlay").classList.add("open");
  switchTab(tab);
}
function closeModal() {
  document.getElementById("authOverlay").classList.remove("open");
  clearMessages();
}

document.getElementById("loginBtn").addEventListener("click",  () => openModal("login"));
document.getElementById("signupBtn").addEventListener("click", () => openModal("signup"));
document.getElementById("authClose").addEventListener("click", closeModal);
document.getElementById("authOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("authOverlay")) closeModal();
});

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchTab(tab) {
  const tabLogin   = document.getElementById("tabLogin");
  const tabSignup  = document.getElementById("tabSignup");
  const formLogin  = document.getElementById("formLogin");
  const formSignup = document.getElementById("formSignup");
  if (tab === "login") {
    tabLogin.classList.add("active");    tabSignup.classList.remove("active");
    formLogin.style.display = "block";  formSignup.style.display = "none";
  } else {
    tabSignup.classList.add("active");  tabLogin.classList.remove("active");
    formSignup.style.display = "block"; formLogin.style.display = "none";
  }
  clearMessages();
}
document.getElementById("tabLogin").addEventListener("click",  () => switchTab("login"));
document.getElementById("tabSignup").addEventListener("click", () => switchTab("signup"));

// ── Messages ──────────────────────────────────────────────────────────────────
function showMessage(id, text, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `auth-message ${type}`;
}
function clearMessages() {
  document.querySelectorAll(".auth-message").forEach(el => {
    el.className = "auth-message";
    el.textContent = "";
  });
}

// ── Friendly errors ───────────────────────────────────────────────────────────
function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":  "This email is already registered.",
    "auth/invalid-email":         "Please enter a valid email address.",
    "auth/weak-password":         "Password must be at least 6 characters.",
    "auth/user-not-found":        "No account found with this email.",
    "auth/wrong-password":        "Incorrect password. Try again.",
    "auth/too-many-requests":     "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user":  "Sign-in popup was closed.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

// ── Google sign-in ────────────────────────────────────────────────────────────
document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try { await signInWithPopup(auth, googleProvider); closeModal(); }
  catch (e) { showMessage("loginMessage", friendlyError(e.code)); }
});
document.getElementById("googleSignupBtn").addEventListener("click", async () => {
  try { await signInWithPopup(auth, googleProvider); closeModal(); }
  catch (e) { showMessage("signupMessage", friendlyError(e.code)); }
});

// ── Email login ───────────────────────────────────────────────────────────────
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const btn      = document.getElementById("loginSubmit");
  btn.disabled   = true; btn.textContent = "Signing in...";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal();
  } catch (err) {
    showMessage("loginMessage", friendlyError(err.code));
  } finally {
    btn.disabled = false; btn.textContent = "Sign In";
  }
});

// ── Email signup ──────────────────────────────────────────────────────────────
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email    = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm  = document.getElementById("signupConfirm").value;
  const btn      = document.getElementById("signupSubmit");
  if (password !== confirm) { showMessage("signupMessage", "Passwords don't match."); return; }
  btn.disabled = true; btn.textContent = "Creating account...";
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMessage("signupMessage", "Account created! Welcome to ALEKO.", "success");
    setTimeout(closeModal, 1200);
  } catch (err) {
    showMessage("signupMessage", friendlyError(err.code));
  } finally {
    btn.disabled = false; btn.textContent = "Create Account";
  }
});

// ── Auth state ────────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  const loginBtn  = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const navActions = document.getElementById("navActions");

  if (user) {
    loginBtn?.remove();
    signupBtn?.remove();

    if (!document.getElementById("userMenu")) {
      const initial = user.displayName
        ? user.displayName[0].toUpperCase()
        : user.email[0].toUpperCase();

      navActions.insertAdjacentHTML("beforeend", `
        <div class="user-menu" id="userMenu">
          <div class="user-avatar-placeholder" id="userAvatarBtn">${initial}</div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown-name">${user.displayName || "ALEKO Member"}</div>
            <div class="user-dropdown-email">${user.email}</div>
            <div class="user-dropdown-item signout" id="signOutBtn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Sign out
            </div>
          </div>
        </div>
      `);

      document.getElementById("userAvatarBtn").addEventListener("click", (e) => {
        e.stopPropagation();
        document.getElementById("userDropdown").classList.toggle("open");
      });
      document.addEventListener("click", () => {
        document.getElementById("userDropdown")?.classList.remove("open");
      });
      document.getElementById("signOutBtn").addEventListener("click", async () => {
        await signOut(auth);
        window.location.reload();
      });
    }
  }
});
// ── Init cart drawer ──────────────────────────────────────────────────────────
injectCartDrawer();