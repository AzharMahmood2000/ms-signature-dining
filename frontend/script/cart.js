document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('cart-items-container');
    const SHIPPING = 400; // Fixed shipping

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    function renderCart() {
        const cart = getCart();
        
        if (cart.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px; color: #fff;">
                    <h2>Your cart is empty!</h2>
                    <br>
                    <a href="menu.html" style="color: #c9a84c; text-decoration: none; font-size: 18px; font-weight: bold;">Browse Menu →</a>
                </div>
            `;
            updateSummary(0);
            return;
        }

        let subtotal = 0;
        let html = '';

        cart.forEach((item, index) => {
            const rawPriceString = typeof item.price === 'number' ? String(item.price) : String(item.price);
            const digits = rawPriceString.replace(/[^0-9]/g, '');
            const priceVal = parseInt(digits, 10) || 0;
            const itemTotal = priceVal * (item.quantity || 1);
            subtotal += itemTotal;

            html += `
                <div class="product-item" data-index="${index}">
                    <div class="product-body">
                        <div class="product-image">
                            <img src="${item.image_url || 'images/nasi.webp'}" alt="${item.name}" onerror="this.src='images/nasi.webp'">
                        </div>
                        <div class="product-controls">
                            <button class="ctrl-btn remove">✕</button>
                            <span class="size-label">${item.size || 'R'}</span>
                            <div class="qty-stepper">
                                <button class="plus">+</button>
                                <span class="qty-val">${item.quantity < 10 ? '0' + item.quantity : item.quantity}</span>
                                <button class="minus">−</button>
                            </div>
                            <button class="ctrl-btn sync">🔄</button>
                        </div>
                    </div>
                    <div class="product-footer">
                        <span class="p-name">${item.name.toUpperCase()}</span>
                        <span class="p-price">RS. ${itemTotal}</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        updateSummary(subtotal);
        attachEventListeners();
    }

    function updateSummary(subtotal) {
        const subtotalEl = document.getElementById('cart-subtotal');
        const shippingEl = document.getElementById('cart-shipping');
        const totalEl = document.getElementById('cart-total');

        if (subtotal === 0) {
            subtotalEl.textContent = 'RS. 0';
            shippingEl.textContent = 'RS. 0';
            totalEl.textContent = 'RS. 0';
        } else {
            subtotalEl.textContent = `RS. ${Math.round(subtotal)}`;
            shippingEl.textContent = `RS. ${Math.round(SHIPPING)}`;
            totalEl.textContent = `RS. ${Math.round(subtotal + SHIPPING)}`;
        }
    }

    function attachEventListeners() {
        const cart = getCart();

        // Plus
        document.querySelectorAll('.qty-stepper .plus').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.product-item').dataset.index;
                cart[index].quantity++;
                saveCart(cart);
            });
        });

        // Minus
        document.querySelectorAll('.qty-stepper .minus').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.product-item').dataset.index;
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                    saveCart(cart);
                }
            });
        });

        // Remove
        document.querySelectorAll('.ctrl-btn.remove').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const itemEl = e.target.closest('.product-item');
                const index = itemEl.dataset.index;
                if (confirm("Are you sure you want to remove this item?")) {
                    itemEl.style.opacity = '0';
                    itemEl.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        cart.splice(index, 1);
                        saveCart(cart);
                    }, 300);
                }
            });
        });

        // Sync
        document.querySelectorAll('.ctrl-btn.sync').forEach((btn) => {
            btn.addEventListener('click', () => {
                btn.style.animation = 'spin 1s linear infinite';
                setTimeout(() => {
                    btn.style.animation = 'none';
                }, 1000);
            });
        });
    }

    // Initial render
    renderCart();

    // Confirm Checkout
    const confirmBtn = document.querySelector('.confirm-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }
            
            // Clear single-item quickOrder so checkout uses full cart
            sessionStorage.removeItem('quickOrder');
            
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
