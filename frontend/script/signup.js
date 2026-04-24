document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get field values
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Simple Validation
            if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
                alert("Please fill in all fields.");
                return;
            }

            // Password Match Check
            if (password !== confirmPassword) {
                alert("Passwords do not match! Please try again.");
                return;
            }

            // Password Length Check
            if (password.length < 6) {
                alert("Password should be at least 6 characters long.");
                return;
            }

            // backend connection
            const userData = { firstName, lastName, email, phone, password };

            fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("Error: " + data.error);
                } else {
                    alert(`Account created successfully for ${firstName}! Redirecting to login...`);
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Something went wrong. Please try again later.");
            });
        });
    }

    // Social Signup Simulation
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.textContent.includes('Google') ? 'Google' : 'Apple';
            alert(`Redirecting to ${provider} authentication...`);
        });
    });
});
