(function () {
  'use strict';

  var WHATSAPP_NUMERO = '573146714084';

  function getWhatsAppUrl(mensaje) {
    return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensaje);
  }

  function armarMensajePublicar(form) {
    var datos = new FormData(form);
    var titulo = (datos.get('titulo') || '').trim();
    var tipo = datos.get('tipo') || '';
    var ciudad = (datos.get('ciudad') || '').trim();
    var municipio = (datos.get('municipio') || '').trim();
    var precio = (datos.get('precio') || '').trim();
    var descripcion = (datos.get('descripcion') || '').trim();
    var nombre = (datos.get('nombre') || '').trim();
    var telefono = (datos.get('telefono') || '').trim();

    var lineas = [
      'Hola, quiero *publicar* una propiedad en la web de Inmobiliaria Pérez Araujo.',
      '',
      '*Título:* ' + titulo,
      '*Tipo:* ' + (tipo === 'venta' ? 'Venta' : 'Arriendo'),
      '*Ciudad:* ' + ciudad,
      '*Municipio:* ' + (municipio || '-'),
      '*Precio:* ' + (precio || 'A convenir'),
      '',
      '*Descripción:*',
      descripcion,
      '',
      '*Mi nombre:* ' + nombre,
      '*Mi teléfono/WhatsApp:* ' + telefono,
      '',
      '_(Enviado desde el formulario Publicar de la web)_'
    ];
    return lineas.join('\n');
  }

  var form = document.getElementById('form-publicar');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var mensaje = armarMensajePublicar(form);
      var url = getWhatsAppUrl(mensaje);
      window.open(url, '_blank', 'noopener');
    });
  }
})();
