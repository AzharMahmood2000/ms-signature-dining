document.addEventListener('DOMContentLoaded', () => {
    const API = 'http://localhost:5000/api';

    // ── Read ?id= OR ?name= from the URL ──────────────────────────
    const params = new URLSearchParams(window.location.search);
    const foodId   = params.get('id');
    const foodName = params.get('name');   // fallback for homepage dish cards

    // ── Fetch by ID (menu items) or by name (homepage dishes) ─────
    if (foodId) {
        fetch(`${API}/menu/${foodId}`)
            .then(r => r.json())
            .then(item => {
                if (item.error) throw new Error(item.error);
                populatePage(item);
                loadReviews(foodId);
            })
            .catch(err => {
                console.error('Error loading food details:', err);
                setFallback();
            });
    } else if (foodName) {
        const decodedName = foodName.toLowerCase().trim();
        
        // Search across Menu, Homepage Dishes, and Collections
        Promise.all([
            fetch(`${API}/menu`).then(r => r.json()),
            fetch(`${API}/homepage/dishes`).then(r => r.json()),
            fetch(`${API}/homepage/collections`).then(r => r.json())
        ])
        .then(([menu, dishes, collections]) => {
            // Combine all arrays safely - Prioritize Dishes and Collections over Menu
            // so that if an item exists in both (like Pepper Chicken), the specific
            // homepage/dishes price (e.g. 1350) is used instead of the generic menu price (200).
            const allItems = [...(dishes || []), ...(collections || []), ...(menu || [])];
            
            const match = allItems.find(i => 
                (i.name || '').toLowerCase().trim() === decodedName
            );

            if (match) {
                // If the item doesn't have a category (like a homepage collection), assign a generic one
                if (!match.category) match.category = 'main course';
                populatePage(match);
                if (match.id && !match.link_url) loadReviews(match.id); // Only load reviews if it's a real menu item
            } else {
                console.warn("Item not found across any database tables:", foodName);
                setFallback();
                // Override fallback name with what was clicked just so it looks somewhat correct
                document.getElementById('fd-name').textContent = foodName;
            }
        })
        .catch(err => {
            console.error('Error searching for item:', err);
            setFallback();
            document.getElementById('fd-name').textContent = foodName;
        });
    } else {
        setFallback();
    }

    // ── Populate the page with item data ─────────────────────────
    function populatePage(item) {
        // Update page title
        document.title = `${item.name} - Ms Signature Dining`;

        // Hero heading
        const nameEl = document.getElementById('fd-name');
        if (nameEl) nameEl.textContent = item.name;

        // Main image
        const mainImg = document.getElementById('fd-main-img');
        if (mainImg) {
            mainImg.src = item.image_url || 'images/rice and curry 1.jpg';
            mainImg.alt = item.name;

            // Update first thumbnail to match main image
            const thumbs = document.querySelectorAll('#fd-thumbnails img');
            if (thumbs[0]) thumbs[0].src = item.image_url || mainImg.src;
        }

        // Description
        const descEl = document.getElementById('fd-description');
        if (descEl) descEl.textContent = item.description || 'A delicious signature dish crafted with care.';

        // Rating
        const ratingEl = document.getElementById('fd-rating');
        if (ratingEl) ratingEl.textContent = item.rating || '4.5';

        // Price — handle both "Rs.350" (string) and 350 (number)
        const priceEl = document.getElementById('fd-price');
        if (priceEl) {
            const priceVal = item.price;
            if (typeof priceVal === 'number') {
                priceEl.textContent = `Rs. ${Math.round(priceVal)}`;
            } else if (priceVal) {
                // If it's a string, remove all non-digits to get the actual price
                const digits = String(priceVal).replace(/[^0-9]/g, '');
                const num = parseInt(digits, 10);
                priceEl.textContent = isNaN(num) ? priceVal : `Rs. ${num}`;
            } else {
                priceEl.textContent = 'Rs. 0';
            }
        }

        // Render category-specific options
        renderOptions(item);

        // Store item globally for cart / order buttons
        window._currentFood = item;
    }

    // ── Show static fallback when no ID given ──────────────────────
    function setFallback() {
        document.getElementById('fd-name').textContent       = 'Our Signature Dish';
        document.getElementById('fd-description').textContent = 'A delicious dish crafted with the finest ingredients.';
        document.getElementById('fd-price').textContent       = 'See Menu';
        document.getElementById('fd-rating').textContent      = '4.5';
    }

    // ── Fetch reviews from API ────────────────────────────────────
    function loadReviews(menuItemId) {
        fetch(`${API}/reviews/${menuItemId}`)
            .then(r => r.json())
            .then(reviews => {
                const reviewsEl = document.getElementById('fd-reviews');
                if (reviewsEl) {
                    reviewsEl.textContent = reviews.length
                        ? `${reviews.length} Review${reviews.length > 1 ? 's' : ''}`
                        : 'No reviews yet';
                }
            })
            .catch(() => {}); // silently fail
    }

    /* ─────────────────────────────────────────────────────────────
       Image Gallery — click thumbnail to swap main image
    ───────────────────────────────────────────────────────────── */
    const mainImg    = document.getElementById('fd-main-img');
    const thumbnails = document.querySelectorAll('#fd-thumbnails img');

    thumbnails.forEach(thumb => {
        thumb.style.cursor = 'pointer';
        thumb.addEventListener('click', () => {
            if (mainImg) mainImg.src = thumb.src;
            thumbnails.forEach(t => t.style.border = '2px solid transparent');
            thumb.style.border = '2px solid #2ecc71';
        });
    });

    /* ─────────────────────────────────────────────────────────────
       Dynamic Options based on food category & name
    ───────────────────────────────────────────────────────────── */
    function renderOptions(item) {
        const container = document.getElementById('fd-options-container');
        if (!container) return;

        const cat = (item.category || '').toLowerCase();
        const name = (item.name || '').toLowerCase();

        // Define options per category
        const optionSets = [];

        if (cat.includes('beverage')) {
            // Beverages → no extra options
            container.innerHTML = '';
            return;

        } else if (name.includes('rice & curry') || name.includes('noodles') || (name.includes('nasi') && !name.includes('nasigurang'))) {
            // Vertical matrix layout for Proteins
            optionSets.push({ label: 'ProteinMatrix', proteins: ['Chicken', 'Fish', 'Vegetable', 'Egg'] });

        } else if (cat.includes('main course') || cat.includes('signature') || name.includes('nasigurang')) {
            // Specific dishes like Pepper Chicken, Sea Food, Nasigurang → just sizes R and L
            optionSets.push({ label: 'Size', choices: ['R', 'L'] });

        } else if (cat.includes('sea food') || cat.includes('seafood')) {
            // Seafood → spice level
            optionSets.push({ label: 'Size', choices: ['R', 'L'] });
            optionSets.push({ label: 'Spice Level', choices: ['Mild', 'Medium', 'Spicy'] });

        } else if (cat.includes('dessert') || cat.includes('sweet')) {
            // Desserts → just size
            optionSets.push({ label: 'Size', choices: ['Regular', 'Large'] });

        } else if (cat.includes('side')) {
            // Side dishes → no extra options (just quantity is enough)
            container.innerHTML = '';
            return;

        } else {
            // Generic fallback
            optionSets.push({ label: 'Size', choices: ['R', 'L'] });
        }

        // Clean up price parsing (e.g. "Rs.1350" -> 1350)
        const parsePrice = (val) => {
            if (typeof val === 'number') return Math.round(val);
            if (!val) return 0;
            // Remove everything except digits to avoid decimal issues (e.g. 1.350 becoming 1.35)
            const digits = String(val).replace(/[^0-9]/g, '');
            return parseInt(digits, 10) || 0;
        };

        let basePrice = parsePrice(item.price);
        let largePrice = parsePrice(item.price_large);
            
        // If large price is missing or 0, fallback to basePrice
        if (!largePrice || largePrice === 0) {
            largePrice = basePrice;
        }

        window._currentPrice = basePrice; // global tracker for cart

        // Build HTML for each option group
        container.innerHTML = optionSets.map(group => {
            if (group.label === 'ProteinMatrix') {
                // Check if we have specific prices for these proteins
                let extra = {};
                if (item.extra_prices) {
                    try { extra = JSON.parse(item.extra_prices); } catch(e){}
                }

                return `
                    <div class="selection-group" data-label="Protein & Size">
                        <h3>Select Protein & Size</h3>
                        <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
                            ${group.proteins.map((prot, index) => {
                                const key = prot.toLowerCase().replace('vegetable', 'veg');
                                const sPriceRaw = (extra[key] && extra[key].s) ? extra[key].s : basePrice;
                                const lPriceRaw = (extra[key] && extra[key].l) ? extra[key].l : largePrice;
                                
                                const sPrice = parsePrice(sPriceRaw);
                                const lPrice = parsePrice(lPriceRaw);

                                return `
                                <div style="display:flex;align-items:center;justify-content:space-between;background:#f9f9f9;padding:10px 15px;border-radius:12px;">
                                    <div style="font-weight:600;font-size:15px;color:#333;width:90px;">${prot}</div>
                                    <div class="options" style="display:flex;gap:10px;margin:0;">
                                        <button class="option-btn${index === 0 ? ' active-green' : ''}" data-val="${prot} (R)" data-price="${sPrice}" style="display:flex;flex-direction:column;align-items:center;padding:6px 14px;line-height:1.2;">
                                            <span style="font-weight:700;font-size:15px;">R</span>
                                            <span style="font-size:11px;opacity:0.8;margin-top:2px;">Rs.${sPrice}</span>
                                        </button>
                                        <button class="option-btn" data-val="${prot} (L)" data-price="${lPrice}" style="display:flex;flex-direction:column;align-items:center;padding:6px 14px;line-height:1.2;">
                                            <span style="font-weight:700;font-size:15px;">L</span>
                                            <span style="font-size:11px;opacity:0.8;margin-top:2px;">Rs.${lPrice}</span>
                                        </button>
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="selection-group" data-label="${group.label}">
                        <h3>${group.label}</h3>
                        <div class="options">
                            ${group.choices.map((choice, i) => {
                                let displayText = choice;
                                if (group.label === 'Size' || group.label === 'Portion') {
                                    const pRaw = (choice.includes('L') || choice.includes('Large')) ? largePrice : basePrice;
                                    const p = parsePrice(pRaw);
                                    displayText = `
                                        <div style="display:flex;flex-direction:column;align-items:center;line-height:1.2;">
                                            <span style="font-weight:700;font-size:15px;">${choice}</span>
                                            <span style="font-size:11px;opacity:0.8;margin-top:2px;">Rs.${p}</span>
                                        </div>
                                    `;
                                }
                                return `<button class="option-btn${i === 0 ? ' active-green' : ''}" data-val="${choice}">${displayText}</button>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        }).join('');

        // Attach active-toggle listeners
        container.querySelectorAll('.selection-group').forEach(group => {
            const parentLabel = group.getAttribute('data-label');
            group.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove from all buttons in this specific selection-group
                    group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active-green'));
                    btn.classList.add('active-green');

                    // Automatically change price if Size is changed
                    if (parentLabel === 'Size' || parentLabel === 'Portion' || parentLabel === 'Protein & Size') {
                        const btnPrice = btn.getAttribute('data-price');
                        if (btnPrice) {
                            window._currentPrice = Math.round(parseFloat(btnPrice));
                        } else {
                            const selectedSize = btn.getAttribute('data-val');
                            if (selectedSize.includes('L') || selectedSize.includes('Large')) {
                                window._currentPrice = Math.round(largePrice);
                            } else {
                                window._currentPrice = Math.round(basePrice);
                            }
                        }
                        const priceEl = document.getElementById('fd-price');
                        if (priceEl) priceEl.textContent = `Rs. ${window._currentPrice}`;
                    }
                });
            });
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Quantity Stepper
    ───────────────────────────────────────────────────────────── */
    const qtySelector = document.querySelector('.qty-selector');
    if (qtySelector) {
        const minus    = qtySelector.querySelector('button:first-child');
        const plus     = qtySelector.querySelector('button:last-child');
        const countEl  = qtySelector.querySelector('span');

        minus.addEventListener('click', () => {
            let n = parseInt(countEl.textContent);
            if (n > 1) countEl.textContent = --n;
        });
        plus.addEventListener('click', () => {
            countEl.textContent = parseInt(countEl.textContent) + 1;
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Add to Cart
    ───────────────────────────────────────────────────────────── */
    const addToCartBtn = document.querySelector('.btn-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const food = window._currentFood;
            const name = food ? food.name : document.getElementById('fd-name').textContent;
            const qty  = parseInt(document.querySelector('.qty-selector span')?.textContent || 1);
            
            // Get selected options
            let selectedOptions = [];
            let selectedSize = '';
            document.querySelectorAll('.selection-group').forEach(group => {
                const label = group.getAttribute('data-label');
                const activeBtn = group.querySelector('.option-btn.active-green');
                if (activeBtn) {
                    const val = activeBtn.getAttribute('data-val');
                    selectedOptions.push(`${label}: ${val}`);
                    if (label === 'Size' || label === 'Portion' || label === 'Protein & Size') {
                        // Extract R or L from "Chicken (R)" or just "R"
                        const match = val.match(/\((.)\)/) || [null, val];
                        selectedSize = match[1];
                    }
                }
            });
            const optionsStr = selectedOptions.length ? ` (${selectedOptions.join(', ')})` : '';
            const cartItemName = name + optionsStr;

            // Price might be dynamically changed by size selection
            const finalPrice = window._currentPrice || (food ? food.price : 0);

            // Store in localStorage for cartpage
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            // Try to find same item with same options
            const existing = cart.find(i => i.name === cartItemName);
            if (existing) {
                existing.quantity += qty;
            } else if (food) {
                cart.push({ 
                    id: food.id, 
                    name: cartItemName, 
                    price: finalPrice, 
                    image_url: food.image_url, 
                    quantity: qty,
                    size: selectedSize || 'R'
                });
            }
            localStorage.setItem('cart', JSON.stringify(cart));

            alert(`✅ ${cartItemName} × ${qty} added to cart!`);
            window.location.href = 'cartpage.html';
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Order Now
    ───────────────────────────────────────────────────────────── */
    const orderNowBtn = document.querySelector('.btn-order');
    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', () => {
            const food = window._currentFood;
            const name = food ? food.name : document.getElementById('fd-name').textContent;
            const qty  = parseInt(document.querySelector('.qty-selector span')?.textContent || 1);

            // Get selected options
            let selectedOptions = [];
            let selectedSize = '';
            document.querySelectorAll('.selection-group').forEach(group => {
                const label = group.getAttribute('data-label');
                const activeBtn = group.querySelector('.option-btn.active-green');
                if (activeBtn) {
                    const val = activeBtn.getAttribute('data-val');
                    selectedOptions.push(`${label}: ${val}`);
                    if (label === 'Size' || label === 'Portion' || label === 'Protein & Size') {
                        const match = val.match(/\((.)\)/) || [null, val];
                        selectedSize = match[1];
                    }
                }
            });
            const optionsStr = selectedOptions.length ? ` (${selectedOptions.join(', ')})` : '';
            const cartItemName = name + optionsStr;

            // Price might be dynamically changed by size selection
            const finalPrice = window._currentPrice || (food ? food.price : 0);

            // Store order intent for checkout page
            if (food) {
                sessionStorage.setItem('quickOrder', JSON.stringify({
                    id: food.id, name: cartItemName, price: finalPrice,
                    image_url: food.image_url, quantity: qty,
                    size: selectedSize || 'R'
                }));
            }

            window.location.href = 'checkout.html';
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Wishlist Toggle
    ───────────────────────────────────────────────────────────── */
    const wishlistBtn = document.querySelector('.btn-wishlist');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', () => {
            const isActive = wishlistBtn.classList.toggle('active');
            wishlistBtn.textContent          = isActive ? '❤️ In Wishlist' : 'Add to Wishlist';
            wishlistBtn.style.backgroundColor = isActive ? '#fce4ec'     : 'transparent';
            wishlistBtn.style.color           = isActive ? '#e91e63'     : '#666';
        });
    }

    /* ─────────────────────────────────────────────────────────────
       Promo Banner
    ───────────────────────────────────────────────────────────── */
    const unlockBtn = document.querySelector('.unlock-btn');
    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            alert('🎉 Use code DINING10 at checkout for 10% off your first order!');
            unlockBtn.textContent = '🎟️ Code: DINING10';
            unlockBtn.disabled    = true;
        });
    }
});
