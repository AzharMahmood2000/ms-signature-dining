document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = contactForm.querySelector('input[name="name"]').value.trim();
            const email = contactForm.querySelector('input[name="email"]').value.trim();
            const message = contactForm.querySelector('textarea[name="message"]').value.trim();
            
            // Simple Validation
            if (!name || !email || !message) {
                alert("Please fill in all fields before sending your message.");
                return;
            }
            
            // Email format check
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }
            
            // Success Simulation
            const submitBtn = contactForm.querySelector('.submit-btn');
            submitBtn.textContent = "Sending...";
            submitBtn.disabled = true;

            setTimeout(() => {
                alert(`Thank you, ${name}! Your message has been sent successfully. We will get back to you at ${email} shortly.`);
                contactForm.reset();
                submitBtn.textContent = "Submit";
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    /* =========================
       Social/Icon Interactivity
    ========================== */
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(10px)';
            item.style.transition = 'transform 0.3s ease';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });

    /* =========================
       Navigation Fixes
    ========================== */
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        if (link.textContent.toLowerCase() === 'home') link.href = 'Home.html';
        if (link.textContent.toLowerCase() === 'services') link.href = 'services.html';
        if (link.textContent.toLowerCase() === 'about us') link.href = 'aboutus.html';
    });
});
