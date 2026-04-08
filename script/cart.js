document.addEventListener('DOMContentLoaded', () => {

    //   Quantity Controls

    const steppers = document.querySelectorAll('.qty-stepper');

    steppers.forEach(stepper => {
        const plusBtn = stepper.querySelector('.plus');
        const minusBtn = stepper.querySelector('.minus');
        const qtyVal = stepper.querySelector('.qty-val');

        plusBtn.addEventListener('click', () => {
            let count = parseInt(qtyVal.textContent);
            count++;
            qtyVal.textContent = count < 10 ? `0${count}` : count;
            updateSummary();
        });

        minusBtn.addEventListener('click', () => {
            let count = parseInt(qtyVal.textContent);
            if (count > 1) {
                count--;
                qtyVal.textContent = count < 10 ? `0${count}` : count;
                updateSummary();
            }
        });
    });


    //  Remove Item

    const removeBtns = document.querySelectorAll('.ctrl-btn.remove');

    removeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const productItem = btn.closest('.product-item');
            if (confirm("Are you sure you want to remove this item?")) {
                productItem.style.opacity = '0';
                productItem.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    productItem.remove();
                    updateSummary();
                }, 300);
            }
        });
    });

    //  Sync Button Interaction
    const syncBtns = document.querySelectorAll('.ctrl-btn.sync');

    syncBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.animation = 'spin 1s linear infinite';
            setTimeout(() => {
                btn.style.animation = 'none';
                alert("Prices and availability synchronized!");
            }, 1000);
        });
    });

    // Update Summary Calculation

    function updateSummary() {
        const productItems = document.querySelectorAll('.product-item');
        let subtotal = 0;

        productItems.forEach(item => {
            const priceText = item.querySelector('.p-price').textContent;
            const price = parseInt(priceText.replace('RS.', '').trim());
            const qty = parseInt(item.querySelector('.qty-val').textContent);
            subtotal += price * qty;
        });

        const subtotalEl = document.querySelector('.summary-row:nth-child(1) .val');
        const totalEl = document.querySelector('.summary-row.total .val');
        const shipping = 400; // Fixed shipping for this demo

        if (subtotalEl) subtotalEl.textContent = `RS.${subtotal}`;
        if (totalEl) totalEl.textContent = `RS.${subtotal + (subtotal > 0 ? shipping : 0)}`;
    }

    //  Confirm Checkout
    const confirmBtn = document.querySelector('.confirm-btn');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const productItems = document.querySelectorAll('.product-item');
            if (productItems.length === 0) {
                alert("Your cart is empty!");
                return;
            }
            alert("Order confirmed! Redirecting to checkout...");
            window.location.href = 'checkout.html';
        });
    }
});

// Added CSS animation for sync button via JS
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
