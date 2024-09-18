const { v4: uuidv4 } = require('uuid');
const uuid = require('uuid');
const id = uuid.v4();
const idFour = uuid.v4();

function pakkiSecutivo() {
  // setTimeout(pakkiSecutivo, 5000); 
  const numerosAlea = Math.floor(Math.random() * 100000); // Genera un número aleatorio de 4 dígitos
  const numerosAleatorios = Math.floor(Math.random() * 100000000); // Genera un número aleatorio de 5 dígitos
  const letrasAleatorias = Math.random().toString(36).substring(2, 6); // Genera una cadena aleatoria de 4 caracteres
  const horaActual = Date.now().toString().substring(8); // Obtiene los últimos 5 dígitos de la hora actual en milisegundos
  
  const numeroConsecutivo = `${Math.random().toString(36).substring(2, 8)}-${numerosAleatorios}-${letrasAleatorias}-${horaActual}-${Math.random().toString(36).substring(2, 8)}`; // Une los valores generados en el formato deseado
  setTimeout(pakkiSecutivo, 5000); 
  return numeroConsecutivo;
}

async function generateUID() {
   // Esperar 5 segundos antes de llamar a generateUUID() de nuevo
  const node = [0x01, 0x23, 0x45, 0x67, 0x89, 0xab]; // Valor arbitrario para el nodo
  const currentMillis = new Date().getTime(); // Obtener los milisegundos actuales
  const uuidOptions = {node: node, clockseq: currentMillis % 0x3fff}; // Opciones para la generación de UUID
  
  return uuidv4(uuidOptions);
}

// Generar un nuevo UUID cada vez que sea necesario
function GenerateFDXID() {
  return `fdxco-${uuid.v4()}`;
}
const GenerateID = () => {
  return uuid.v4()
}

module.exports = {
  pakkiSecutivo,
  generateUID,
  GenerateFDXID,
  GenerateID,
};