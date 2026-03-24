import { auth, db, doc, getDoc, setDoc, onSnapshot, onAuthStateChanged } from "./firebase.js";

// ── Cart state ────────────────────────────────────────────────────────────────
let cartItems    = [];   // live array of { id, name, price, color, qty, label, gradient }
let unsubscribe  = null; // Firestore listener cleanup
let currentUser  = null;

// ── Firestore helpers ─────────────────────────────────────────────────────────
function cartRef(uid) {
  return doc(db, "carts", uid);
}

async function saveCart(items) {
  if (!currentUser) return;
  await setDoc(cartRef(currentUser.uid), { items });
}

// ── Listen to auth — load/unload cart on login/logout ─────────────────────────
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  // Unsubscribe previous listener
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }

  if (user) {
    // Real-time listener — cart updates instantly across tabs/devices
    unsubscribe = onSnapshot(cartRef(user.uid), (snap) => {
      cartItems = snap.exists() ? (snap.data().items || []) : [];
      renderCart();
      updateCartCount();
    });
  } else {
    // Logged out — clear cart display
    cartItems = [];
    renderCart();
    updateCartCount();
  }
});

// ── Add item to cart ──────────────────────────────────────────────────────────
export async function addToCart(product) {
  if (!currentUser) {
    // Not logged in — open auth modal
    document.getElementById("authOverlay")?.classList.add("open");
    return;
  }

  const existing = cartItems.find(i => i.id === product.id && i.color === product.color);
  if (existing) {
    existing.qty += 1;
  } else {
    cartItems.push({ ...product, qty: 1 });
  }

  await saveCart(cartItems);
  openCart();
}

// ── Remove item ───────────────────────────────────────────────────────────────
async function removeItem(id, color) {
  cartItems = cartItems.filter(i => !(i.id === id && i.color === color));
  await saveCart(cartItems);
}

// ── Update quantity ───────────────────────────────────────────────────────────
async function updateQty(id, color, delta) {
  const item = cartItems.find(i => i.id === id && i.color === color);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cartItems = cartItems.filter(i => !(i.id === id && i.color === color));
  }
  await saveCart(cartItems);
}

// ── Clear cart ────────────────────────────────────────────────────────────────
async function clearCart() {
  cartItems = [];
  await saveCart([]);
}

// ── Cart count badge ──────────────────────────────────────────────────────────
function updateCartCount() {
  const total = cartItems.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? "flex" : "flex";
  });
}

// ── Open / close cart drawer ──────────────────────────────────────────────────
export function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartBackdrop")?.classList.add("open");
}
function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartBackdrop")?.classList.remove("open");
}

// ── Render cart drawer ────────────────────────────────────────────────────────
function renderCart() {
  const body    = document.getElementById("cartBody");
  const footer  = document.getElementById("cartFooter");
  if (!body) return;

  if (!currentUser) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🔒</div>
        <p>Sign in to view your cart</p>
        <button class="cart-signin-btn" onclick="document.getElementById('authOverlay').classList.add('open'); closeCartDrawer()">
          Sign In
        </button>
      </div>
    `;
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
      </div>
    `;
    footer.style.display = "none";
    return;
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 100 ? 0 : 9.99;
  const total    = subtotal + shipping;

  body.innerHTML = cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}" data-color="${item.color}">
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
        <span>Subtotal</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Shipping</span>
        <span>${shipping === 0 ? '<em>Free</em>' : '$' + shipping.toFixed(2)}</span>
      </div>
      ${shipping > 0 ? `<div class="cart-free-shipping">Add $${(100 - subtotal).toFixed(2)} more for free shipping</div>` : ''}
      <div class="cart-summary-row total">
        <span>Total</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>
    <button class="cart-checkout-btn">
      Proceed to Checkout
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
    <button class="cart-clear-btn" onclick="cartClearAll()">Clear cart</button>
  `;
}

// ── Global functions (called from inline onclick) ─────────────────────────────
window.cartQty       = (id, color, delta) => updateQty(id, color, delta);
window.cartRemove    = (id, color)        => removeItem(id, color);
window.cartClearAll  = ()                 => clearCart();
window.closeCartDrawer = closeCart;

// ── Inject cart drawer HTML into page ─────────────────────────────────────────
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

  // Cart button opens drawer
  document.addEventListener("click", (e) => {
    if (e.target.closest(".cart-button")) openCart();
  });
}