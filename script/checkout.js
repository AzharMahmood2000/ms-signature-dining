document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Navigation Controls
    ========================== */
    const backBtn = document.querySelector('.back-btn');
    const cancelBtn = document.querySelector('.btn-cancel');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'cartpage.html';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'cartpage.html';
        });
    }

    /* =========================
       Tab Switching Logic
    ========================== */
    const tabs = document.querySelectorAll('.form-tabs span');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Scroll to the respective section if desired
            if (tab.textContent === 'Payments') {
                const paymentSection = document.querySelector('h4:nth-of-type(3)');
                if (paymentSection) paymentSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    /* =========================
       Confirm Order Interaction
    ========================== */
    const confirmBtn = document.querySelector('.btn-confirm');
    const paymentOptions = document.querySelectorAll('input[name="pay"]');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            let selectedMethod = '';
            paymentOptions.forEach(opt => {
                if (opt.checked) {
                    selectedMethod = opt.closest('.payment-option').querySelector('span').textContent;
                }
            });

            if (selectedMethod === 'Credit & Debit') {
                alert("Redirecting to Secure Payment Gateway...");
                window.location.href = 'payments.html';
            } else {
                alert("Order placed successfully with Cash on Delivery! Redirecting to home...");
                window.location.href = 'Home.html';
            }
        });
    }

    /* =========================
       Input Field Animation
    ========================== */
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('label').style.color = '#3498db';
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('label').style.color = '#666';
        });
    });
});
