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

        // Demo login (replace with backend later)
        if (userValue === "admin" && passValue === "123456") {
            alert("Login successful!");

            // Redirect to homepage (change file name if needed)
            window.location.href = "index.html";
        } else {
            alert("Invalid username or password!");
        }
    });

    // Social buttons (optional demo)
    const socialButtons = document.querySelectorAll(".social-btn");

    socialButtons.forEach(button => {
        button.addEventListener("click", () => {
            alert("Social login coming soon!");
        });
    });

});