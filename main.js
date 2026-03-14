import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

// Free vanilla JS replacements for GSAP SplitText (paid Club plugin)
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

    const animOptions = { duration: 1, ease: "power3.out", stagger: 0.025 };
    const tooltipSelectors = [
        {
            trigger: 0.65,
            elements: [
                ".tooltip:nth-child(1) .icon ion-icon",
                ".tooltip:nth-child(1) .title .line > span",
                ".tooltip:nth-child(1) .description .line > span"
            ],
        },
        {
            trigger: 0.85,
            elements: [
                ".tooltip:nth-child(2) .icon ion-icon",
                ".tooltip:nth-child(2) .title .line > span",
                ".tooltip:nth-child(2) .description .line > span"
            ],
        },
    ];

    ScrollTrigger.create({
        trigger: ".product-overview",
        start: "75% bottom",
        onEnter: () =>
            gsap.to(".header-1 h1 .char > span", {
                y: "0%",
                duration: 1,
                ease: "power3.out",
                stagger: 0.025,
            }),
        onLeaveBack: () =>
            gsap.to(".header-1 h1 .char > span", {
                y: "100%",
                duration: 1,
                ease: "power3.out",
                stagger: 0.025,
            }),
    });

    let model,
        currentRotation = 0,
        modelSize;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.LinearEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.querySelector(".model-container").appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 2.5));

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(1, 2, 3);
    mainLight.castShadow = true;
    mainLight.shadow.bias = -0.001;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
    fillLight.position.set(-2, 0, -1);
    scene.add(fillLight);

    function setupModel() {
        if (!model || !modelSize) return;

        const isMobile = window.innerWidth < 1000;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());

        // The next line likely has a bug:
        // modelSize * 1 is not correct, modelSize is a Vector3 (from getSize).
        // Should use modelSize.x, modelSize.y, modelSize.z as needed.
        // Fix: modelSize.x where this is intended to be a dimension.
        model.position.set(
            isMobile ? 0 : -modelSize.x * 0,
            -center.y + modelSize.y * -0.05,
            -center.z
        );
        
        model.rotation.z = 0;

        const cameraDistance = isMobile ? 2 : 1.0;
        camera.position.set(
            0,
            0,
            Math.max(modelSize.x, modelSize.y, modelSize.z) * cameraDistance
        );
        camera.lookAt(0, 0, 0);
    }

    new GLTFLoader().load("/basic_t-shirt.glb", (gltf) => {
        model = gltf.scene;

        model.traverse((node) => {
            if (node.isMesh && node.material) {
                Object.assign(node.material, {
                    metalness: 0.05,
                    roughness: 0.9,
                });
            }
        });


        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        modelSize = size;

        scene.add(model);
        setupModel();
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        setupModel();
    });

    ScrollTrigger.create({
        trigger: ".product-overview",
        start: "top top",
        end: `+=${window.innerHeight * 10}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: ({ progress }) => {
            const headerProgress = Math.max(0, Math.min(1, (progress - 0.05) / 0.3));
            gsap.to(".header-1", {
                xPercent:
                    progress < 0.05 ? 0 : progress > 0.35 ? -100 : -100 * headerProgress,
            });

            const makeSize =
                progress < 0.2
                    ? 0
                    : progress > 0.5
                        ? 100
                        : 100 * ((progress - 0.02) / 0.1);
            gsap.to(".circular-mask", {
                clipPath: `circle(${makeSize}% at 50% 50%)`,
            });

            const header2Progress = (progress - 0.15) / 0.35;
            const header2XPercent =
                progress < 0.15
                    ? 100
                    : progress > 0.5
                        ? -200
                        : 100 - 300 * header2Progress;
            gsap.to(".header-2", { xPercent: header2XPercent });

            const scaleX =
                progress < 0.45
                    ? 0
                    : progress > 0.65
                        ? 100
                        : 100 * ((progress - 0.45) / 0.2);
            // .divider, <-- trailing comma means CSS selector tries to select invalid ".divider," node
            // Remove trailing comma from selector
            gsap.to(".tooltip .divider", { scaleX: scaleX / 100, ...animOptions });

            tooltipSelectors.forEach(({ trigger, elements }) => {
                gsap.to(elements, {
                    y: progress >= trigger ? "0%" : "125%",
                    ...animOptions,
                });
            });

            if (model && progress >= 0.05) {
                const rotationProgress = (progress - 0.05) / 0.95;
                // Math.PI * 3 * 4 is not clear: that's 12π (6 full rotations?), maybe intentional
                const targetRotation = Math.PI * 3 * 4 * rotationProgress;
                const rotationDiff = targetRotation - currentRotation;
                if (Math.abs(rotationDiff) > 0.001) {
                    model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotationDiff);
                    currentRotation = targetRotation;
                }
            }
        },
    });
});


// ALEKO nav active state
const navLinks = document.querySelectorAll(".nav-links a");
navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove("active"));
        this.classList.add("active");
    });
});

// ALEKO navbar scroll effect
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