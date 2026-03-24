import { addToCart } from "./cart.js";

// ── Product data ─────────────────────────────────────────────────────────────
const products = [
  {
    id: 1, name: "Oversized Blank Tee",
    category: "tees", price: 38, oldPrice: null,
    colors: ["#ffffff", "#0a0a0a", "#e8ff47"],
    badges: ["new", "custom"], label: "TEE",
    gradient: "linear-gradient(135deg,#1a1a1a,#2a2a2a)"
  },
  {
    id: 2, name: "Drop Shoulder Hoodie",
    category: "hoodies", price: 72, oldPrice: 95,
    colors: ["#0a0a0a", "#3b3b3b", "#7c3aed"],
    badges: ["sale", "custom"], label: "HDY",
    gradient: "linear-gradient(135deg,#0d0d1a,#1a1030)"
  },
  {
    id: 3, name: "Cargo Wide Leg Pant",
    category: "pants", price: 85, oldPrice: null,
    colors: ["#2d2d1f", "#0a0a0a", "#5f5f3a"],
    badges: ["new"], label: "PNT",
    gradient: "linear-gradient(135deg,#141410,#201e10)"
  },
  {
    id: 4, name: "Embroidered Bomber",
    category: "jackets", price: 140, oldPrice: 180,
    colors: ["#1a0a0a", "#0a0a0a", "#6b2222"],
    badges: ["sale", "custom"], label: "JKT",
    gradient: "linear-gradient(135deg,#1a0808,#100505)"
  },
  {
    id: 5, name: "Ribbed Cropped Tee",
    category: "tees", price: 32, oldPrice: null,
    colors: ["#f5f5f0", "#c8c8c0", "#e8ff47"],
    badges: ["custom"], label: "TEE",
    gradient: "linear-gradient(135deg,#1c1c1c,#252525)"
  },
  {
    id: 6, name: "Utility Track Pant",
    category: "pants", price: 68, oldPrice: null,
    colors: ["#0a0a0a", "#1a2a1a", "#2a3a2a"],
    badges: ["new", "custom"], label: "PNT",
    gradient: "linear-gradient(135deg,#0a100a,#101810)"
  },
  {
    id: 7, name: "Zip-Up Graphic Hoodie",
    category: "hoodies", price: 88, oldPrice: 110,
    colors: ["#ffffff", "#e8ff47", "#0a0a0a"],
    badges: ["sale"], label: "HDY",
    gradient: "linear-gradient(135deg,#191919,#1f1f1f)"
  },
  {
    id: 8, name: "Canvas Tote Bag",
    category: "accessories", price: 28, oldPrice: null,
    colors: ["#f5f0e8", "#0a0a0a", "#e8ff47"],
    badges: ["new", "custom"], label: "ACC",
    gradient: "linear-gradient(135deg,#151510,#1a1a10)"
  },
  {
    id: 9, name: "Relaxed Coach Jacket",
    category: "jackets", price: 120, oldPrice: null,
    colors: ["#0a0a0a", "#1a2a1a", "#e8ff47"],
    badges: ["custom"], label: "JKT",
    gradient: "linear-gradient(135deg,#080f08,#0f180f)"
  },
  {
    id: 10, name: "Washed Boxy Tee",
    category: "tees", price: 42, oldPrice: 55,
    colors: ["#2d1f1f", "#1a1a2a", "#3a2d2d"],
    badges: ["sale", "custom"], label: "TEE",
    gradient: "linear-gradient(135deg,#130a0a,#0d0a13)"
  },
  {
    id: 11, name: "Structured Snapback",
    category: "accessories", price: 35, oldPrice: null,
    colors: ["#0a0a0a", "#ffffff", "#e8ff47"],
    badges: ["new", "custom"], label: "CAP",
    gradient: "linear-gradient(135deg,#101010,#1a1a1a)"
  },
  {
    id: 12, name: "Heavyweight Crewneck",
    category: "hoodies", price: 95, oldPrice: null,
    colors: ["#2a1f2a", "#0a0a0a", "#e8c0ff"],
    badges: ["new", "custom"], label: "CRW",
    gradient: "linear-gradient(135deg,#100810,#180818)"
  },
];

// ── Badge HTML map ────────────────────────────────────────────────────────────
const badgeLabels = {
  new:    '<span class="badge badge-new">New</span>',
  custom: '<span class="badge badge-custom">Customizable</span>',
  sale:   '<span class="badge badge-sale">Sale</span>',
};

// ── State ─────────────────────────────────────────────────────────────────────
let activeFilter = "all";

// ── Expose handleAddToCart globally for inline onclick ────────────────────────
window.handleAddToCart = handleAddToCart;

// ── Card HTML builder ─────────────────────────────────────────────────────────
function buildCardHTML(p, index) {
  return `
    <div class="product-card" style="animation-delay:${index * 0.05 + 0.05}s">
      <div class="card-image">
        <div class="card-image-bg" style="background:${p.gradient}">
          <span class="card-image-icon">${p.label}</span>
        </div>
        <div class="card-badges">
          ${p.badges.map(b => badgeLabels[b]).join("")}
        </div>
        <button class="card-wishlist" onclick="toggleWishlist(this)" title="Wishlist">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
        <div class="card-overlay">
          <button class="card-overlay-btn" onclick="handleAddToCart(event, ${p.id})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Customize & Add
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category.toUpperCase()}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-footer">
          <div class="card-price">
            <span class="price-current">$${p.price}</span>
            ${p.oldPrice ? `<span class="price-old">$${p.oldPrice}</span>` : ""}
          </div>
          <div class="card-colors">
            ${p.colors.map(c => `<div class="color-dot" style="background:${c}" title="${c}"></div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Render products ───────────────────────────────────────────────────────────
function renderProducts(filter = "all") {
  const grid     = document.getElementById("productGrid");
  const filtered = filter === "all" ? products : products.filter(p => p.category === filter);
  document.getElementById("resultCount").textContent =
    `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`;
  grid.innerHTML = filtered.map((p, i) => buildCardHTML(p, i)).join("");
}

// ── Wishlist toggle ───────────────────────────────────────────────────────────
function toggleWishlist(btn) {
  btn.classList.toggle("liked");
  btn.querySelector("svg").setAttribute("fill", btn.classList.contains("liked") ? "#ef4444" : "none");
}

// ── Add to cart ───────────────────────────────────────────────────────────────
async function handleAddToCart(e, productId) {
  e.stopPropagation();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const btn = e.currentTarget;
  btn.disabled = true;
  btn.textContent = "Adding...";

  // Use first color as default selected color
  await addToCart({
    id:       product.id,
    name:     product.name,
    price:    product.price,
    color:    product.colors[0],
    label:    product.label,
    gradient: product.gradient,
  });

  btn.textContent = "✓ Added!";
  btn.style.background = "#22c55e";
  setTimeout(() => {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      Customize & Add
    `;
    btn.style.background = "";
    btn.disabled = false;
  }, 1400);
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
document.getElementById("filterTabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".filter-tab");
  if (!tab) return;
  document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  activeFilter = tab.dataset.filter;
  renderProducts(activeFilter);
});

// ── Custom dropdown ───────────────────────────────────────────────────────────
const customSelect   = document.getElementById("customSelect");
const selectTrigger  = document.getElementById("selectTrigger");
const selectDropdown = document.getElementById("selectDropdown");
const selectLabel    = document.getElementById("selectLabel");

selectTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  customSelect.classList.toggle("open");
});

selectDropdown.addEventListener("click", (e) => {
  const option = e.target.closest(".custom-select-option");
  if (!option) return;
  const val = option.dataset.value;
  selectLabel.textContent = option.textContent;
  document.querySelectorAll(".custom-select-option").forEach(o => o.classList.remove("active"));
  option.classList.add("active");
  customSelect.classList.remove("open");

  const filtered = activeFilter === "all"
    ? [...products]
    : products.filter(p => p.category === activeFilter);

  if (val === "price-asc")  filtered.sort((a, b) => a.price - b.price);
  if (val === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (val === "newest")     filtered.reverse();

  document.getElementById("productGrid").innerHTML =
    filtered.map((p, i) => buildCardHTML(p, i)).join("");
});

document.addEventListener("click", () => customSelect.classList.remove("open"));

// ── Init ──────────────────────────────────────────────────────────────────────
renderProducts();