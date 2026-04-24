document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Service Card Interactions
    ========================== */
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const serviceName = card.querySelector('h3').textContent;
            
            if (serviceName.includes('Online Ordering')) {
                alert("Opening our online menu...");
                window.location.href = 'menu.html';
            } else if (serviceName.includes('Table Reservation')) {
                alert("Redirecting to table reservation system...");
                // Simulating a redirect or popup
                alert("Feature coming soon! Please call our hotline for instant booking.");
            } else if (serviceName.includes('Delivery')) {
                window.location.href = 'menu.html';
            }
        });
        
        // Add subtle hover pointer
        card.style.cursor = 'pointer';
    });

    /* =========================
       Scroll Reveal Logic
    ========================== */
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const stepCards = document.querySelectorAll('.step-card');
    stepCards.forEach((card, index) => {
        // Initial state for animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });

    /* =========================
       Navigation & Footer Links
    ========================== */
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text === 'home') link.href = 'Home.html';
        if (text === 'menu') link.href = 'menu.html';
        if (text === 'about us') link.href = 'aboutus.html';
        if (text === 'contact us') link.href = 'contact.html';
    });

    // Footer Links - Transform simple text into clickable links
    const footerLinks = document.querySelectorAll('.footer-col ul li');
    footerLinks.forEach(li => {
        const text = li.textContent.toLowerCase();
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
            if (text === 'home') window.location.href = 'Home.html';
            if (text === 'menu') window.location.href = 'menu.html';
            if (text === 'about us') window.location.href = 'aboutus.html';
            if (text === 'contact us') window.location.href = 'contact.html';
        });
    });
});
