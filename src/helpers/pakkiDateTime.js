const { DateTime, Settings, Info, Zone, Duration } = require("luxon");
const weekend = require("../models/weekend");
const Holidays = require("../models/Holidays");

let date = DateTime.local().setZone('UTC-5');
let dates = DateTime.local().setZone('UTC-5');

const now = DateTime.local();
let DateNew = now;

const fch = DateTime.fromISO(date);
const FormattedDate = fch.plus({ days: 2, hours: 5, minutes: 30 }).toFormat("yyyy-MM-dd'T'HH:mm:ss");


// Establece la zona horaria a Colombia (Bogotá)
const fechaColombia = date.setZone('America/Bogota');

async function MarcaDeTiempoCol() {
  const fechaColombia = DateTime.now().setZone('America/Bogota');
  return fechaColombia.toFormat('dd/MM/yyyy, HH:mm:ss');
}

// Convierte la fecha a formato deseado (por ejemplo, 'dd/MM/yyyy, HH:mm:ss')
const fechaFormateadaStringCol = fechaColombia.toFormat('dd/MM/yyyy, HH:mm:ss');

// imprime algo como: 2023-03-23T13:30:45.123-05:00
const marcaDeTiempo = date.toISO({ format: "extended" }); 
const marcaDeTiempoInter = date.toISO({ format: 'yyyy-MM-dd\'T\'HH:mm:ss' })

// Imprime la fecha actual en formato "2023-03-23"
const fecha = date.toISODate(); 

// Imprime la hora actual en formato "13:30:45"
const hora = date.toFormat("HH:mm:ss"); 

// Imprime la hora actual en formato "13:30"
const horaMinutos = date.toFormat("HH:mm"); 

function calcularFecha(dias) {
  const fecha = DateTime.local().plus({ days: dias }).toISODate();
  return fecha;
}

function CompararFecha(date) {
  // Define las dos fechas que deseas validar
  let fecha1 = DateTime.fromISO('date');

  if (DateTime.fromISO(date).isValid) {
    // Si la fecha es válida, continúa con el proceso
    fecha1 = DateTime.fromISO(date);
    // Haz algo con la fecha parseada
  } else {
    // Si la fecha no es válida, maneja el error
    // console.log('La fecha no está en el formato ISO 8601');
  }

  // Define el límite superior que deseas validar
  const limiteSuperior = now.plus({ days: 4 });

  console.log('limiteSuperior: ', limiteSuperior.toISODate());
  console.log('date: ', fecha1.toISODate());
  console.log('Comparacion: ', fecha1.toISODate() <= limiteSuperior.toISODate() );

  if ( fecha1.toISODate() <= limiteSuperior.toISODate() ) {
    return true;
  } else {
    return false;
  }
}

// Función que valida si una fecha está en la colección de feriados
async function isHoliday(date) {    
  const hd = await Holidays.find({ Date: date }, { day: 1, _id: 0 } );
  return hd;
}
async function isWeekend(date) {
  const wk = await weekend.find({ Date: date }, { day: 1, _id: 0 });
  return wk;
}

function sameDate(date) {
  const fecha = DateTime.fromISO(date);
  return fecha.toISODate();
}
async function nextBusinessDay() {

  const fechaIso8601 = "2023-05-08T14:21:11.590-05:00";
  const fecha = DateTime.fromISO(fechaIso8601);
  const fechaFormateada = fecha.plus({ days: 2, hours: 5, minutes: 30 }).toFormat("yyyy-MM-dd'T'HH:mm:ss");
  
  const holidays = await isHoliday(fechaFormateada)
  const weekends = await isWeekend(fechaFormateada)
  let DateNew = DateTime.fromISO(fechaFormateada);
  
  while (true) {
    // Validar si la hora actual es mayor de las 14:00
    if (DateNew.hour >= 14) {
      DateNew = DateNew.plus({ days: 1 });
    }
    // Validar si la fecha actual es fin de semana
    else if (weekends.includes(DateNew.toISODate())) {
      DateNew = DateNew.plus({ days: 1 });
    }
    // Validar si la fecha actual es festiva
    else if (holidays.includes(DateNew.toISODate())) {
      DateNew = DateNew.plus({ days: 1 });
    }
    // Fecha hábil encontrada
    else {
      break;
    }
  }
  // console.log(DateNew.toISO())
  return DateNew.toISO()
}

async function afterTwoInTheAfternoon(date) {
  let DateNew = ''

  // Crear un objeto DateTime a partir de la cadena de fecha y hora
  const fechaHora = DateTime.fromISO(date);
  // Verificar si la hora es mayor a las 14:00
  if (fechaHora.hour >= 14) {
    // Sumar un día a la fecha
    DateNew = fechaHora.plus({ days: 1 }).set({ hour: 9, minute: 0, second: 0 })
  
    // Obtener la fecha y hora formateada
    DateNew = DateNew.toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
    
    return DateNew
  }

  return fechaHora  
}
 
async function weekendDay(date) {
    let DateNew = ''

  // Crear un objeto DateTime a partir de la cadena de fecha y hora
    const fechaHora = DateTime.fromISO(date);
    // Obtener la hora en el formato deseado (15:00:25)
    const hour = fechaHora.toFormat('HH:mm:ss'); 

    // Obtener la fecha en el formato deseado (aaaa-mm-dd)
    DateNew = fechaHora
    
    const weekendDB = await weekend.find({ date: DateNew }, { day: 1, _id: 0 })
    
    if (weekendDB === 1) {
      DateNew = fechaHora.plus({ days: 1 });
    } else if (weekendDB === 7) {
      DateNew = fechaHora.plus({ days: 2 });
  }
  
  DateNew = DateNew.toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
  
  return DateNew
}
 

async function holiDay(date) {
    let DateNew = ''

  // Crear un objeto DateTime a partir de la cadena de fecha y hora
  const fechaHora = DateTime.fromISO(date);
    
  const weekendDB = await Holidays.find({ date: DateNew }, { day: 1, _id: 0 })
    
  if (weekendDB.length > 0) {
    DateNew = fechaHora.plus({ days: 1 });
    DateNew = DateNew.toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
    return DateNew
  }
  DateNew = fechaHora.toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
  return DateNew
}

function itIsEaster(fecha) {
  // Crear un objeto DateTime a partir de la cadena de fecha y hora
  // console.log('COntrol Fecha: ' + fecha)
  const fechaHora = DateTime.fromISO(fecha);
  const año = fechaHora.year;
  // console.log(año)
  let DateNew = fechaHora

  // Calcular el Domingo de Resurrección utilizando el algoritmo de Meeus/Jones/Butcher
  const a = año % 19;
  const b = Math.floor(año / 100);
  const c = año % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((año + 11 * h + 22 * l) / 451);
  const n = (h + l - 7 * m + 114);

  // Calcular el mes y el día del Domingo de Resurrección
  const mesDomingoResurreccion = Math.floor(n / 31);
  const diaDomingoResurreccion = (n % 31) + 1;

  // Verificar si la fecha corresponde al Jueves Santo, Viernes Santo, Sábado Santo o Domingo de Resurrección
  
  if (fechaHora.hasSame(DateTime.fromObject({ year: año, month: mesDomingoResurreccion, day: diaDomingoResurreccion - 3 }), 'day')) { // Jueves Santo
    DateNew = fechaHora.plus({ days: 4 }).set({ hour: 9, minute: 0, second: 0 })
  } else if (fechaHora.hasSame(DateTime.fromObject({ year: año, month: mesDomingoResurreccion, day: diaDomingoResurreccion - 2 }), 'day')) { // Viernes Santo
    DateNew = fechaHora.plus({ days: 3 }).set({ hour: 9, minute: 0, second: 0 })
  } else if (fechaHora.hasSame(DateTime.fromObject({ year: año, month: mesDomingoResurreccion, day: diaDomingoResurreccion - 1 }), 'day')) { // Sábado Santo
    DateNew = fechaHora.plus({ days: 2 }).set({ hour: 9, minute: 0, second: 0 })
  } else if (fechaHora.hasSame(DateTime.fromObject({ year: año, month: mesDomingoResurreccion, day: diaDomingoResurreccion }), 'day')) { // Domingo de Resurrección
    DateNew = fechaHora.plus({ days: 1 }).set({ hour: 9, minute: 0, second: 0 })
  }

  DateNew = {
    DateTime: DateNew.toFormat('yyyy-MM-dd\'T\'HH:mm:ss'),
    DateTimeDHL: DateNew.toFormat('yyyy-MM-dd')    
  }
  return DateNew
}

async function ConvertDateFDX(date) {
  const DateConvert = DateTime.fromISO(date);
  const formatoDeseado = 'yyyy-MM-dd HH:mm';
  return DateConvert.toFormat(formatoDeseado);
}

async function ConvertDateUPS(date) {
  const fechaOriginal = DateTime.fromFormat(date, 'yyyyMMdd');
  const formatoDeseado = 'yyyy-MM-dd';
  return fechaOriginal.toFormat(formatoDeseado);
}

function convertirMilisegundosAFecha(milisegundos) {
  const fecha = DateTime.fromMillis(milisegundos);
  const formatoFecha = fecha.toFormat('dd-MM-yyyy HH:mm:ss');
  return formatoFecha;
}

function convertirAFechaEstandar(milisegundos) {
  const fecha = DateTime.fromISO(milisegundos, {
    zone: 'utc'
  }); // Convertir la fecha a objeto DateTime
  const formatoFecha = fecha.toFormat('dd-MM-yyyy'); // Formatear la fecha según el formato deseado
  return formatoFecha;
}



const dte = date.minus(Duration.fromObject({ hours: 5 })); // restamos 5 hrs 
const dat = dte.toJSDate(); // seteamos a formato Json para guardar en la base

module.exports = {
  dates,
  marcaDeTiempo,
  marcaDeTiempoInter,
  fecha,
  hora,
  horaMinutos,
  calcularFecha,
  CompararFecha,
  sameDate,
  nextBusinessDay,
  FormattedDate,
  afterTwoInTheAfternoon,
  weekendDay,
  holiDay,
  itIsEaster,
  ConvertDateFDX,
  ConvertDateUPS,
  MarcaDeTiempoCol,
  convertirMilisegundosAFecha,
  convertirAFechaEstandar,
};