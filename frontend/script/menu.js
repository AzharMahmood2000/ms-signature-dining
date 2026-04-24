document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('itemSearch');
    const filterLinks = document.querySelectorAll('.cat-link');
    const menuCards = document.querySelectorAll('.menu-card');

    let currentCategory = 'all';

    function filterMenu() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        // Query the cards dynamically here because they are loaded from the API
        const currentCards = document.querySelectorAll('.menu-card');

        currentCards.forEach(card => {
            const dishName = card.querySelector('.dish-name').textContent.toLowerCase();
            const dishCategory = card.getAttribute('data-category');

            const matchesSearch = dishName.includes(searchTerm);
            const matchesCategory = currentCategory === 'all' || dishCategory === currentCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterMenu);
    }

    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state
            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update category and filter
            currentCategory = link.getAttribute('data-filter');
            filterMenu();
        });
    });

    const menuGrid = document.getElementById('menuGrid');

    // Fetch and Render Menu Items
    function loadMenu() {
        fetch('http://localhost:5000/api/menu')
            .then(res => res.json())
            .then(data => {
                renderMenuItems(data);
            })
            .catch(err => console.error('Error fetching menu:', err));
    }

    function renderMenuItems(items) {
        menuGrid.innerHTML = ''; // Clear existing
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'menu-card';
            card.setAttribute('data-category', item.category.toLowerCase());
            card.innerHTML = `
                <div class="card-img" onclick="window.location.href='fooddetail.html?id=${item.id}'" style="cursor:pointer;">
                    <span class="heart-icon">♡</span>
                    <img src="${item.image_url}" alt="${item.name}">
                </div>
                <div class="card-info" onclick="window.location.href='fooddetail.html?id=${item.id}'" style="cursor:pointer;">
                    <span class="dish-name">${item.name}</span>
                    <span class="dish-price">Rs. ${item.price}</span>
                </div>
                <button class="order-btn">Order Now</button>
            `;
            menuGrid.appendChild(card);
        });

        // Re-attach listeners to NEWLY created elements
        attachCardListeners();
        // Apply current filters to the new elements
        filterMenu();
    }

    function attachCardListeners() {
        const orderBtns = document.querySelectorAll('.order-btn');
        orderBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.menu-card');
                // Get the id from the card-img onclick attribute
                const imgDiv = card.querySelector('.card-img');
                const onclickAttr = imgDiv ? imgDiv.getAttribute('onclick') : '';
                const idMatch = onclickAttr.match(/\?id=(\d+)/);
                if (idMatch) {
                    window.location.href = `fooddetail.html?id=${idMatch[1]}`;
                } else {
                    const name = card.querySelector('.dish-name').textContent;
                    window.location.href = `fooddetail.html?name=${encodeURIComponent(name)}`;
                }
            });
        });

        const hearts = document.querySelectorAll('.heart-icon');
        hearts.forEach(heart => {
            heart.addEventListener('click', () => {
                if (heart.textContent === '♡') {
                    heart.textContent = '❤️';
                    heart.style.color = '#e74c3c';
                } else {
                    heart.textContent = '♡';
                    heart.style.color = '#333';
                }
            });
        });
    }

    loadMenu();
});
