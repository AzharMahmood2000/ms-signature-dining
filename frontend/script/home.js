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

    /* =========================
       User Auth & Navigation Icons
    ========================== */
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('loggedInUser'));
    
    // Update welcome text
    const welcomeText = document.querySelector('.welcome-text');
    if (user && welcomeText) {
        welcomeText.textContent = `Welcome, ${user.firstName || user.username || 'User'}`;
    }

    // Update navbar login button to profile & cart icons
    const userIconDiv = document.querySelector('.user-icon');
    if (user && userIconDiv) {
        userIconDiv.innerHTML = `
            <div style="display: flex; gap: 20px; align-items: center;">
                <a href="profile.html"><img src="images/profile.png" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #ffffff; cursor: pointer; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></a>
                <a href="cartpage.html"><img src="images/Vector (1).png" alt="Cart" style="width: 30px; height: 30px; cursor: pointer; filter: brightness(0) invert(1); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"></a>
            </div>
        `;
    }

    /* =========================
       Fetch & Render Places
    ========================== */
    const placesGrid = document.getElementById('placesGrid');

    if (placesGrid) {
        fetch('http://localhost:5000/api/places')
            .then(res => res.json())
            .then(data => {
                placesGrid.innerHTML = '';
                data.forEach(place => {
                    const placeCard = document.createElement('div');
                    placeCard.className = 'food-card';
                    placeCard.innerHTML = `
                        <div class="card-img-container">
                            <img src="${place.image_url}" alt="${place.name}">
                        </div>
                        <div class="card-body">
                            <h3>${place.name}</h3>
                            <p>${place.address}</p>
                            <div class="card-footer">
                                <span class="price">${place.distance} away</span>
                                <button class="btn-order">View Map</button>
                            </div>
                        </div>
                    `;
                    placesGrid.appendChild(placeCard);
                });
            })
            .catch(err => console.error('Error fetching places:', err));
    }

    /* =========================
       Fetch & Render Signature Dishes
    ========================== */
    const dishesGrid = document.getElementById('signatureDishesGrid');
    if (dishesGrid) {
        fetch('http://localhost:5000/api/homepage/dishes')
            .then(res => res.json())
            .then(dishes => {
                if (!dishes.length) return;
                dishesGrid.innerHTML = dishes.map(dish => `
                    <div class="food-card">
                        <div class="card-img-container" onclick="window.location.href='fooddetail.html?name=${encodeURIComponent(dish.name)}'" style="cursor:pointer;">
                            <img src="${dish.image_url}" alt="${dish.name}"
                                onerror="this.src='images/pepper chicken_resized.jpg'">
                        </div>
                        <div class="card-body">
                            <h3>${dish.name}</h3>
                            <p>${dish.description}</p>
                            <div class="card-footer">
                                <span class="price">${dish.price}</span>
                                <button class="btn-order"
                                    onclick="window.location.href='fooddetail.html?name=${encodeURIComponent(dish.name)}'">Order Now</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            })
            .catch(err => console.error('Error loading signature dishes:', err));
    }

    /* =========================
       Fetch & Render Featured Collections
    ========================== */
    const collectionsGrid = document.getElementById('featuredCollectionsGrid');
    if (collectionsGrid) {
        fetch('http://localhost:5000/api/homepage/collections')
            .then(res => res.json())
            .then(collections => {
                if (!collections.length) return;
                collectionsGrid.innerHTML = collections.map(col => `
                    <div class="food-card">
                        <a href="fooddetail.html?name=${encodeURIComponent(col.name)}" style="text-decoration:none;color:inherit;">
                            <div class="card-img-container">
                                <img src="${col.image_url}" alt="${col.name}"
                                    onerror="this.src='images/nasi.webp'">
                            </div>
                            <div class="card-body">
                                <h3>${col.name}</h3>
                                <p>${col.description}</p>
                            </div>
                        </a>
                        <div class="card-body" style="padding-top:0;">
                            <div class="card-footer">
                                <span class="price">${col.price}</span>
                                <button class="btn-order"
                                    onclick="window.location.href='fooddetail.html?name=${encodeURIComponent(col.name)}'">Order Now</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            })
            .catch(err => console.error('Error loading featured collections:', err));
    }

    /* Login logic handled via direct page link in HTML */
});
