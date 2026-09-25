const QRCode = require('qrcode');

// Cambia esta URL por la dirección real (ej. /info, /mascota) donde mostrarás la información
const urlParaEtiqueta = 'https://guawandmiaw.vercel.app/info';
const archivoSalida = 'codigo_qr.png';

QRCode.toFile(archivoSalida, urlParaEtiqueta, {
  color: {
    dark: '#000000',  // Color de los puntos del QR
    light: '#ffffff' // Color de fondo del QR
  },
  width: 500, // Tamaño en píxeles
  margin: 2
}, function (err) {
  if (err) throw err;
  console.log(`¡Código QR generado con éxito! Guardado en: ${archivoSalida}`);
  console.log(`El código QR apunta a: ${urlParaEtiqueta}`);
  console.log(`Recuerda cambiar la URL en generate-labels.js cuando tengas tu dominio real.`);
});
