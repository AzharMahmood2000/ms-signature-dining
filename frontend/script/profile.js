document.addEventListener('DOMContentLoaded', () => {

    /* =========================
       Section Toggling
    ========================== */
    const sideLinks = document.querySelectorAll('.side-nav a');
    const sections = document.querySelectorAll('.content-section');

    sideLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-section');

            // Update active link
            sideLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(sec => {
                if (sec.id === target + 'Section') {
                    sec.classList.remove('hidden');
                } else {
                    sec.classList.add('hidden');
                }
            });
        });
    });

    /* =========================
       Avatar Upload Simulation
    ========================== */
    const avatarInput = document.getElementById('avatarUpload');
    const editAvatarBtn = document.querySelector('.edit-avatar');
    const userAvatar = document.getElementById('userAvatar');

    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', () => {
            avatarInput.click();
        });
    }

    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    userAvatar.src = event.target.result;
                    alert("Profile picture updated successfully!");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    /* =========================
       Profile Update
    ========================== */
    const profileForm = document.getElementById('profileForm');
    const user = JSON.parse(localStorage.getItem('user'));

    // Pre-fill form with logged in user data
    if (user) {
        const dName = document.getElementById('displayName');
        const iName = document.getElementById('inputName');
        const iEmail = document.getElementById('inputEmail');
        const iPhone = document.getElementById('inputPhone');

        if (dName) dName.textContent = user.firstName || user.username || 'User';
        if (iName) iName.value = user.firstName || user.username || '';
        if (iEmail) iEmail.value = user.email || '';
        if (iPhone) iPhone.value = user.phone || '';
    } else {
        alert("Please login first!");
        window.location.href = "login.html";
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('inputName').value;
            const lastName = document.getElementById('inputLastName')?.value || ""; 
            const phone = document.getElementById('inputPhone')?.value || "";
            
            const btn = profileForm.querySelector('.save-changes-btn');
            btn.textContent = "Updating...";
            btn.disabled = true;

            const updateData = { id: user.id, firstName, lastName, phone };

            fetch('http://localhost:5000/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("Error: " + data.error);
                } else {
                    alert("Account information updated successfully!");
                    user.firstName = firstName;
                    localStorage.setItem('user', JSON.stringify(user));
                    document.getElementById('displayName').textContent = firstName;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Update failed.");
            })
            .finally(() => {
                btn.textContent = "Update Profile";
                btn.disabled = false;
            });
        });
    }

    /* =========================
       Security Settings
    ========================== */
    const securityForm = document.getElementById('securityForm');

    if (securityForm && user) {
        securityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const currentPass = document.getElementById('currentPassword').value;
            const newPass = document.getElementById('newPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;

            if (newPass !== confirmPass) {
                alert("New passwords do not match!");
                return;
            }

            if (newPass.length < 6) {
                alert("New password must be at least 6 characters long.");
                return;
            }

            const btn = securityForm.querySelector('.save-changes-btn');
            const originalText = btn.textContent;
            btn.textContent = "Updating...";
            btn.disabled = true;

            const payload = {
                id: user.id,
                currentPassword: currentPass,
                newPassword: newPass
            };

            fetch('http://localhost:5000/api/profile/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("Error: " + data.error);
                } else {
                    alert("Password updated successfully!");
                    securityForm.reset();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Password update failed. Please try again.");
            })
            .finally(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            });
        });
    }

    /* =========================
       Logout Logic
    ========================== */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to log out?")) {
                alert("Logging out...");
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
});
