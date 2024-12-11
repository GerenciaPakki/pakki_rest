const fs = require('fs');
const config = require('../utils/config');
const path = require('path');
const { PDFDocument, rgb, degrees } = require('pdf-lib');
const imageToPdf = require('image-to-pdf');
const sharp = require('sharp');
const pathGuia = config.PATH_GUIA
const urlGuia = config.URL_GUIA
const { applogger } = require('../utils/logger');
const { buffer } = require('superagent');
const os = require('os');

async function converterPDF(base64Data, coId, tipDocu) {
  try {
    
    // Crea un buffer a partir de la cadena Base64
    const pdf = Buffer.from(base64Data, 'base64');

    // const pngBuffer = await sharp(pdf).toFormat('jpeg').toBuffer();
    // const img = pngBuffer.toString('base64');

    // const pdf1 = Buffer.from(img, 'base64');

    await savePDFInPath(pdf, coId, tipDocu)
    // await savePDFInPath(pngBuffer, coId, tipDocu)

    return pdf;
  } catch (error) {
    console.error('Error al convertir o guardar el PDF:', error);
    throw error;
  }
}

// Corregido para CDR
async function guardarDocumentoBase64(base64Data, coId, tipDocu) {
  let url = ''
 try {
    
    const proveedor = coId.substring(0, 3);
    const rutaDestino = path.join(__dirname, `Guias/${proveedor}`);
    const fileName = `${tipDocu}_${coId}.pdf`; // Guardamos la cadena Base64 con extensión .b64

    // Combinar la ruta destino con el nombre de archivo
    const rutaCompleta = path.join(rutaDestino, fileName);

    // Guardar la cadena Base64 en el archivo
   await fs.promises.writeFile(rutaCompleta, base64Data, 'base64');

   // Normaliza la ruta para manejar diferencias entre Windows y Unix
   const rutaNormalizada = path.normalize(rutaCompleta);
   console.log('Datos de Ingreso a URL_PDF: ',rutaNormalizada)

    //  TODO: EDITAMOS LA RUTA PARA QUE EL FRONT PUEDA DESCARGAR EL ARCHIVO
    // const partesRuta = rutaNormalizada.split(pathGuia);
    // const urlParte = partesRuta[1];
    url = `${urlGuia}/${proveedor}/${fileName}`;
    
    // Devolver la ruta del archivo guardado
    return url;
  } catch (error) {
    console.error('Error al guardar la cadena Base64 en el archivo guardarDocumentoBase64:', error);
    throw error;
  }
}
// Corregido para CDR
async function guardarPkgsBase64(base64Data, coId, tipDocu) {
  let url = ''
 try {
    const proveedor = coId.substring(0, 3);
    const rutaDestino = path.join(__dirname, `Guias/${proveedor}`);
    const fileName = `${tipDocu}_${coId}.pdf`; // Guardamos la cadena Base64 con extensión .b64

    // Combinar la ruta destino con el nombre de archivo
    const rutaCompleta = path.join(rutaDestino, fileName);

    // Guardar la cadena Base64 en el archivo
   await fs.promises.writeFile(rutaCompleta, base64Data, 'base64');

   // Normaliza la ruta para manejar diferencias entre Windows y Unix
   const rutaNormalizada = path.normalize(rutaCompleta);

    //  TODO: EDITAMOS LA RUTA PARA QUE EL FRONT PUEDA DESCARGAR EL ARCHIVO
    const partesRuta = rutaNormalizada.split(pathGuia);
    // const urlParte = partesRuta[1];
   url = `${urlGuia}/${proveedor}/${fileName}`;
    // Devolver la ruta del archivo guardado
    return url;
  } catch (error) {
    console.error('Error al guardar la cadena Base64 en el archivo guardarPkgsBase64:', error);
    throw error;
  }
}
// Corregido para CDR
// async function CartaResponsabilidadPDF() {
//   let url = ''
//   try {
//     const ruta = '/var/www/devback/Pakki_Rest/src/helpers/Guias/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf';
//     const rutaDestino = path.join(__dirname, 'Guias/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf');
//     // Normaliza la ruta para manejar diferencias entre Windows y Unix
//     const rutaNormalizada = path.normalize(ruta);
//     // const rutaNormalizada1 = path.normalize(rutaDestino);

//     //  TODO: EDITAMOS LA RUTA PARA QUE EL FRONT PUEDA DESCARGAR EL ARCHIVO
//     // const partesRuta = rutaNormalizada.split('/var/www/devback/Pakki_Rest/src/helpers/Guias/');
//     // const urlParte = partesRuta[1];
//     // url = `https://devfront.pakki.click/guias/${urlParte}`;
//     url = `https://devfront.pakki.click/guias/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf`;
//     // Devolver la ruta del archivo guardado
//     return url;
//   } catch (error) {
//     console.error('Error al guardar la cadena Base64 en el archivo:', error);
//     throw error;
//   }
// }

async function CartaResponsabilidadPDF() {
  let url = ''
  try {
    // const ruta = '/var/www/devback/Pakki_Rest/src/helpers/Guias/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf';

    // // Normaliza la ruta para manejar diferencias entre Windows y Unix
    // const rutaNormalizada = path.normalize(ruta);

    // //  TODO: EDITAMOS LA RUTA PARA QUE EL FRONT PUEDA DESCARGAR EL ARCHIVO
    // const partesRuta = rutaNormalizada.split('/var/www/devback/Pakki_Rest/src/helpers/Guias/');
    // const urlParte = partesRuta[1];
    // // url = `https://devfront.pakki.click/guias/${urlParte}`;
    url = path.normalize('https://devfront.pakki.click/guias/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf');

    // Devolver la ruta del archivo guardado
    return url;
  } catch (error) {
    console.error('Error al guardar la cadena Base64 en el archivo:', error);
    throw error;
  }
}



async function GetCartaResponsabilidadPDF() {
  try {
    // Detección del sistema operativo
    // const isWindows = os.platform() === 'win32';

    const ruta = `${pathGuia}/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf`;
    // const ruta1 = path.join(pathGuia, '/Document', 'CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf');
    // console.log(ruta);
    // const ruta2 = path.resolve(pathGuia, 'Document', 'CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf');
    // // Define la ruta en función del sistema operativo
    // const ruta = isWindows 
    //   ? path.join(pathGuia, 'CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf')
    //   : '/ruta/ubuntu/Pakki/portal/Pakki_Rest/src/helpers/Guias/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf';

    // Normaliza la ruta para evitar inconsistencias
    const rutaNormalizada = path.normalize(ruta);
    
    if (!fs.existsSync(rutaNormalizada)) {
      throw new Error(`El archivo no existe en la ruta: ${rutaNormalizada}`);
    }    

    // Lee el contenido del archivo PDF
    const contenidoPDF = fs.readFileSync(rutaNormalizada);
    // const contenidoPDF = fs.readFileSync(ruta);
    console.log('contenidoPDF: ', contenidoPDF);

    return contenidoPDF;
  } catch (error) {
    console.error('Error al leer el archivo PDF:', error);
    applogger.error(`Error en GetCartaResponsabilidadPDF > No se pudo leer la carta de responsabilidades. Error: ${error}`);

    // Devuelve un PDF vacío en caso de error
    const pdfVacio = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<>>\nstartxref\n0\n%%EOF');
    return pdfVacio;
  }
}

// async function GetCartaResponsabilidadPDF() {
//   try {
//     // Validacion para mi equipo local de Desarrollo
//     let ruta = '';
//     //const rutaWindows = 'C:\\Users\\LAMUX\\Desktop\\Pakki\\portal\\Pakki_Rest\\src\\helpers\\Guias\\Document\\CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf';
//     // console.log('pathGuia: ', pathGuia)
//     const rutaUbuntu = `${pathGuia}/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf`;
//     // const ruta1 = 'D:\\Desarrollo\\Pakki\\Pakki_Rest\\src\\helpers\\Guias\\Document\\CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf';
//     // Lee el contenido del archivo PDF
//     const contenidoPDF = fs.readFileSync(path.normalize(rutaUbuntu));
//     // const contenidoPDF = fs.readFileSync(ruta1);
//     console.log('contenidoPDF: ', contenidoPDF)

//     return contenidoPDF;
//   } catch (error) {
//     console.error('Error al leer el archivo PDF:', error);
//     applogger.error(`Error en GetCartaResponsabilidadPDF > No se pudo leer la carta de responsanilidades. Error: ${error}`);   
//     const pdfVacio = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<<>>\nstartxref\n0\n%%EOF');
//     return pdfVacio;
//     // throw error;
//   }
// }

// async function converterPDF_UPS(base64String, coId, tipDocu) {
//   try {
//     // Cadena Base64 de la imagen
//     const base64Data = base64String;

//     // Crea un buffer a partir de la cadena Base64
//     const imageBuffer = Buffer.from(base64Data, 'base64');

//     // Guarda la imagen temporalmente como archivo GIF
//     fs.writeFileSync('temp_image.gif', imageBuffer);

//     // Opciones para la conversión de imagen a PDF
//     const options = {
//       input: 'temp_image.gif',
//       output: 'Guia.gif',
//       size: '1400x800'
//     };

//     // Convierte la imagen a PDF
//     const pdf = await imageToPdf(options);
    
//     return pdf;
//   } catch (error) {
//     console.error('Error al convertir la imagen en PDF:', error);
//     throw error; // Relanzamos el error para que sea capturado por el código que llame a esta función.
//   } finally {
//     // Elimina la imagen temporal (independientemente de si hubo un error o no)
//     try {
//       fs.unlinkSync('temp_image.gif');
//     } catch (error) {
//       console.error('Error al eliminar la imagen temporal:', error);
//     }
//   }
// }

async function converterPDF_UPS(base64String, coId, tipDocu) {
  try {
    const base64Data = base64String;
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageBuffer1 = await sharp(imageBuffer).toFormat('png').toBuffer();
    // fs.writeFileSync('temp_image.gif', imageBuffer1);
    fs.writeFileSync('temp_image.png', imageBuffer1);

    // Usar imageToPdf para convertir la imagen
    const options = {
      input: ['temp_image.png'],
      output: 'Guia.gif',
      size: '700x400'
    };

    const pdfBuffer = await imageToPdf(options.input, options.size); // Asegúrate de que esta función retorna un buffer de PDF
    return pdfBuffer;
  } catch (error) {
    console.error('Error al convertir la imagen en PDF:', error);
    throw error;
  } 
  // finally {
  //   try {
  //     fs.unlinkSync('temp_image.gif');
  //   } catch (error) {
  //     console.error('Error al eliminar la imagen temporal:', error);
  //   }
  // }
}

// Función para convertir la cadena Base64 a un archivo PDF
async function convertBase64ToPDF(base64String, coId, tipDocu) {

  const proveedor = coId.substring(0, 3);
  const rutaDestino = path.join(__dirname, `Guias/${proveedor}`);
  const fileName = `${tipDocu}_${coId}.pdf`; // Guardamos la cadena Base64 con extensión .b64

  const outputFilePath = rutaDestino
  // Decodificar la cadena Base64 a un Buffer
  const pdfBuffer = Buffer.from(base64String, 'base64');

  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();

  // Agregar la página al documento
  const page = pdfDoc.addPage([595, 842]); // Tamaño A4 (595x842)

  // Convertir el Buffer a una imagen y dibujarla en la página
  const jpgImage = await pdfDoc.embedJpg(pdfBuffer);
  const jpgDims = jpgImage.scale(1);
  page.drawImage(jpgImage, {
    x: 0,
    y: 0,
    width: jpgDims.width,
    height: jpgDims.height,
  });

  // Guardar el archivo PDF en el disco
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputFilePath, pdfBytes);

  // console.log('Archivo PDF generado correctamente.');
  return pdfBytes
}

// Usado por UPS
// async function savePDFInPath(pdf, coId, tipDocu) {
//   const proveedor = coId.substring(0, 3);
//   const rutaDestino = path.join(__dirname, `Guias/${proveedor}`);
//   const fileName = `${tipDocu}_${coId}.pdf`;
//   let url = ''

//   try {
//     // Crea el directorio si no existe
//     if (!fs.existsSync(rutaDestino)) {
//       fs.mkdirSync(rutaDestino, { recursive: true });
//     }

//     // Genera la ruta completa del archivo PDF
//     const rutaCompleta = path.join(rutaDestino, fileName);

//     // Guarda el archivo PDF en la ruta especificada
//     await fs.writeFileSync(rutaCompleta, pdf);
//      // Normaliza la ruta para manejar diferencias entre Windows y Unix
//    const rutaNormalizada = path.normalize(rutaCompleta);

//     //  TODO: EDITAMOS LA RUTA PARA QUE EL FRONT PUEDA DESCARGAR EL ARCHIVO
//     const partesRuta = rutaNormalizada.split(pathGuia);
//     // const urlParte = partesRuta[1];
//     url = `${urlGuia}/${proveedor}/${fileName}`;
//     // Devolver la ruta del archivo guardado
//     return url;
//     // console.log('Archivo PDF guardado exitosamente en:', rutaCompleta);
//   } catch (error) {
//     console.error('Error al guardar el PDF:', error);
//     return error;
//   }
// }
async function savePDFInPath(pdf, coId, tipDocu) {
  const proveedor = coId.substring(0, 3);
  const rutaDestino = path.join(__dirname, `Guias/${proveedor}`);
  const fileName = `${tipDocu}_${coId}.pdf`;

  try {
    if (!fs.existsSync(rutaDestino)) {
      fs.mkdirSync(rutaDestino, { recursive: true });
    }

    const rutaCompleta = path.join(rutaDestino, fileName);

    // Usar fs.promises para escribir el archivo de manera asíncrona
    await fs.promises.writeFile(rutaCompleta, pdf);
    const rutaNormalizada = path.normalize(rutaCompleta);

    const url = `${urlGuia}/${proveedor}/${fileName}`;
    return url;
  } catch (error) {
    console.error('Error al guardar el PDF:', error);
    return error;
  }
}

// Usado por UPS
async function savePDFDocumentInPath(pdf, coId, tipDocu) {
  const proveedor = coId.substring(0, 3);
  const rutaDestino = path.join(__dirname, `Guias/${proveedor}`);
  const fileName = `${tipDocu}_${coId}.pdf`;
  let url = ''

  try {
    // Crea el directorio si no existe
    if (!fs.existsSync(rutaDestino)) {
      fs.mkdirSync(rutaDestino, { recursive: true });
    }

    // Genera la ruta completa del archivo PDF
    const rutaCompleta = path.join(rutaDestino, fileName);

    // Guarda el archivo PDF en la ruta especificada
    await fs.writeFileSync(rutaCompleta, pdf);
     // Normaliza la ruta para manejar diferencias entre Windows y Unix
    const rutaNormalizada = path.normalize(rutaCompleta);

    //  TODO: EDITAMOS LA RUTA PARA QUE EL FRONT PUEDA DESCARGAR EL ARCHIVO
    const partesRuta = rutaNormalizada.split(pathGuia);
    const urlParte = partesRuta[1];
    url = `${urlGuia}${urlParte}`;
    // Devolver la ruta del archivo guardado
    return url;
    // console.log('Archivo PDF guardado exitosamente en:', rutaCompleta);
  } catch (error) {
    console.error('Error al guardar el PDF:', error);
    return error;
  }
}

// Usado por UPS
function esGIF(imageBytes) {
  // Verificar si los primeros 4 bytes del buffer coinciden con el encabezado de un archivo GIF
  const gifHeader = Buffer.from('474946383761', 'hex'); // Encabezado GIF (GIF87a)
  const gifHeaderAlt = Buffer.from('474946383961', 'hex'); // Encabezado GIF (GIF89a)
  return (
    imageBytes.slice(0, 6).equals(gifHeader) ||
    imageBytes.slice(0, 6).equals(gifHeaderAlt)
  );
}

// Usado por UPS

async function convertirImagenAPDF(base64Data) {
  try {
    // Decodifica el Base64 y crea un buffer
    const imageBytes = Buffer.from(base64Data, 'base64');

    // Determinar el formato de la imagen
    const imageFormat = esGIF(imageBytes) ? 'png' : 'jpeg';

    // Cargar la imagen en sharp para obtener las dimensiones y mejorar la resolución
    const imageInfo = await sharp(imageBytes).metadata();
    const {
      width,
      height
    } = imageInfo;
    const escalarAMitad = width > 200 || height > 200;
    const nuevaResolucion = 300; // Nueva resolución deseada en píxeles por pulgada (dpi)

    let imagenEscalada = sharp(imageBytes);

    // Escalar a la mitad si es necesario
    if (escalarAMitad) {
      imagenEscalada = imagenEscalada.resize(Math.ceil(width / 2), Math.ceil(height / 2));
    }

    // Aumentar la resolución de la imagen
    imagenEscalada = imagenEscalada.clone().resize({
      density: nuevaResolucion
    });

    // Convertir la imagen a PNG si es un GIF o si es necesario escalar a la mitad
    if (imageFormat === 'png' || escalarAMitad) {
      const pngImage = await imagenEscalada.toFormat('png').toBuffer();
      return crearPDF(pngImage);
    }

    const jpegImage = await imagenEscalada.toFormat('jpeg').toBuffer();
    return crearPDF(jpegImage);
  } catch (error) {
    console.error('Error al convertir la imagen a PDF:', error);
    throw error;
  }
}

// Usado por UPS
async function crearPDF(imageBytes) {
  try {
    // Crea un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // Carga la imagen en el documento PDF
    const image = await pdfDoc.embedPng(imageBytes); // Utiliza embedPng para PNG y embedJpg para JPEG
    const imageDims = image.scale(0.5); // Escala la imagen para que ocupe el tamaño completo de la página

    // Girar la imagen 45 grados a la derecha (usando objeto Rotation)
    const rotateAngle = degrees(-90); // Utiliza la función degrees para crear un objeto Rotation
    page.drawImage(image, {
      x: 50,
      y: page.getSize().height - imageDims.height - -180,
      width: imageDims.width,
      height: imageDims.height,
      rotate: rotateAngle, // Pasar el objeto Rotation en lugar del valor numérico
    });

    // Guarda el documento PDF en un buffer
    const pdfBuffer = await pdfDoc.save();

    return pdfBuffer;
  } catch (error) {
    console.error('Error al crear el PDF:', error);
    throw error;
  }
}

// hasta aqui UPS

async function GetViewDocumentsPDF(guia) {
  const partesGuia = guia.split('-')[0];
  const path_Guia = partesGuia.slice(0, 3);
  try {
    
    // Validacion para mi equipo local de Desarrollo
    // let ruta = '';
    const rutaCarta = `${urlGuia}/Document/CARTA_DE_RESPONSABILIDAD_CLIENTES.pdf`;
    const rutaGuia = `${urlGuia}/${path_Guia}/guia_${guia}.pdf`;
    const rutaProforma = `${urlGuia}/${path_Guia}/proforma_${guia}.pdf`;
    // console.log('rutaCarta: ', rutaCarta)
    // console.log('rutaGuia: ', rutaGuia)
    // console.log('rutaProforma: ', rutaProforma)

    return {
      ok: true,
      carta: rutaCarta,
      guia: rutaGuia,
      proforma: rutaProforma,
    }

    // Lee el contenido del archivo PDF
    // const contenidoPDF = fs.readFileSync(rutaUbuntu);

    // return contenidoPDF;
  } catch (error) {
    console.error('Error al leer el archivo PDF GetViewDocumentsPDF:', error);
    throw error;
  }
}

module.exports = {
  converterPDF,
  guardarDocumentoBase64,
  guardarPkgsBase64,
  converterPDF_UPS,
  convertBase64ToPDF,
  savePDFDocumentInPath,
  savePDFInPath,
  convertirImagenAPDF,
  CartaResponsabilidadPDF,
  GetCartaResponsabilidadPDF,
  GetViewDocumentsPDF,
};