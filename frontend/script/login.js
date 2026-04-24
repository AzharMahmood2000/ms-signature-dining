document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector("form");
    const username = document.querySelector("input[type='text']");
    const password = document.querySelector("input[type='password']");

    form.addEventListener("submit", function (e) {
        e.preventDefault(); // stop page reload

        let userValue = username.value.trim();
        let passValue = password.value.trim();

        // Validation
        if (userValue === "" || passValue === "") {
            alert("Please fill in all fields!");
            return;
        }

        if (passValue.length < 6) {
            alert("Password must be at least 6 characters!");
            return;
        }

        // Backend API connection
        const loginData = { username: userValue, password: passValue };

        fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Login Failed: " + data.error);
            } else {
                alert("Login successful!");
                // Store user info if needed
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to Home.html
                window.location.href = "Home.html";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Something went wrong. Please try again later.");
        });
    });

    // Social buttons (optional demo)
    const socialButtons = document.querySelectorAll(".social-btn");

    socialButtons.forEach(button => {
        button.addEventListener("click", () => {
            alert("Social login coming soon!");
        });
    });

});