document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            console.log('Enviando solicitud de registro...');
            const response = await fetch('http://localhost:2000/api/auth/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    nombre,
                    email,
                    password
                })
            });

            console.log('Respuesta recibida:', response.status);
            const data = await response.json();
            console.log('Datos de respuesta:', data);

            if (response.ok) {
                alert('Registro exitoso');
                window.location.href = '/index.html';
            } else {
                alert(data.error || 'Error en el registro');
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            alert('Error al registrar usuario');
        }
    });
});