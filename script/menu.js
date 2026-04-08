document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('itemSearch');
    const filterLinks = document.querySelectorAll('.cat-link');
    const menuCards = document.querySelectorAll('.menu-card');

    let currentCategory = 'all';

    function filterMenu() {
        const searchTerm = searchInput.value.toLowerCase();

        menuCards.forEach(card => {
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

    // Order Now Button Interaction
    const orderBtns = document.querySelectorAll('.order-btn');
    orderBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.menu-card');
            const name = card.querySelector('.dish-name').textContent;
            alert(`Added ${name} to your session! Proceeding to cart...`);
            window.location.href = 'cartpage.html';
        });
    });

    // Favorite Heart Toggle
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
});
