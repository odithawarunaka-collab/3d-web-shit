document.addEventListener("DOMContentLoaded", () => {

    // ── Nav active state ──────────────────────────────────────────────────────
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach(link => {
      link.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (href && href !== "#") return; // let real links navigate normally
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove("active"));
        this.classList.add("active");
      });
    });
  
    // ── Navbar scroll effect ──────────────────────────────────────────────────
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        navbar.style.background = "rgba(10,10,10,0.85)";
        navbar.style.borderColor = "rgba(255,255,255,0.14)";
      } else {
        navbar.style.background = "rgba(255,255,255,0.04)";
        navbar.style.borderColor = "rgba(255,255,255,0.1)";
      }
    });
  
  });