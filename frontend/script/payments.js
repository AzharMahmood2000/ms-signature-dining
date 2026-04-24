document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Navigation Controls
    ========================== */
    const backBtn = document.querySelector('.back-button a');
    if (backBtn) {
        backBtn.href = 'checkout.html';
    }

    /* =========================
       Form Input Formatting
    ========================== */
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');

    // Card Number Formatting (XXXX XXXX XXXX XXXX)
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = "";
            for (let i = 0; i < value.length && i < 16; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += " ";
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }

    // Expiry Formatting (MM/YY)
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                e.target.value = value.slice(0, 2) + '/' + value.slice(2, 4);
            } else {
                e.target.value = value;
            }
        });
    }

    // CVV Limit (3 digits)
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
        });
    }

    /* =========================
       Payment Processing
    ========================== */
    const paymentForm = document.querySelector('.payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const cardNum = cardNumberInput.value.replace(/\s/g, '');
            const cardName = document.getElementById('card-name').value.trim();
            const cvv = cvvInput.value;
            const expiry = expiryInput.value;

            // Simple Validation
            if (cardNum.length < 16) {
                alert("Please enter a valid 16-digit card number.");
                return;
            }
            if (!cardName) {
                alert("Please enter the name on the card.");
                return;
            }
            if (cvv.length < 3) {
                alert("Please enter a valid 3-digit CVV.");
                return;
            }
            if (expiry.length < 5) {
                alert("Please enter a valid expiry date (MM/YY).");
                return;
            }

            // Success Simulation
            const proceedBtn = document.querySelector('.btn-proceed');
            proceedBtn.textContent = "Processing...";
            proceedBtn.disabled = true;

            setTimeout(() => {
                alert("Payment Successful! Your order has been placed. Thank you for dining with MS Signature Dining.");
                window.location.href = 'Home.html';
            }, 2000);
        });
    }
});
