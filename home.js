document.addEventListener("DOMContentLoaded", function() {
    const nextBtn = document.querySelector('.slider-arrow.next');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const slider = document.querySelector('.testimonial-grid');

    if (nextBtn && prevBtn && slider) {
        nextBtn.addEventListener('click', () => {
            const firstBox = slider.querySelector('.testimonial-box');
            if (firstBox) {
                // Determine scrolling amount based on box width + gap (30px)
                const scrollAmount = firstBox.clientWidth + 30;
                slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });

        prevBtn.addEventListener('click', () => {
            const firstBox = slider.querySelector('.testimonial-box');
            if (firstBox) {
                const scrollAmount = firstBox.clientWidth + 30;
                slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        });
    }

    // Login functionality
    const loginLink = document.querySelector('.login-link');
    const welcomeText = document.querySelector('.welcome-text');

    if (loginLink && welcomeText) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            const username = prompt("Please enter your username:");
            if (username && username.trim() !== "") {
                welcomeText.textContent = `Welcome ${username.trim()}`;
                
                // Switch the login button context
                const loginText = loginLink.querySelector('span');
                if (loginText) {
                    loginText.textContent = "Logout";
                }
            }
        });
    }
});
