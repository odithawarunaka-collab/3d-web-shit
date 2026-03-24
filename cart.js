import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyD-WY_vQ731f0k_fcCGBPxWmjenNxz0iQ4",
  authDomain: "aleko-5cb62.firebaseapp.com",
  projectId: "aleko-5cb62",
  storageBucket: "aleko-5cb62.firebasestorage.app",
  messagingSenderId: "667088576013",
  appId: "1:667088576013:web:0ef265ed89de465a423f44"
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── State ─────────────────────────────────────────────────────────────────────
let cartItems   = [];
let currentUser = null;
let unsubCart   = null;

// ── Firestore ─────────────────────────────────────────────────────────────────
function cartRef(uid) {
  return doc(db, "carts", uid);
}
async function saveCart() {
  if (!currentUser) return;
  await setDoc(cartRef(currentUser.uid), { items: cartItems });
}

// ── Auth listener ─────────────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (unsubCart) { unsubCart(); unsubCart = null; }

  if (user) {
    unsubCart = onSnapshot(cartRef(user.uid), (snap) => {
      cartItems = snap.exists() ? (snap.data().items || []) : [];
      renderCart();
      updateCartCount();
    });
  } else {
    cartItems = [];
    renderCart();
    updateCartCount();
  }
});

// ── Add to cart ───────────────────────────────────────────────────────────────
export async function addToCart(product) {
  if (!currentUser) {
    document.getElementById("authOverlay")?.classList.add("open");
    return;
  }
  const existing = cartItems.find(i => i.id === product.id && i.color === product.color);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ ...product, qty: 1 });
  }
  await saveCart();
  openCart();
}

// ── Remove / update ───────────────────────────────────────────────────────────
async function removeItem(id, color) {
  cartItems = cartItems.filter(i => !(i.id === id && i.color === color));
  await saveCart();
}
async function updateQty(id, color, delta) {
  const item = cartItems.find(i => i.id === id && i.color === color);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cartItems = cartItems.filter(i => !(i.id === id && i.color === color));
  await saveCart();
}
async function clearCart() {
  cartItems = [];
  await saveCart();
}

// ── Cart count ────────────────────────────────────────────────────────────────
function updateCartCount() {
  const total = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const els   = document.querySelectorAll(".cart-count");
  if (els.length === 0) { setTimeout(updateCartCount, 100); return; }
  els.forEach(el => { el.textContent = total; });
}

// ── Open / close ──────────────────────────────────────────────────────────────
export function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartBackdrop")?.classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartBackdrop")?.classList.remove("open");
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderCart() {
  const body   = document.getElementById("cartBody");
  const footer = document.getElementById("cartFooter");
  if (!body || !footer) { setTimeout(renderCart, 100); return; }

  if (!currentUser) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🔒</div>
        <p>Sign in to view your cart</p>
        <button class="cart-signin-btn" onclick="document.getElementById('authOverlay').classList.add('open');closeCartDrawer()">
          Sign In
        </button>
      </div>`;
    footer.style.display = "none";
    return;
  }

  if (cartItems.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
        </div>
        <p>Your cart is empty</p>
        <span>Add something to get started</span>
      </div>`;
    footer.style.display = "none";
    return;
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total    = subtotal + shipping;

  body.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <div class="cart-item-image" style="background:${item.gradient}">
        <span class="cart-item-label">${item.label}</span>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">
          <span class="cart-item-color" style="background:${item.color}"></span>
          <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
        <div class="cart-item-controls">
          <div class="cart-qty">
            <button class="qty-btn" onclick="cartQty('${item.id}','${item.color}',-1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="cartQty('${item.id}','${item.color}',1)">+</button>
          </div>
          <button class="cart-remove" onclick="cartRemove('${item.id}','${item.color}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  `).join("");

  footer.style.display = "block";
  footer.innerHTML = `
    <div class="cart-summary">
      <div class="cart-summary-row">
        <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Shipping</span>
        <span>${shipping === 0 ? '<em>Free</em>' : '$' + shipping.toFixed(2)}</span>
      </div>
      ${shipping > 0 ? `<div class="cart-free-shipping">Add $${(100 - subtotal).toFixed(2)} more for free shipping</div>` : ""}
      <div class="cart-summary-row total">
        <span>Total</span><span>$${total.toFixed(2)}</span>
      </div>
    </div>
    <button class="cart-checkout-btn">
      Proceed to Checkout
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
    <button class="cart-clear-btn" onclick="cartClearAll()">Clear cart</button>
  `;
}

// ── Global window functions for inline onclick ────────────────────────────────
window.cartQty        = (id, color, delta) => updateQty(id, color, delta);
window.cartRemove     = (id, color)        => removeItem(id, color);
window.cartClearAll   = ()                 => clearCart();
window.closeCartDrawer = closeCart;

// ── Inject drawer into DOM ────────────────────────────────────────────────────
export function injectCartDrawer() {
  if (document.getElementById("cartDrawer")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="cart-backdrop" id="cartBackdrop" onclick="closeCartDrawer()"></div>
    <div class="cart-drawer" id="cartDrawer">
      <div class="cart-drawer-header">
        <div class="cart-drawer-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Your Cart
        </div>
        <button class="cart-drawer-close" onclick="closeCartDrawer()">✕</button>
      </div>
      <div class="cart-body" id="cartBody"></div>
      <div class="cart-footer" id="cartFooter"></div>
    </div>
  `);

  // Open cart on navbar button click
  document.addEventListener("click", (e) => {
    if (e.target.closest(".cart-button")) openCart();
  });
}