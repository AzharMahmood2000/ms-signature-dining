const API_BASE = 'http://localhost:5000/api';

// ===================== AUTH GUARD =====================
(function() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken || adminToken !== 'true') {
        window.location.href = 'login.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {

    // ===================== SECTION SWITCHING =====================
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(section => section.classList.remove('active'));
            const targetSectionId = item.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) targetSection.classList.add('active');

            // Load section data
            if (targetSectionId === 'orders') loadOrders();
            if (targetSectionId === 'menu') loadAdminMenu();
            if (targetSectionId === 'customers') loadCustomers();
            if (targetSectionId === 'messages') loadMessages();
            if (targetSectionId === 'reservations') loadReservations();
            if (targetSectionId === 'homepage') loadHomepageSection();
        });
    });

    // ===================== LOAD DASHBOARD STATS =====================
    function loadStats() {
        fetch(`${API_BASE}/admin/stats`)
            .then(r => r.json())
            .then(data => {
                const el = (id) => document.getElementById(id);
                if (el('stat-revenue')) el('stat-revenue').textContent = `Rs. ${data.total_revenue.toLocaleString()}`;
                if (el('stat-orders')) el('stat-orders').textContent = data.total_orders;
                if (el('stat-customers')) el('stat-customers').textContent = data.total_users;
                if (el('stat-rating')) el('stat-rating').textContent = data.avg_rating || '4.8';
                if (el('stat-pending')) el('stat-pending').textContent = data.pending_orders;
                if (el('stat-messages')) el('stat-messages').textContent = data.unread_messages;
                if (el('notif-badge')) el('notif-badge').textContent = data.unread_messages || 0;
            })
            .catch(err => console.error('Error loading stats:', err));
    }

    // ===================== LOAD RECENT ORDERS =====================
    function loadRecentOrders() {
        fetch(`${API_BASE}/admin/recent-orders?limit=8`)
            .then(r => r.json())
            .then(orders => {
                const tbody = document.getElementById('recentOrdersBody');
                if (!tbody) return;

                if (orders.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;padding:20px;">No orders yet</td></tr>`;
                    return;
                }

                tbody.innerHTML = orders.map(o => `
                    <tr>
                        <td>#MD-${String(o.id).padStart(4, '0')}</td>
                        <td>${o.customer_name}</td>
                        <td>${new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td>Rs. ${o.total_amount.toLocaleString()}</td>
                        <td><span class="status-badge ${o.status}">${capitalize(o.status)}</span></td>
                    </tr>
                `).join('');
            })
            .catch(err => console.error('Error loading recent orders:', err));
    }

    // ===================== LOAD POPULAR ITEMS =====================
    function loadPopularItems() {
        fetch(`${API_BASE}/admin/popular-items?limit=5`)
            .then(r => r.json())
            .then(items => {
                const list = document.getElementById('popularItemsList');
                if (!list) return;

                if (items.length === 0) {
                    list.innerHTML = `<p style="color:#888;text-align:center;">No items yet</p>`;
                    return;
                }

                list.innerHTML = items.map(item => `
                    <div class="popular-item">
                        <img src="../${item.image_url}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60?text=Food'">
                        <div class="item-info">
                            <h4>${item.name}</h4>
                            <p>${item.total_orders} orders · ⭐ ${item.rating}</p>
                        </div>
                        <div class="item-price">Rs. ${item.price}</div>
                    </div>
                `).join('');
            })
            .catch(err => console.error('Error loading popular items:', err));
    }

    // ===================== LOAD ALL ORDERS =====================
    function loadOrders() {
        fetch(`${API_BASE}/orders`)
            .then(r => r.json())
            .then(orders => {
                const tbody = document.getElementById('allOrdersBody');
                if (!tbody) return;

                if (orders.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">No orders found</td></tr>`;
                    return;
                }

                tbody.innerHTML = orders.map(o => `
                    <tr>
                        <td><strong>#MD-${String(o.id).padStart(4, '0')}</strong></td>
                        <td>${o.customer_name}</td>
                        <td>${o.customer_email}</td>
                        <td>${new Date(o.created_at).toLocaleDateString()}</td>
                        <td>Rs. ${o.total_amount.toLocaleString()}</td>
                        <td>
                            <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)" style="border:1px solid #ddd;padding:4px 8px;border-radius:6px;background:#fff;cursor:pointer;">
                                ${['pending','processing','confirmed','preparing','delivered','cancelled'].map(s =>
                                    `<option value="${s}" ${o.status === s ? 'selected' : ''}>${capitalize(s)}</option>`
                                ).join('')}
                            </select>
                        </td>
                        <td>
                            <button onclick="viewOrder(${o.id})" style="background:#1a73e8;color:#fff;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;">View</button>
                        </td>
                    </tr>
                `).join('');
            })
            .catch(err => console.error('Error loading orders:', err));
    }

    // ===================== LOAD MENU ITEMS (MOVED TO GLOBAL) =====================
    // Logic moved to loadAdminMenu() at the bottom of the file

    // ===================== LOAD CUSTOMERS =====================
    function loadCustomers() {
        fetch(`${API_BASE}/admin/customers`)
            .then(r => r.json())
            .then(customers => {
                const tbody = document.getElementById('customersBody');
                if (!tbody) return;

                if (customers.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;padding:20px;">No customers found</td></tr>`;
                    return;
                }

                tbody.innerHTML = customers.map(c => `
                    <tr>
                        <td>${c.id}</td>
                        <td>${c.firstName} ${c.lastName}</td>
                        <td>${c.email}</td>
                        <td>${c.phone || '—'}</td>
                        <td>${c.total_orders}</td>
                        <td>Rs. ${parseFloat(c.total_spent).toLocaleString()}</td>
                    </tr>
                `).join('');
            })
            .catch(err => console.error('Error loading customers:', err));
    }

    // ===================== LOAD MESSAGES =====================

    // Shared render — used by loadMessages() and the markread handler
    function renderMessages(messages) {
        const tbody = document.getElementById('messagesBody');
        if (!tbody) return;
        window._adminMessages = messages;

        if (!messages.length) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;padding:24px;">No messages yet</td></tr>`;
        } else {
            tbody.innerHTML = messages.map(m => `
                <tr style="${m.status === 'unread' ? 'font-weight:700;background:#fffbf0;' : ''}">
                    <td>${m.name}</td>
                    <td>${m.email}</td>
                    <td>${m.subject || 'General Inquiry'}</td>
                    <td>${new Date(m.created_at).toLocaleDateString()}</td>
                    <td>
                        <span class="status-badge ${m.status === 'unread' ? 'processing' : 'delivered'}">
                            ${m.status === 'unread' ? 'Unread' : 'Read'}
                        </span>
                        <button data-action="view" data-msgid="${m.id}"
                            style="background:#555;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;margin-left:4px;font-size:12px;">View</button>
                        ${m.status === 'unread' ? `
                        <button data-action="markread" data-msgid="${m.id}"
                            style="background:#1a73e8;color:#fff;border:none;padding:2px 8px;border-radius:4px;cursor:pointer;margin-left:4px;font-size:12px;">Mark Read</button>` : ''}
                    </td>
                </tr>
            `).join('');
        }
        // Update bell badge
        const unread = messages.filter(m => m.status === 'unread').length;
        const badge = document.getElementById('notif-badge');
        if (badge) badge.textContent = unread;
    }

    function loadMessages() {
        fetch(`${API_BASE}/contact`)
            .then(r => r.json())
            .then(renderMessages)
            .catch(err => console.error('Error loading messages:', err));
    }

    // ===================== LOAD RESERVATIONS =====================
    window.loadReservations = function() {
        fetch(`${API_BASE}/reservations`)
            .then(r => r.json())
            .then(reservations => {
                const tbody = document.getElementById('reservationsBody');
                if (!tbody) return;
                window._adminReservations = reservations;

                if (reservations.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">No reservations found</td></tr>`;
                    return;
                }

                tbody.innerHTML = reservations.map(r => `
                    <tr>
                        <td><strong>#RS-${String(r.id).padStart(4, '0')}</strong></td>
                        <td>
                            <div style="font-weight:600;">${r.name}</div>
                            <div style="font-size:12px;color:#666;">${r.email}</div>
                        </td>
                        <td>${r.phone}</td>
                        <td>
                            <div style="font-weight:500;">${r.date}</div>
                            <div style="font-size:12px;color:#c9a84c;">${r.time}</div>
                        </td>
                        <td><i class="fas fa-users" style="margin-right:5px;font-size:12px;"></i>${r.guests}</td>
                        <td>
                            <select class="status-select" onchange="updateReservationStatus(${r.id}, this.value)" 
                                style="border:1px solid #ddd;padding:4px 8px;border-radius:6px;background:#fff;cursor:pointer; font-size:12px;">
                                ${['Pending', 'Approved', 'Cancelled', 'Completed'].map(s =>
                                    `<option value="${s}" ${r.status === s ? 'selected' : ''}>${s}</option>`
                                ).join('')}
                            </select>
                        </td>
                        <td>
                            <button onclick="viewReservation(${r.id})" style="background:#555;color:#fff;border:none;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;">View</button>
                        </td>
                    </tr>
                `).join('');
            })
            .catch(err => console.error('Error loading reservations:', err));
    }

    // ---- Event delegation: one listener handles all message buttons ----
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        const msgId  = parseInt(btn.dataset.msgid);
        const msg    = (window._adminMessages || []).find(m => m.id === msgId);

        if (action === 'view' && msg) {
            alert(
                `📧 From: ${msg.name}\n` +
                `📮 Email: ${msg.email}\n` +
                `📌 Subject: ${msg.subject || 'General Inquiry'}\n` +
                `🗓️ Date: ${new Date(msg.created_at).toLocaleString()}\n\n` +
                `💬 Message:\n${msg.message}`
            );
        }

        if (action === 'markread') {
            btn.textContent = 'Updating...';
            btn.disabled = true;
            fetch(`${API_BASE}/contact/${msgId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'read' })
            })
            .then(r => r.json())
            .then(res => {
                if (res.error) { alert('Error: ' + res.error); return; }
                fetch(`${API_BASE}/contact`)
                    .then(r => r.json())
                    .then(renderMessages);
            })
            .catch(err => alert('Failed to update. Is the server running?'));
        }
    });

    // ===================== SEARCH =====================
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const activeSection = document.querySelector('.content-section.active');
            if (!activeSection) return;

            const rows = activeSection.querySelectorAll('tbody tr');
            rows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
            });
        });
    }

    // ===================== ADD MENU ITEM =====================
    const addBtn = document.querySelector('.add-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const modal = document.getElementById('addItemModal');
            document.getElementById('menuModalTitle').textContent = 'Add New Menu Item';
            const form = document.getElementById('addItemForm');
            form.reset();
            form.elements['id'].value = '';
            document.getElementById('imagePreviewContainer').style.display = 'none';
            if (modal) modal.style.display = 'flex';
        });
    }

    const imageUrlInput = document.getElementById('menuImageUrl');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', (e) => {
            const val = e.target.value;
            const preview = document.getElementById('menuImagePreview');
            const container = document.getElementById('imagePreviewContainer');
            if (val && val.trim() !== '') {
                preview.src = '../' + val;
                container.style.display = 'flex';
                // Hide if error
                preview.onerror = () => { container.style.display = 'none'; };
            } else {
                container.style.display = 'none';
            }
        });
    }

    const addItemForm = document.getElementById('addItemForm');
    if (addItemForm) {
        addItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(addItemForm);
            const data = Object.fromEntries(formData.entries());
            data.available = 1; // Default to available

            // Bundle protein prices into extra_prices JSON
            const extra = {
                chicken: { s: data.p_chicken_s, l: data.p_chicken_l },
                fish:    { s: data.p_fish_s,    l: data.p_fish_l },
                veg:     { s: data.p_veg_s,     l: data.p_veg_l },
                egg:     { s: data.p_egg_s,     l: data.p_egg_l }
            };
            data.extra_prices = JSON.stringify(extra);

            // Clean up the temporary form fields
            delete data.p_chicken_s; delete data.p_chicken_l;
            delete data.p_fish_s;    delete data.p_fish_l;
            delete data.p_veg_s;     delete data.p_veg_l;
            delete data.p_egg_s;     delete data.p_egg_l;

            const isEdit = !!data.id;
            const method = isEdit ? 'PUT' : 'POST';
            const url = isEdit ? `${API_BASE}/menu/${data.id}` : `${API_BASE}/menu`;

            fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(r => r.json())
            .then(res => {
                if (res.error) {
                    alert('Error: ' + res.error);
                } else {
                    closeModal('addItemModal');
                    addItemForm.reset();
                    loadAdminMenu(); // Ensure the table refreshes
                    showPremiumPopup(isEdit ? 'Updated!' : 'Added!', isEdit ? 'Menu item updated successfully!' : 'Menu item added successfully!');
                }
            })
            .catch(err => alert('Failed to save item: ' + err.message));
        });
    }

    // ===================== MENU FILTER BUTTONS =====================
    const filterBtns = document.querySelectorAll('.menu-filters .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.textContent.trim().toLowerCase();
            const allRows = document.querySelectorAll('#menuItemsBody tr');
            allRows.forEach(row => {
                const rowCat = row.cells[2]?.textContent.toLowerCase() || '';
                row.style.display = (cat === 'all' || rowCat.includes(cat)) ? '' : 'none';
            });
        });
    });

    // ===================== ANIMATION FOR STAT CARDS =====================
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // ===================== LOGOUT =====================
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = 'login.html';
            }
        });
    }

    loadStats();
    loadRecentOrders();
    loadPopularItems();
    loadMessages(); // pre-load messages so they show immediately when tab is clicked
});

// ===================== GLOBAL FUNCTIONS =====================
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateOrderStatus(orderId, status) {
    fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) alert('Error: ' + data.error);
        else console.log(`Order #${orderId} status updated to ${status}`);
    })
    .catch(err => console.error('Error updating status:', err));
}

function viewOrder(orderId) {
    fetch(`http://localhost:5000/api/orders/${orderId}`)
        .then(r => r.json())
        .then(order => {
            const itemsText = order.items ? order.items.map(i => `  - ${i.item_name} x${i.quantity} = Rs.${i.total_price}`).join('\n') : 'No items';
            alert(
                `📦 Order #MD-${String(order.id).padStart(4, '0')}\n` +
                `👤 Customer: ${order.customer_name}\n` +
                `📧 Email: ${order.customer_email}\n` +
                `📍 Address: ${order.delivery_address}\n` +
                `💳 Payment: ${capitalize(order.payment_method)}\n` +
                `🔖 Status: ${capitalize(order.status)}\n` +
                `\n🛒 Items:\n${itemsText}\n` +
                `\n💰 Subtotal: Rs.${order.subtotal}\n` +
                `🚚 Shipping: Rs.${order.shipping}\n` +
                `✅ Total: Rs.${order.total_amount}`
            );
        })
        .catch(err => alert('Failed to load order: ' + err.message));
}

function updateReservationStatus(resId, status) {
    fetch(`${API_BASE}/reservations/${resId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) alert('Error: ' + data.error);
        else console.log(`Reservation #${resId} updated to ${status}`);
    })
    .catch(err => console.error('Error updating reservation status:', err));
}

function viewReservation(resId) {
    const res = (window._adminReservations || []).find(r => r.id === resId);
    if (!res) return;

    alert(
        `🗓️ Reservation #RS-${String(res.id).padStart(4, '0')}\n` +
        `👤 Customer: ${res.name}\n` +
        `📧 Email: ${res.email}\n` +
        `📞 Phone: ${res.phone}\n` +
        `📅 Date: ${res.date}\n` +
        `⏰ Time: ${res.time}\n` +
        `👥 Guests: ${res.guests}\n` +
        `🔖 Status: ${res.status}\n` +
        `\n💬 Special Requests:\n${res.special_requests || 'No special requests.'}\n` +
        `\n🕒 Created At: ${new Date(res.created_at).toLocaleString()}`
    );
}

function editMenuItem(id) {
    fetch(`${API_BASE}/menu/${id}`)
        .then(r => r.json())
        .then(item => {
            document.getElementById('menuModalTitle').textContent = 'Edit Menu Item';
            const form = document.getElementById('addItemForm');
            form.elements['id'].value = item.id;
            form.elements['name'].value = item.name;
            form.elements['description'].value = item.description || '';
            form.elements['price'].value = item.price;
            form.elements['price_large'].value = item.price_large || '';
            form.elements['category'].value = item.category || '';
            form.elements['image_url'].value = item.image_url || '';

            // Update preview
            const preview = document.getElementById('menuImagePreview');
            const container = document.getElementById('imagePreviewContainer');
            if (item.image_url) {
                preview.src = '../' + item.image_url;
                container.style.display = 'flex';
            } else {
                container.style.display = 'none';
            }

            // Populate protein prices
            if (item.extra_prices) {
                try {
                    const extra = JSON.parse(item.extra_prices);
                    form.elements['p_chicken_s'].value = extra.chicken?.s || '';
                    form.elements['p_chicken_l'].value = extra.chicken?.l || '';
                    form.elements['p_fish_s'].value    = extra.fish?.s    || '';
                    form.elements['p_fish_l'].value    = extra.fish?.l    || '';
                    form.elements['p_veg_s'].value     = extra.veg?.s     || '';
                    form.elements['p_veg_l'].value     = extra.veg?.l     || '';
                    form.elements['p_egg_s'].value     = extra.egg?.s     || '';
                    form.elements['p_egg_l'].value     = extra.egg?.l     || '';
                } catch (e) { console.error("Error parsing extra_prices", e); }
            } else {
                // Clear them if not present
                ['chicken','fish','veg','egg'].forEach(p => {
                    form.elements[`p_${p}_s`].value = '';
                    form.elements[`p_${p}_l`].value = '';
                });
            }
            
            document.getElementById('addItemModal').style.display = 'flex';
        })
        .catch(err => alert('Failed to load item: ' + err.message));
}

function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' })
        .then(r => r.json())
        .then(res => {
            if (res.error) alert('Error: ' + res.error);
            else { alert('Item deleted!'); loadAdminMenu(); }
        })
        .catch(err => alert('Error: ' + err.message));
}

function loadAdminMenu() {
    fetch(`${API_BASE}/menu`)
        .then(r => r.json())
        .then(items => {
            const tbody = document.getElementById('menuItemsBody');
            if (!tbody) return;
            
            if (items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:20px;">No menu items found</td></tr>`;
                return;
            }

            tbody.innerHTML = items.map(item => `
                <tr>
                    <td><img src="../${item.image_url}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${capitalize(item.category)}</td>
                    <td>Rs. ${item.price} ${item.price_large ? `<br><small style="color:#666;">(L: Rs. ${item.price_large})</small>` : ''}</td>
                    <td>⭐ ${item.rating}</td>
                    <td><span class="status-badge ${item.available ? 'delivered' : 'cancelled'}">${item.available ? 'Available' : 'Unavailable'}</span></td>
                    <td>
                        <button onclick="editMenuItem(${item.id})" style="background:#1a73e8;color:#fff;border:none;padding:4px 8px;border-radius:5px;cursor:pointer;margin-right:4px;">Edit</button>
                        <button onclick="deleteMenuItem(${item.id})" style="background:#e74c3c;color:#fff;border:none;padding:4px 8px;border-radius:5px;cursor:pointer;">Delete</button>
                    </td>
                </tr>
            `).join('');
        });
}

// markRead is handled by event delegation inside DOMContentLoaded

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// --- Premium Success Popup ---
window.showPremiumPopup = function(title, message) {
    const popup = document.getElementById('premiumSuccessPopup');
    const titleEl = document.getElementById('popupTitle');
    const msgEl = document.getElementById('popupMessage');
    
    if (titleEl) titleEl.textContent = title || 'Success!';
    if (msgEl) msgEl.textContent = message || 'Action completed successfully.';
    if (popup) popup.style.display = 'flex';
};

window.closePremiumPopup = function() {
    const popup = document.getElementById('premiumSuccessPopup');
    if (popup) popup.style.display = 'none';
};

// ===================== HOMEPAGE CONTENT MANAGEMENT =====================

function loadHomepageSection() {
    loadHpDishes();
    loadHpCollections();
}

function loadHpDishes() {
    fetch(`${API_BASE}/homepage/dishes?active=false`)
        .then(r => r.json())
        .then(items => renderHpTable('hpDishesBody', items, 'dish'))
        .catch(err => console.error('Error loading dishes:', err));
}

function loadHpCollections() {
    fetch(`${API_BASE}/homepage/collections?active=false`)
        .then(r => r.json())
        .then(items => renderHpTable('hpCollectionsBody', items, 'collection'))
        .catch(err => console.error('Error loading collections:', err));
}

function renderHpTable(tbodyId, items, type) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    if (!items.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#888;padding:24px;">No items yet. Click "Add" to create one.</td></tr>`;
        return;
    }
    tbody.innerHTML = items.map(item => `
        <tr>
            <td><img src="../${item.image_url}" alt="${item.name}"
                style="width:55px;height:45px;object-fit:cover;border-radius:6px;"
                onerror="this.src='https://via.placeholder.com/55x45'"></td>
            <td><strong>${item.name}</strong></td>
            <td style="max-width:200px;white-space:normal;font-size:13px;color:#888;">${item.description || '—'}</td>
            <td>${item.price}</td>
            <td>${item.sort_order}</td>
            <td>
                <span class="status-badge ${item.active ? 'delivered' : 'cancelled'}">
                    ${item.active ? 'Active' : 'Hidden'}
                </span>
            </td>
            <td>
                <button data-hpaction="edit" data-hptype="${type}" data-hpid="${item.id}"
                    style="background:#1a73e8;color:#fff;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;margin-right:4px;">Edit</button>
                <button data-hpaction="delete" data-hptype="${type}" data-hpid="${item.id}"
                    style="background:#e74c3c;color:#fff;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;">Delete</button>
            </td>
        </tr>
    `).join('');

    // Store items globally for edit lookup
    if (type === 'dish') window._hpDishes = items;
    else window._hpCollections = items;
}

// Tab switcher
function switchHpTab(tab) {
    const isDishes = tab === 'dishes';
    document.getElementById('hpDishesPanel').style.display = isDishes ? '' : 'none';
    document.getElementById('hpCollectionsPanel').style.display = isDishes ? 'none' : '';
    document.getElementById('tabDishes').classList.toggle('active', isDishes);
    document.getElementById('tabCollections').classList.toggle('active', !isDishes);
}

// Open modal for Add or Edit
function openHpModal(type, id) {
    const modal = document.getElementById('hpItemModal');
    document.getElementById('hpItemType').value = type;
    document.getElementById('hpItemId').value = id || '';
    document.getElementById('hpModalTitle').textContent = id ? `Edit ${type === 'dish' ? 'Dish' : 'Collection'}` : `Add ${type === 'dish' ? 'Dish' : 'Collection'}`;

    if (id) {
        const items = type === 'dish' ? (window._hpDishes || []) : (window._hpCollections || []);
        const item = items.find(i => i.id === id);
        if (item) {
            document.getElementById('hpName').value = item.name;
            document.getElementById('hpDescription').value = item.description || '';
            document.getElementById('hpPrice').value = item.price;
            document.getElementById('hpPriceLarge').value = item.price_large || '';
            document.getElementById('hpImageUrl').value = item.image_url || '';
            document.getElementById('hpLinkUrl').value = item.link_url || 'fooddetail.html';
            document.getElementById('hpSortOrder').value = item.sort_order || 0;
            document.getElementById('hpActive').checked = !!item.active;
        }
    } else {
        document.getElementById('hpItemForm').reset();
        document.getElementById('hpLinkUrl').value = 'fooddetail.html';
        document.getElementById('hpActive').checked = true;
    }

    modal.style.display = 'flex';
}

// Homepage modal form submit
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('hpItemForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const type    = document.getElementById('hpItemType').value;
            const id      = document.getElementById('hpItemId').value;
            const endpoint = type === 'dish' ? 'dishes' : 'collections';

            const body = {
                name:        document.getElementById('hpName').value.trim(),
                description: document.getElementById('hpDescription').value.trim(),
                price:       document.getElementById('hpPrice').value.trim(),
                price_large: document.getElementById('hpPriceLarge').value.trim(),
                image_url:   document.getElementById('hpImageUrl').value.trim(),
                link_url:    document.getElementById('hpLinkUrl').value.trim() || 'fooddetail.html',
                sort_order:  parseInt(document.getElementById('hpSortOrder').value) || 0,
                active:      document.getElementById('hpActive').checked ? 1 : 0
            };

            const method = id ? 'PUT' : 'POST';
            const url = id
                ? `${API_BASE}/homepage/${endpoint}/${id}`
                : `${API_BASE}/homepage/${endpoint}`;

            const submitBtn = document.getElementById('hpSubmitBtn');
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            .then(r => r.json())
            .then(res => {
                submitBtn.textContent = 'Save';
                submitBtn.disabled = false;
                if (res.error) { alert('Error: ' + res.error); return; }
                closeModal('hpItemModal');
                type === 'dish' ? loadHpDishes() : loadHpCollections();
                showPremiumPopup('Updated!', 'Homepage content updated successfully!');
            })
            .catch(err => {
                submitBtn.textContent = 'Save';
                submitBtn.disabled = false;
                alert('Failed to save. Is the server running?');
            });
        });
    }
});

// Delete and Edit handlers via event delegation
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-hpaction]');
    if (!btn) return;

    const action = btn.dataset.hpaction;
    const type   = btn.dataset.hptype;
    const id     = parseInt(btn.dataset.hpid);
    const endpoint = type === 'dish' ? 'dishes' : 'collections';

    if (action === 'edit') {
        openHpModal(type, id);
    }

    if (action === 'delete') {
        if (!confirm(`Delete this ${type}? This will also remove it from the homepage.`)) return;
        fetch(`${API_BASE}/homepage/${endpoint}/${id}`, { method: 'DELETE' })
            .then(r => r.json())
            .then(res => {
                if (res.error) { alert('Error: ' + res.error); return; }
                type === 'dish' ? loadHpDishes() : loadHpCollections();
            })
            .catch(() => alert('Delete failed. Check server connection.'));
    }
});
