(function () {
  'use strict';

  var WHATSAPP_NUMERO = '573202186192'; // Colombia sin +

  function getWhatsAppUrl(mensaje) {
    return 'https://wa.me/' + WHATSAPP_NUMERO + '?text=' + encodeURIComponent(mensaje);
  }

  function llenarSelect(selectId, opciones, valorVacio) {
    var select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '';
    var opt0 = document.createElement('option');
    opt0.value = '';
    opt0.textContent = valorVacio || 'Todos';
    select.appendChild(opt0);
    opciones.forEach(function (valor) {
      var opt = document.createElement('option');
      opt.value = valor;
      opt.textContent = valor;
      select.appendChild(opt);
    });
  }

  function extraerValoresUnicos(propiedades, campo) {
    var set = {};
    propiedades.forEach(function (p) {
      var v = (p[campo] || '').trim();
      if (v) set[v] = true;
    });
    return Object.keys(set).sort();
  }

  function filtrarPropiedades(propiedades, filtros) {
    return propiedades.filter(function (p) {
      if (filtros.ciudad && p.ciudad !== filtros.ciudad) return false;
      if (filtros.municipio && p.municipio !== filtros.municipio) return false;
      if (filtros.corregimiento && p.corregimiento !== filtros.corregimiento) return false;
      if (filtros.tipo && p.tipo !== filtros.tipo) return false;
      return true;
    });
  }

  function ubicacionTexto(p) {
    var partes = [];
    if (p.corregimiento) partes.push(p.corregimiento);
    if (p.municipio && p.municipio !== p.ciudad) partes.push(p.municipio);
    if (p.ciudad) partes.push(p.ciudad);
    return partes.length ? partes.join(', ') : 'Sin ubicación';
  }

  function renderTarjeta(p) {
    var mensaje = 'Hola, me interesa esta propiedad para ' + (p.tipo === 'venta' ? 'comprar' : 'arrendar') + ':\n\n' +
      p.titulo + '\n' + ubicacionTexto(p) + '\n\n' + 'Vi el anuncio en la web de Inmobiliaria Pérez Araujo.';
    var urlWhatsApp = getWhatsAppUrl(mensaje);

    var div = document.createElement('article');
    div.className = 'tarjeta';
    div.innerHTML =
      '<div class="tarjeta-imagen">🏠</div>' +
      '<div class="tarjeta-cuerpo">' +
        '<div class="tarjeta-tipo">' + (p.tipo === 'venta' ? 'Venta' : 'Arriendo') + '</div>' +
        '<h3 class="tarjeta-titulo">' + escapeHtml(p.titulo) + '</h3>' +
        '<p class="tarjeta-ubicacion">' + escapeHtml(ubicacionTexto(p)) + '</p>' +
        '<p class="tarjeta-precio">' + escapeHtml(p.precio || 'Consultar') + '</p>' +
        '<a href="' + escapeAttr(urlWhatsApp) + '" class="btn" target="_blank" rel="noopener">Consultar por WhatsApp</a>' +
      '</div>';
    return div;
  }

  function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  function actualizarListado(propiedades) {
    var grid = document.getElementById('grid-propiedades');
    var info = document.getElementById('resultados-info');
    var sinResultados = document.getElementById('sin-resultados');
    if (!grid || !info) return;

    grid.innerHTML = '';
    if (propiedades.length === 0) {
      info.textContent = 'No se encontraron propiedades.';
      if (sinResultados) sinResultados.classList.remove('oculto');
      return;
    }
    if (sinResultados) sinResultados.classList.add('oculto');
    info.textContent = propiedades.length + ' propiedad(es).';
    propiedades.forEach(function (p) {
      grid.appendChild(renderTarjeta(p));
    });
  }

  function aplicarFiltros() {
    var propiedades = window.PROPIEDADES || [];
    var ciudad = document.getElementById('filtro-ciudad');
    var municipio = document.getElementById('filtro-municipio');
    var corregimiento = document.getElementById('filtro-corregimiento');
    var tipo = document.getElementById('filtro-tipo');

    var filtros = {
      ciudad: ciudad ? ciudad.value : '',
      municipio: municipio ? municipio.value : '',
      corregimiento: corregimiento ? corregimiento.value : '',
      tipo: tipo ? tipo.value : ''
    };

    var listaFiltrada = filtrarPropiedades(propiedades, filtros);
    actualizarListado(listaFiltrada);
  }

  function initFiltrosCascada() {
    var ciudad = document.getElementById('filtro-ciudad');
    var municipio = document.getElementById('filtro-municipio');
    var corregimiento = document.getElementById('filtro-corregimiento');
    var propiedades = window.PROPIEDADES || [];

    function actualizarMunicipios() {
      var ciudadVal = ciudad ? ciudad.value : '';
      var sub = ciudadVal ? propiedades.filter(function (p) { return p.ciudad === ciudadVal; }) : propiedades;
      var munOpts = extraerValoresUnicos(sub, 'municipio');
      llenarSelect('filtro-municipio', munOpts, 'Todos los municipios');
      if (municipio) municipio.value = '';
      actualizarCorregimientos();
    }
    function actualizarCorregimientos() {
      var ciudadVal = ciudad ? ciudad.value : '';
      var munVal = municipio ? municipio.value : '';
      var base = propiedades;
      if (ciudadVal) base = base.filter(function (p) { return p.ciudad === ciudadVal; });
      if (munVal) base = base.filter(function (p) { return p.municipio === munVal; });
      var corrOpts = extraerValoresUnicos(base, 'corregimiento');
      llenarSelect('filtro-corregimiento', corrOpts, 'Todos los corregimientos');
      if (corregimiento) corregimiento.value = '';
    }

    if (ciudad) ciudad.addEventListener('change', actualizarMunicipios);
    if (municipio) municipio.addEventListener('change', actualizarCorregimientos);
  }

  function initWhatsApp() {
    var mensajeGeneral = 'Hola, entré desde la web de Inmobiliaria Pérez Araujo. Me gustaría recibir información sobre propiedades (venta o arriendo).';
    var urlGeneral = getWhatsAppUrl(mensajeGeneral);

    var fab = document.getElementById('fab-whatsapp');
    if (fab) {
      fab.href = urlGeneral;
    }
    var linkContacto = document.getElementById('link-whatsapp-contacto');
    if (linkContacto) {
      linkContacto.href = urlGeneral;
    }
  }

  function init() {
    var propiedades = window.PROPIEDADES || [];
    var ciudades = extraerValoresUnicos(propiedades, 'ciudad');
    var municipios = extraerValoresUnicos(propiedades, 'municipio');
    var corregimientos = extraerValoresUnicos(propiedades, 'corregimiento');

    llenarSelect('filtro-ciudad', ciudades, 'Todas las ciudades');
    llenarSelect('filtro-municipio', municipios, 'Todos los municipios');
    llenarSelect('filtro-corregimiento', corregimientos, 'Todos los corregimientos');

    initFiltrosCascada();
    actualizarListado(propiedades);
    initWhatsApp();

    var form = document.getElementById('form-filtros');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        aplicarFiltros();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
