// Add class when JavaScript is available
document.body.classList.add("with-js");

// Add functionality for the nav-toggle button
(function navToggle() {
    const el = document.querySelector(".docs-nav-toggle");
    document.querySelector(".docs-nav");
    el && el.addEventListener("click", function() {
        let t = "true" === el.getAttribute("aria-expanded");
        el.setAttribute("aria-expanded", !t)
    })
})();