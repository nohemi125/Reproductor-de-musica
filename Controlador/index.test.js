const login = require('./login'); //importa la funcion loginUser que se va probar
const User = require('../Modelo/User'); //importa el modelo user que se vutiliza de la funcion login que interactua con la bd

jest.mock('../Modelo/User'); //simula una base de datos inreal

describe('Pruebas unitarias del login', () => {  // Aquí se agrupan todas las pruebas relacionadas con la función login
  it('Debe fallar si los campos están vacíos', async () => {
    const result = await login('', ''); //función falle si los campos email y password están vacíos.
    expect(result).toEqual({ success: false, message: 'Campos obligatorios' });
  });

  it('Debe fallar si el usuario no existe', async () => { //it: Define una prueba específica
    User.findOne.mockResolvedValue(null); //Simula que la función User.findOne (que busca un usuario en la base de datos) devuelve null, lo que significa que el usuario no existe.
    const result = await login('test@correo.com', '1234'); //Llama a la función login con un correo y contraseña.
    expect(result).toEqual({ success: false, message: 'Usuario no encontrado' });
  });

  it('Debe fallar si la contraseña es incorrecta', async () => {
    User.findOne.mockResolvedValue({ //User.findOne.mockResolvedValue Simula que la función User.findOne encuentra un usuario en la base de datos.
      comparePassword: jest.fn().mockResolvedValue(false) //devuelve false, lo que significa que la contraseña es incorrecta.
    });
    const result = await login('test@correo.com', 'incorrecta'); //Llama a la función login (que está definida en login.js) con dos argumentos:
    expect(result).toEqual({ success: false, message: 'Contraseña incorrecta' }); //Verifica que el valor de result (el resultado de la función login) sea igual al valor esperado.
  });

  it('Debe pasar si el usuario y contraseña son correctos', async () => {
    User.findOne.mockResolvedValue({ // Simula que la función User.findOne encuentra un usuario en la base de datos.
      comparePassword: jest.fn().mockResolvedValue(true) 
    });
    const result = await login('test@correo.com', '1234'); //Llama a la función login con un correo y una contraseña correcta.
    expect(result).toEqual({ success: true, message: 'Login exitoso' });
  });
});
