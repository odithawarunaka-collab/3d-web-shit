import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

function splitChars(selector) {
    document.querySelectorAll(selector).forEach((el) => {
        const text = el.innerText;
        el.innerHTML = text
            .split("")
            .map((ch) =>
                ch === " "
                    ? "&nbsp;"
                    : `<span class="char"><span>${ch}</span></span>`
            )
            .join("");
    });
}
;

function splitLines(selector, lineClass) {
    document.querySelectorAll(selector).forEach((el) => {
        const words = el.innerText.trim().split(/\s+/);
        el.innerHTML = words
            .map((w) => `<span class="${lineClass}"><span>${w}&nbsp;</span></span>`)
            .join("");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    
    // Snap between sections
    const sectionTops = () => [
        0,
        document.querySelector(".product-overview").offsetTop,
        document.querySelector(".outro").offsetTop,
    ];
    
    let isSnapping = false;
    lenis.on("scroll", ({ scroll, velocity }) => {
        if (isSnapping) return;
        const tops = sectionTops();
        const snapThreshold = 5; // px/s minimum velocity to trigger snap
    
        if (Math.abs(velocity) < snapThreshold) return;
    
        // Find closest section
        const closest = tops.reduce((prev, curr) =>
            Math.abs(curr - scroll) < Math.abs(prev - scroll) ? curr : prev
        );
    
        if (Math.abs(closest - scroll) < window.innerHeight * 0.4) {
            isSnapping = true;
            lenis.scrollTo(closest, {
                duration: 1.2,
                easing: (t) => 1 - Math.pow(1 - t, 4),
                onComplete: () => { isSnapping = false; }
            });
        }
    });

    splitChars(".header-1 h1");
    splitLines(".tooltip .title h2", "line");
    splitLines(".tooltip .description p", "line");

    gsap.set(".tooltip .title .line, .tooltip .description .line", {
        overflow: "hidden",
        display: "block",
    });
    gsap.set(
        ".tooltip .icon ion-icon, .tooltip .title .line > span, .tooltip .description .line > span",
        { y: "125%" }
    );

    // Fix: push header-2 off screen on load so it doesn't overlap header-1
    gsap.set(".header-2", { xPercent: 100 });

    const animOptions = { duration: 1, ease: "power3.out", stagger: 0.025 };
    const tooltipSelectors = [
        {
            trigger: 0.65,
            elements: [
                ".tooltip:nth-child(1) .icon ion-icon",
                ".tooltip:nth-child(1) .title .line > span",
                ".tooltip:nth-child(1) .description .line > span",
            ],
        },
        {
            trigger: 0.85,
            elements: [
                ".tooltip:nth-child(2) .icon ion-icon",
                ".tooltip:nth-child(2) .title .line > span",
                ".tooltip:nth-child(2) .description .line > span",
            ],
        },
    ];

    ScrollTrigger.create({
        trigger: ".product-overview",
        start: "75% bottom",
        onEnter: () =>
            gsap.to(".header-1 h1 .char > span", {
                y: "0%", duration: 1, ease: "power3.out", stagger: 0.025,
            }),
        onLeaveBack: () =>
            gsap.to(".header-1 h1 .char > span", {
                y: "100%", duration: 1, ease: "power3.out", stagger: 0.025,
            }),
    });

    // ── Three.js setup ──────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.querySelector(".model-container").appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
    mainLight.position.set(1, 2, 3);
    mainLight.castShadow = true;
    mainLight.shadow.bias = -0.001;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
    fillLight.position.set(-2, 0, -1);
    scene.add(fillLight);

    // ── Model files — swap paths when you have real models ──────
    const modelFiles = [
        "/basic_t-shirt.glb",
        "/basic_t-shirt2.glb", // replace with model 2
        "/male_cargo_pants.glb", // replace with model 3
    ];

    const models = [];
    let loadedCount = 0;
    let activeIndex = 0;
    let isTransitioning = false;

    function centerModel(m) {
        // Reset first, then center by bounding box
        m.position.set(0, 0, 0);
        m.rotation.set(0, 0, 0);
        const box = new THREE.Box3().setFromObject(m);
        const center = box.getCenter(new THREE.Vector3());
        m.position.set(-center.x, -center.y, -center.z);
        m.scale.set(0.8, 0.8, 0.8);
        return box.getSize(new THREE.Vector3());
    }

    modelFiles.forEach((path, index) => {
        new GLTFLoader().load(path, (gltf) => {
            const m = gltf.scene;
            m.traverse((node) => {
                if (node.isMesh && node.material) {
                    Object.assign(node.material, { metalness: 0.05, roughness: 0.9 });
                }
            });

            const size = centerModel(m);
            m.userData.size = size;
            m.visible = false;
            scene.add(m);
            models[index] = m;

            loadedCount++;
            if (loadedCount === modelFiles.length) {
                // All models loaded — set up camera from model 0 and show it
                const s = models[0].userData.size;
                camera.position.set(0, 0, Math.max(s.x, s.y, s.z) * (window.innerWidth < 1000 ? 2 : 0.9));
                camera.lookAt(0, 0, 0);
                models[0].visible = true;
                activeIndex = 0;
            }
        });
    });

    function transitionToModel(newIndex) {
        if (isTransitioning || newIndex === activeIndex) return;
        if (!models[activeIndex] || !models[newIndex]) return;

        isTransitioning = true;

        const outModel = models[activeIndex];
        const inModel = models[newIndex];

        // Re-centre incoming model cleanly before sliding in
        centerModel(inModel);
        inModel.visible = true;

        const s = inModel.userData.size;
        const slideAmount = Math.max(s.x, s.y, s.z) * 4;

        // Slide out to left
        gsap.to(outModel.position, {
            x: -slideAmount,
            duration: 0.7,
            ease: "power3.inOut",
            onComplete: () => {
                outModel.visible = false;
                // Re-centre outgoing model silently so it's ready next time
                centerModel(outModel);
                isTransitioning = false;
            }
        });

        // Slide in from right
        inModel.position.x += slideAmount;
        gsap.to(inModel.position, {
            x: inModel.position.x - slideAmount,
            duration: 0.7,
            ease: "power3.inOut",
        });

        activeIndex = newIndex;
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (models[activeIndex]) {
            const s = models[activeIndex].userData.size;
            camera.position.set(0, 0, Math.max(s.x, s.y, s.z) * (window.innerWidth < 1000 ? 2 : 0.9));
            camera.lookAt(0, 0, 0);
        }
    });

    // ── Main scroll trigger ─────────────────────────────────────
    ScrollTrigger.create({
        trigger: ".product-overview",
        start: "top top",
        end: `+=${window.innerHeight * 10}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: ({ progress }) => {

            // Header 1
            const headerProgress = Math.max(0, Math.min(1, (progress - 0.05) / 0.3));
            gsap.set(".header-1", {
                xPercent: progress < 0.05 ? 0 : progress > 0.35 ? -100 : -100 * headerProgress,
            });

            // Circular mask
            const makeSize =
                progress < 0.2 ? 0
                : progress > 0.5 ? 100
                : 100 * ((progress - 0.02) / 0.1);
            gsap.set(".circular-mask", { clipPath: `circle(${makeSize}% at 50% 50%)` });

            // Header 2
            const header2Progress = (progress - 0.15) / 0.35;
            const header2XPercent =
                progress < 0.15 ? 100
                : progress > 0.5 ? -200
                : 100 - 300 * header2Progress;
            gsap.set(".header-2", { xPercent: header2XPercent });

            // Dividers
            const scaleX =
                progress < 0.45 ? 0
                : progress > 0.65 ? 1
                : (progress - 0.45) / 0.2;
            gsap.set(".tooltip .divider", { scaleX });

            // Tooltip text
            tooltipSelectors.forEach(({ trigger, elements }) => {
                gsap.to(elements, {
                    y: progress >= trigger ? "0%" : "125%",
                    ...animOptions,
                });
            });

            // ── Model logic ─────────────────────────────────────
            if (loadedCount < modelFiles.length) return;

            const modelProgress = Math.max(0, (progress - 0.05) / 0.95);
            const segmentSize = 1 / 3;
            const targetIndex = Math.min(2, Math.floor(modelProgress / segmentSize));

            if (targetIndex !== activeIndex && !isTransitioning) {
                transitionToModel(targetIndex);
            }

            // Absolute Y rotation — always update regardless of transition
            if (models[activeIndex]) {
                const segmentStart = activeIndex * segmentSize;
                const segmentProgress = Math.max(0, Math.min(1,
                    (modelProgress - segmentStart) / segmentSize
                ));
                models[activeIndex].rotation.y = Math.PI * 4 * segmentProgress;
            }
        },
    });

    // ── ALEKO nav ───────────────────────────────────────────────
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove("active"));
            this.classList.add("active");
        });
    });

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