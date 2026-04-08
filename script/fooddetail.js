document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Image Gallery Logic
    ========================== */
    const mainImg = document.querySelector('.main-image img');
    const thumbnails = document.querySelectorAll('.thumbnail-gallery img');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            // Update main image source
            mainImg.src = thumb.src;
            
            // Add active effect to thumbnail
            thumbnails.forEach(t => t.style.borderColor = 'transparent');
            thumb.style.borderColor = '#2ecc71';
        });
    });

    /* =========================
       Selection (Size/Type) Logic
    ========================== */
    const optionGroups = document.querySelectorAll('.options');
    optionGroups.forEach(group => {
        const btns = group.querySelectorAll('.option-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active-green'));
                btn.classList.add('active-green');
            });
        });
    });

    /* =========================
       Quantity Stepper Logic
    ========================== */
    const qtySelector = document.querySelector('.qty-selector');
    if (qtySelector) {
        const minusBtn = qtySelector.querySelector('button:first-child');
        const plusBtn = qtySelector.querySelector('button:last-child');
        const countSpan = qtySelector.querySelector('span');

        minusBtn.addEventListener('click', () => {
            let count = parseInt(countSpan.textContent);
            if (count > 1) countSpan.textContent = --count;
        });

        plusBtn.addEventListener('click', () => {
            let count = parseInt(countSpan.textContent);
            countSpan.textContent = ++count;
        });
    }

    /* =========================
       Add to Cart / Order Logic
    ========================== */
    const addToCartBtn = document.querySelector('.btn-cart');
    const orderNowBtn = document.querySelector('.btn-order');

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const name = document.querySelector('.serif-title').textContent;
            alert(`${name} added to cart!`);
            window.location.href = 'cartpage.html';
        });
    }

    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', () => {
            const name = document.querySelector('.serif-title').textContent;
            alert(`Proceeding to checkout with ${name}...`);
            window.location.href = 'checkout.html';
        });
    }

    /* =========================
       Wishlist Toggle
    ========================== */
    const wishlistBtn = document.querySelector('.btn-wishlist');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            wishlistBtn.classList.toggle('active');
            if (wishlistBtn.classList.contains('active')) {
                wishlistBtn.textContent = '❤️ In Wishlist';
                wishlistBtn.style.backgroundColor = '#fce4ec';
                wishlistBtn.style.color = '#e91e63';
            } else {
                wishlistBtn.textContent = 'Add to Wishlist';
                wishlistBtn.style.backgroundColor = 'transparent';
                wishlistBtn.style.color = '#666';
            }
        });
    }

    /* =========================
       Promo Banner
    ========================== */
    const unlockBtn = document.querySelector('.unlock-btn');
    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            alert("Congratulations! Use code DINING10 at checkout for 10% off your first order.");
            unlockBtn.textContent = "Code: DINING10";
            unlockBtn.disabled = true;
        });
    }
});
