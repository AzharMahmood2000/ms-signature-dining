document.addEventListener('DOMContentLoaded', () => {

    const API = 'http://localhost:5000/api';
    const SHIPPING = 400;

    /* ================================================================
       STEP 1 — Build the cart from sessionStorage (quickOrder)
                or localStorage (full cart)
    ================================================================ */
    let cartItems = [];

    const quickOrder = sessionStorage.getItem('quickOrder');
    if (quickOrder) {
        try {
            const item = JSON.parse(quickOrder);
            cartItems = [item];
        } catch (e) {}
    } else {
        try {
            cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (e) { cartItems = []; }
    }

    /* ================================================================
       STEP 2 — Render the Order Summary panel dynamically
    ================================================================ */
    function renderSummary() {
        const summaryPanel = document.querySelector('.summary-panel');
        if (!summaryPanel) return;

        if (!cartItems.length) {
            summaryPanel.innerHTML = `
                <h2>Order Summary</h2>
                <p style="color:#888;padding:20px 0;">No items in cart.
                    <a href="menu.html" style="color:#c9a84c;">Browse Menu →</a>
                </p>`;
            return;
        }

        let subtotal = 0;
        const itemsHTML = cartItems.map(item => {
            const rawPriceString = typeof item.price === 'number' ? String(item.price) : String(item.price);
            const digits = rawPriceString.replace(/[^0-9]/g, '');
            const price = parseInt(digits, 10) || 0;
            const lineTotal = price * (item.quantity || 1);
            subtotal += lineTotal;
            return `
                <div class="summary-item">
                    <div class="item-img">
                        <img src="${item.image_url || 'images/nasi.webp'}" alt="${item.name}"
                            onerror="this.src='images/nasi.webp'">
                    </div>
                    <div class="item-details">
                        <h3 class="item-name">${item.name}</h3>
                        <div class="detail-row"><span>Quantity</span> <strong>${item.quantity || 1}</strong></div>
                        <div class="detail-row"><span>Unit Price</span> <strong>Rs. ${price}</strong></div>
                        <div class="detail-row"><span>Total</span> <strong>Rs. ${lineTotal}</strong></div>
                    </div>
                </div>`;
        }).join('');

        const total = subtotal + SHIPPING;
        summaryPanel.innerHTML = `
            <h2>Order Summary</h2>
            ${itemsHTML}
            <div class="promo-section" style="margin-top:20px; width:100%; max-width:500px; margin-bottom: 20px;">
                <label style="font-size:12px; color:#aaa; margin-bottom:8px; display:block;">Promo Code (Optional)</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="promo-input" placeholder="Enter code" style="flex:1; background:#1a1a1a; border:1px solid #333; color:white; padding:8px 12px; border-radius:4px; outline:none;">
                    <button id="apply-promo" style="background:#c9a84c; color:black; border:none; padding:8px 16px; border-radius:4px; font-weight:600; cursor:pointer;">Apply</button>
                </div>
                <p id="promo-msg" style="font-size:12px; margin-top:8px; display:none;"></p>
            </div>
            <div class="price-breakdown" style="margin-top:16px; border-top:1px solid #333; padding-top:12px; width:100%; max-width:500px;">
                <div class="price-row"><span>Subtotal</span><span>Rs. ${subtotal}</span></div>
                <div class="price-row"><span>Delivery fee</span><span>Rs. ${SHIPPING}</span></div>
                <div id="discount-row" class="price-row" style="display:none; color:#2ecc71;"><span>Discount (10%)</span><span>- Rs. 0</span></div>
                <hr style="border-top:1px solid #333;">
                <div class="price-row total"><span>Total</span><span id="co-total">Rs. ${total}</span></div>
            </div>`;

        // Store computed totals for later use
        window._orderSubtotal = subtotal;
        window._orderTotal    = total;
    }

    renderSummary();

    // Promo code logic
    let appliedPromoCode = '';
    const summaryPanel = document.querySelector('.summary-panel');
    if (summaryPanel) {
        summaryPanel.addEventListener('click', (e) => {
            if (e.target.id === 'apply-promo') {
                const input = document.getElementById('promo-input');
                const msg = document.getElementById('promo-msg');
                const discRow = document.getElementById('discount-row');
                const code = input.value.trim().toUpperCase();

                if (code === 'DINING10') {
                    appliedPromoCode = code;
                    const discount = Math.round(window._orderSubtotal * 0.1);
                    msg.textContent = '✅ Promo code applied successfully!';
                    msg.style.color = '#2ecc71';
                    msg.style.display = 'block';
                    
                    discRow.style.display = 'flex';
                    discRow.querySelector('span:last-child').textContent = `- Rs. ${discount}`;
                    
                    const newTotal = window._orderSubtotal + SHIPPING - discount;
                    document.getElementById('co-total').textContent = `Rs. ${newTotal}`;
                    window._orderTotal = newTotal;
                } else {
                    appliedPromoCode = '';
                    msg.textContent = '❌ Invalid promo code.';
                    msg.style.color = '#e74c3c';
                    msg.style.display = 'block';
                    discRow.style.display = 'none';
                    const originalTotal = window._orderSubtotal + SHIPPING;
                    document.getElementById('co-total').textContent = `Rs. ${originalTotal}`;
                    window._orderTotal = originalTotal;
                }
            }
        });
    }

    /* ================================================================
       STEP 3 — Navigation Controls
    ================================================================ */
    const backBtn   = document.querySelector('.back-btn');
    const cancelBtn = document.querySelector('.btn-cancel');
    if (backBtn)   backBtn.addEventListener('click', () => history.back());
    if (cancelBtn) cancelBtn.addEventListener('click', () => window.location.href = 'cartpage.html');

    /* ================================================================
       STEP 4 — Two-stage Confirm Order flow
    ================================================================ */
    const confirmBtn      = document.querySelector('.btn-confirm');
    const paymentTab      = document.getElementById('paymentTab');
    const paymentSection  = document.getElementById('paymentSection');
    const infoSections    = document.querySelectorAll('.info-section');
    const paymentOptions  = document.querySelectorAll('input[name="pay"]');

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {

            // ── Stage 1: validate personal info ─────────────────────
            if (paymentSection.style.display === 'none' || paymentSection.style.display === '') {

                const required = document.querySelectorAll('.info-section input[required]');
                let valid = true;
                required.forEach(input => {
                    if (!input.value.trim()) {
                        valid = false;
                        input.style.border = '2px solid #e74c3c';
                    } else {
                        input.style.border = '1px solid #ddd';
                    }
                });

                if (!valid) {
                    alert('⚠️ Please fill in all required fields.');
                    return;
                }

                // Show payment section
                paymentSection.style.display = 'block';
                if (paymentTab) { paymentTab.style.display = 'inline-block'; paymentTab.click(); }
                infoSections.forEach(s => s.style.display = 'none');
                confirmBtn.textContent = 'Finish Order';
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } else {
                // ── Stage 2: place order via API ────────────────────
                let selectedMethod = 'cash';
                paymentOptions.forEach(opt => {
                    if (opt.checked) {
                        const label = opt.closest('.payment-option')?.querySelector('span')?.textContent || '';
                        if (label.toLowerCase().includes('credit') || label.toLowerCase().includes('debit')) {
                            selectedMethod = 'card';
                        } else {
                            selectedMethod = 'cash';
                        }
                    }
                });

                placeOrder(selectedMethod);
            }
        });
    }

    /* ================================================================
       STEP 5 — POST to /api/orders
    ================================================================ */
    function placeOrder(paymentMethod) {
        if (!cartItems.length) {
            alert('Your cart is empty!');
            return;
        }

        // Read form values
        const firstName       = document.getElementById('firstName')?.value.trim()       || '';
        const lastName        = document.getElementById('lastName')?.value.trim()        || '';
        const phone           = document.getElementById('phoneNumber')?.value.trim()     || '';
        const email           = document.getElementById('emailCheckout')?.value.trim()   || '';
        const address1        = document.getElementById('address1')?.value.trim()        || '';
        const street          = document.getElementById('street')?.value.trim()          || '';
        const landmark        = document.getElementById('landmark')?.value.trim()        || '';
        const buildingName    = document.getElementById('buildingName')?.value.trim()    || '';

        const deliveryAddress = [address1, street, landmark, buildingName].filter(Boolean).join(', ');
        const customerName    = `${firstName} ${lastName}`.trim();

        // Build items array expected by the API
        const items = cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity || 1
        }));

        // Stored user info (from login)
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || sessionStorage.getItem('user') || 'null');

        const payload = {
            user_id:          loggedInUser?.id || null,
            customer_name:    customerName,
            customer_email:   email,
            customer_phone:   phone,
            delivery_address: deliveryAddress,
            city:             '',
            postal_code:      '',
            payment_method:   paymentMethod,
            notes:            '',
            promo_code:       appliedPromoCode,
            items
        };

        // Disable button to prevent double submit
        const btn = document.querySelector('.btn-confirm');
        if (btn) { btn.disabled = true; btn.textContent = 'Placing Order...'; }

        fetch(`${API}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(res => {
            if (res.error) {
                alert('❌ Order failed: ' + res.error);
                if (btn) { btn.disabled = false; btn.textContent = 'Finish Order'; }
                return;
            }

            // Clear cart
            localStorage.removeItem('cart');
            sessionStorage.removeItem('quickOrder');

            // Show success and redirect
            alert(`✅ Order #${res.order_id} placed successfully!\n\nTotal: Rs. ${res.total_amount}\nWe'll prepare your order right away!`);

            if (paymentMethod === 'card') {
                // Pass order_id to payment page
                sessionStorage.setItem('pendingPayment', JSON.stringify({ order_id: res.order_id, amount: res.total_amount }));
                window.location.href = 'payments.html';
            } else {
                window.location.href = 'Home.html';
            }
        })
        .catch(err => {
            console.error('Order error:', err);
            alert('❌ Could not connect to server. Make sure the server is running on localhost:5000.');
            if (btn) { btn.disabled = false; btn.textContent = 'Finish Order'; }
        });
    }

    /* ================================================================
       Input field highlight on focus
    ================================================================ */
    document.querySelectorAll('.input-group input').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('label').style.color = '#c9a84c';
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('label').style.color = '#666';
        });
    });
});
