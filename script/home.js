document.addEventListener("DOMContentLoaded", function() {
    /* =========================
       Smooth Page Transitions
    ========================== */
    document.body.classList.add('page-loaded');

    const links = document.querySelectorAll('a, button[onclick]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href') || link.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            
            if (href && !href.startsWith('#') && !link.target) {
                e.preventDefault();
                document.body.classList.add('page-exit');
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            }
        });
    });

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

    /* Login logic handled via direct page link in HTML */
});
