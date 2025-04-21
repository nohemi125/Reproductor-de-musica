// Selecciona el formulario
const loginForm = document.getElementById('loginForm');

// Maneja el evento de envío del formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Obtén los valores de los campos
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Envía los datos al backend usando fetch
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Inicio de sesión exitoso');
            // Redirige a otra página después del inicio de sesión
            window.location.href = '/dashboard.html'; // Cambia esto según tu flujo
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar iniciar sesión.');
    }
});