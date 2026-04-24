document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('reservationForm');
    const btn = document.getElementById('btnReserve');
    const successMsg = document.getElementById('resSuccessMsg');

    // ── Date constraint (prevent past dates) ──
    const dateInput = document.getElementById('resDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // ── Pre-fill user data if logged in ──
    let user_id = null;
    const storedUser = localStorage.getItem('loggedInUser') || sessionStorage.getItem('user');
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            user_id = user.id;
            
            document.getElementById('resName').value = user.name || user.username || '';
            document.getElementById('resEmail').value = user.email || '';
            document.getElementById('resPhone').value = user.phone || '';
        } catch (e) {
            console.error("Could not parse user data", e);
        }
    }

    // ── Form Submission ──
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Gather data
        const payload = {
            user_id: user_id,
            name: document.getElementById('resName').value.trim(),
            email: document.getElementById('resEmail').value.trim(),
            phone: document.getElementById('resPhone').value.trim(),
            guests: parseInt(document.getElementById('resGuests').value, 10),
            date: document.getElementById('resDate').value,
            time: document.getElementById('resTime').value,
            special_requests: document.getElementById('resRequests').value.trim()
        };

        // UI State
        btn.disabled = true;
        btn.textContent = 'Submitting Request...';

        // Send to API
        fetch('http://localhost:5000/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            // Success: hide form, show success message
            form.style.display = 'none';
            successMsg.style.display = 'block';
        })
        .catch(err => {
            console.error('Reservation Error:', err);
            alert('Failed to submit reservation. Please try again or call us directly.');
            btn.disabled = false;
            btn.textContent = 'Confirm Reservation';
        });
    });

});
