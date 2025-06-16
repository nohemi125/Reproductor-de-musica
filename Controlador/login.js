const User = require('../Modelo/User'); // USER
// variable que representa a los usuarios en tu base de datos
//la funcion loginUser realiza la logica de inicio de sesion hace toda la validacion
const loginUser = async (email, password) => { // recibe 2 parametros email, contraseñaloginuser
  if (!email || !password) { // Verificar si los campos están vacíos
    return { success: false, message: 'Campos obligatorios' };
  }

  const user = await User.findOne({ email }); //busca en la base de datos usando el modelo User si hay un usuario con el email proporcionado
  if (!user) { //busca en ña bd usando el modelo User
    return { success: false, message: 'Usuario no encontrado' };
  }

  //Compara la contraseña proporcionada con la contraseña almacenada en la base de datos.
  const isMatch = await user.comparePassword(password); // Usa el método comparePassword que está definido en el modelo User.
  //Este método compara la contraseña que ingresó el usuario con la que está guardada
  if (!isMatch) {
    return { success: false, message: 'Contraseña incorrecta' };
  }

  return { success: true, message: 'Login exitoso' };
};

module.exports = loginUser;
