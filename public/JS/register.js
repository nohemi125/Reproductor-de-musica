// Selecciona el formulario
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


s
    if (!name || !email || !password) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    
  

    try {
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
            window.location.href = '/index.html'; 
        } else {
            alert(data.message || 'Error al registrar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ocurrió un error al intentar registrar usuario.');
    }
});