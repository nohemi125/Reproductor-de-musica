// Selecciona el formulario
const loginForm = document.getElementById('loginForm');

// Maneja el evento de envío del formulario
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Obtén los valores de los campos
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;



    if (!name || !email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
  

    try {
        // Envía los datos al backend usando fetch
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registro exitoso');
            // Redirige a otra página después del inicio de sesión
            window.location.href = '/index.html'; // Cambia esto según tu flujo
        } else {
            alert(data.message || 'Error al registrar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar registrar usuario.');
    }
});