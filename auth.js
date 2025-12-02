// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'none';
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = result.message || 'Login successful! Redirecting...';
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.error || 'Login failed. Please try again.';
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.style.display = 'block';
            console.error('Login error:', error);
        }
    });
}

// Handle registration form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        const messageDiv = document.getElementById('message');
        messageDiv.style.display = 'none';
        
        // Validate password
        if (data.password.length < 6) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Password must be at least 6 characters long.';
            messageDiv.style.display = 'block';
            return;
        }
        
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                messageDiv.className = 'message success';
                messageDiv.textContent = result.message || 'Registration successful! Redirecting to login...';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = result.error || 'Registration failed. Please try again.';
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.style.display = 'block';
            console.error('Registration error:', error);
        }
    });
}

