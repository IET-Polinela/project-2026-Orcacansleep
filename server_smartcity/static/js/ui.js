document.addEventListener("DOMContentLoaded", function () {
    setupNavbarToggle();
    setupScrollTop();
    setupToasts();
    setupRevealAnimation();
});

function setupNavbarToggle() {
    const toggleButton = document.querySelector("[data-nav-toggle]");
    const navMenu = document.querySelector("[data-nav-menu]");

    if (!toggleButton || !navMenu) return;

    toggleButton.addEventListener("click", function () {
        navMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = toggleButton.contains(event.target);

        if (!isClickInsideMenu && !isClickOnToggle) {
            navMenu.classList.remove("show");
        }
    });
}

function setupScrollTop() {
    const scrollButton = document.getElementById("scrollTopBtn");

    if (!scrollButton) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 420) {
            scrollButton.classList.add("show");
        } else {
            scrollButton.classList.remove("show");
        }
    });

    scrollButton.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

function setupToasts() {
    const toasts = document.querySelectorAll("[data-toast]");

    toasts.forEach(function (toast) {
        const closeButton = toast.querySelector("[data-toast-close]");

        if (closeButton) {
            closeButton.addEventListener("click", function () {
                hideToast(toast);
            });
        }

        setTimeout(function () {
            hideToast(toast);
        }, 4200);
    });
}

function hideToast(toast) {
    if (!toast) return;

    toast.style.opacity = "0";
    toast.style.transform = "translateX(16px)";

    setTimeout(function () {
        toast.remove();
    }, 240);
}

function setupRevealAnimation() {
    const elements = document.querySelectorAll("[data-animate]");

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    elements.forEach(function (element) {
        observer.observe(element);
    });
}