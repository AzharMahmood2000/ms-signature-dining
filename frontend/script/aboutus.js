
// Wait until page loads
document.addEventListener("DOMContentLoaded", function () {

    /* =========================
    Smooth Scroll Navbar
    ========================== */
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const target = this.getAttribute('href');

            if (target.startsWith("#")) {
                e.preventDefault();

                const section = document.querySelector(target);
                if (section) {
                    section.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    /* =========================
    Subscribe Form Validation
    ========================== */
    const subscribeForm = document.querySelector('.subscribe-form');

    if (subscribeForm) {
        const emailInput = subscribeForm.querySelector('input');

        subscribeForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = emailInput.value.trim();

            if (email === "") {
                alert("Please enter your email!");
                return;
            }

            // Basic email validation
            const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

            if (!email.match(emailPattern)) {
                alert("Please enter a valid email address!");
                return;
            }

            alert("Subscribed successfully!");
            emailInput.value = "";
        });
    }


    /* =========================
    Reserve Button Click
    ========================== */
    const reserveBtn = document.querySelector('.btn-reserve');

    if (reserveBtn) {
        reserveBtn.addEventListener('click', function (e) {
            e.preventDefault();
            alert("Reservation system coming soon!");
        });
    }


    /* =========================
    Scroll Animation (Fade-in)
    ========================== */
    const sections = document.querySelectorAll('.section');

    function revealSections() {
        const screenHeight = window.innerHeight;

        sections.forEach(section => {
            const position = section.getBoundingClientRect().top;

            if (position < screenHeight - 100) {
                section.style.opacity = "1";
                section.style.transform = "translateY(0)";
            }
        });
    }

    window.addEventListener('scroll', revealSections);

    // Run once on load
    revealSections();

});