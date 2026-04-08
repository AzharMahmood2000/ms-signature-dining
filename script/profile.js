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
       Profile Update Simulation
    ========================== */
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newName = document.getElementById('inputName').value;
            const displayName = document.getElementById('displayName');
            
            displayName.textContent = newName;

            const btn = profileForm.querySelector('.save-changes-btn');
            btn.textContent = "Updating...";
            btn.disabled = true;

            setTimeout(() => {
                alert("Account information updated successfully!");
                btn.textContent = "Update Profile";
                btn.disabled = false;
            }, 1000);
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
                window.location.href = 'login.html';
            }
        });
    }
});
