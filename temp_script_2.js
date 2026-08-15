
/* === MOTOR ZEISS (lensique-zeiss-engine.js, embebido) === */
/* =====================================================================
   LENSIQUE · MOTOR DE PRECIOS ZEISS  (lensique-zeiss-engine.js)
   ---------------------------------------------------------------------
   Módulo independiente y framework-agnostic (sirve en React, Next,
   Vue o JS plano). NO toca tu inventario ni tus precios guardados:
   solo CALCULA. Su salida la metes a tu carrito como una línea.

   Precios tomados de la lista ZEISS L5 2026.  **POR PAR**, antes de IVA.
   (confirmado con ZEISS: los precios son por par; solo se agrega IVA.)

   API principal:  ZeissEngine.cotizar(input)  ->  objeto resultado
   ===================================================================== */
(function (global) {
  'use strict';

  /* ============ DATOS (lista ZEISS 2026, por par, antes de IVA) ============ */

  // Monofocal estándar (orgánico/alto índice)
  var MONO = {
    chrome:     { nm: 'Estándar (Chrome)', idx: { '1.5': { term: 422 } }, lad: ['1.5'] },
    silver:     { nm: 'Intermedio (Silver)', idx: { '1.6': { term: 700 } }, lad: ['1.6'] },
    verde:      { nm: 'AR verde', idx: { '1.5': { term: 747, proc: 1288 }, '1.6': { term: 829, proc: 1617 }, '1.67': { term: 922, proc: 2019 }, '1.74': { proc: 2857 } }, lad: ['1.5','1.6','1.67','1.74'] },
    azul:       { nm: 'AR azul',  idx: { '1.5': { term: 747, proc: 1288 }, '1.6': { term: 829, proc: 1694 }, '1.67': { term: 922, proc: 2019 }, '1.74': { proc: 2922 } }, lad: ['1.5','1.6','1.67','1.74'] },
    foto:       { nm: 'Fotocromático', idx: { '1.6': { term: 1179, proc: 2755 }, '1.67': { proc: 2457 } }, lad: ['1.6','1.67'] },
    polarizado: { nm: 'Polarizado (sol)', idx: { '1.5': { proc: 1514 }, '1.6': { proc: 1756 }, '1.67': { proc: 2251 } }, lad: ['1.5','1.6','1.67'], sun: 1 },
    tinte:      { nm: 'Sol con tinte', lad: ['1.5','1.6','1.67'], sun: 1 }
  };
  var MONO_SL = { '1.5': 1370, '1.6': 1612, '1.67': 2107 }; // SmartLife Blanco base p/ tinte

  // Policarbonato 1.59 (impacto / armazón al aire)
  var POLY_MONO = {
    z159:    { nm: 'ZEISS ClearView 1.59 (con AR)', cost: 803, addAr: false, tipo: 'Terminado', entrega: '48 h' },
    syn159:  { nm: 'Synchrony SV 1.59 (estándar)',  cost: 544, addAr: true,  tipo: 'Procesado', entrega: '7 días' },
    synf159: { nm: 'Synchrony SV 1.59 esférico (stock)', cost: 134, addAr: true, tipo: 'Terminado', entrega: '48 h' }
  };

  // Progresivos
  var PROG = {
    precision:  { nm: 'Precision Classic', poli: 1, idx: { '1.5': { verde: 1968, azul: 2091, foto: 2277 }, '1.59': { verde: 2493, azul: 2611, foto: 2802 }, '1.67': { verde: 3435, azul: 3559, foto: 3745 } } },
    pure:       { nm: 'SmartLife Pure', base: { '1.5': 3662, '1.6': 4532, '1.67': 5124, '1.74': 5924 } },
    plus:       { nm: 'SmartLife Plus', base: { '1.5': 4383, '1.6': 4842, '1.67': 5547, '1.74': 6132 } },
    superb:     { nm: 'SmartLife Superb', base: { '1.5': 4964, '1.6': 5356, '1.67': 6283, '1.74': 6617 } },
    individual: { nm: 'SmartLife Individual 3', base: { '1.5': 6442, '1.6': 7158, '1.67': 7735, '1.74': 8286 } }
  };
  var PROG_ADD = { verde: 0, azul: 103, foto: 309 }; // sobreprecio de acabado en progresivo
  var POLAR_PROG = {
    precision:  { '1.5': 2112, '1.59': 2637 },
    pure:       { '1.5': 3806, '1.6': 4676, '1.67': 5268 },
    plus:       { '1.5': 4526, '1.6': 4985, '1.67': 5690 },
    superb:     { '1.5': 5108, '1.6': 5500, '1.67': 6427 },
    individual: { '1.5': 6586, '1.6': 7302, '1.67': 7879 }
  };

  // Bifocal (Synchrony FT28) — viene sin AR; el AR ZEISS (HM) se suma aparte
  var BIF = {
    n7081: { nm: 'FT28 1.5 transparente', cost: 499, idx: '1.5' },
    n7086: { nm: 'FT28 1.59 policarbonato', cost: 538, idx: '1.59' },
    n7082: { nm: 'FT28 1.5 Fotocromático', cost: 1433, idx: '1.5' }
  };

  var ABBE = { '1.5': 58, '1.59': 30, '1.6': 41, '1.67': 32, '1.74': 33 };
  var RANGES = { '1.5': [-7,6,4], '1.6': [-10,6,6], '1.67': [-12,8,6], '1.74': [-20,16,6] };
  var ORDER = ['1.5','1.6','1.67','1.74'];
  var FINNAME = { verde: 'AR verde', azul: 'AR azul', foto: 'Fotocromático', polar: 'Polarizado', tinte: 'Sol con tinte' };

  /* ============ LÓGICA ============ */

  /**
   * Si cambias esto, cambia también el archivo espejo en lensique-web / lensique-pos.
   * Fórmula: precioWeb = (precioTienda + 4.64) / (1 - 0.040484)
   */
  function getOnlinePrice(storePrice) {
    if (!storePrice || storePrice <= 0) return 0;
    var rawPrice = (storePrice + 4.64) / (1 - 0.040484);
    if (rawPrice < 2000) return Math.ceil(rawPrice / 10) * 10;
    return Math.ceil(rawPrice / 50) * 50;
  }

  function num(x){ var n = parseFloat(x); return isNaN(n) ? 0 : n; }

  // Recomienda índice por potencia (max de los dos meridianos)
  function recommend(e, c) {
    var pot = Math.max(Math.abs(e), Math.abs(e + c));
    var a = pot <= 2 ? 1 : pot <= 4 ? 2 : pot <= 6 ? 3 : 4;
    var feas = {}, m = 5;
    ORDER.forEach(function (k) { var r = RANGES[k]; feas[k] = (e >= r[0] && e <= r[1] && Math.abs(c) <= r[2]); });
    for (var i = 0; i < 4; i++) { if (feas[ORDER[i]]) { m = i + 1; break; } }
    var rk = Math.max(a, m);
    return { pot: pot, feas: feas, recIndex: rk >= 5 ? null : ORDER[rk - 1] };
  }

  function clampIdx(idx, lad) {
    if (!idx) return lad[lad.length - 1];
    var p = lad.slice().sort(function (a, b) { return parseFloat(a) - parseFloat(b); });
    var r = parseFloat(idx);
    if (r <= parseFloat(p[0])) return p[0];
    if (r >= parseFloat(p[p.length - 1])) return p[p.length - 1];
    return p.find(function (k) { return parseFloat(k) >= r; });
  }

  function isTerm(e, c, i) { return (Math.abs(c) <= 2 && e >= -6 && e <= 4 && (i === '1.5' || i === '1.6')); }
  // 1.67 en stock: hipermetropía +3 a +6, o miopía alta esférica -6.25 a -10
  function t167(e, c) { return (e >= 3 && e <= 6 && Math.abs(c) <= 2) || (e >= -10 && e <= -6.25 && c === 0); }

  function priceMono(key, e, c, ei, man) {
    var o = MONO[key];
    if (man && ei && o.lad.indexOf(ei) < 0) return { avail: 0, why: 'No se fabrica en ' + ei + ' · mínimo ' + o.lad[0] };
    var idx = clampIdx(ei, o.lad);
    if (key === 'tinte') { var t = MONO_SL[idx]; return t == null ? { avail: 0 } : { cost: t + 500, idx: idx, tipo: 'Procesado', entrega: '13 días', avail: 1 }; }
    var d = o.idx[idx]; if (!d) return { avail: 0 };
    if (o.sun) return { cost: d.proc, idx: idx, tipo: 'Procesado', entrega: '7 días', avail: 1 };
    var stock = (isTerm(e, c, idx) && !(key === 'foto' && e < -4)) || (idx === '1.67' && key !== 'foto' && t167(e, c));
    if (stock && d.term) return { cost: d.term, idx: idx, tipo: 'Terminado', entrega: '48 h', avail: 1 };
    if (d.proc) return { cost: d.proc, idx: idx, tipo: 'Procesado', entrega: idx === '1.74' ? '13 días' : '7 días', avail: 1 };
    return { avail: 0, why: 'Fuera de rango stock · cil > 2.00 o esf fuera de −6/+4 (línea solo terminado)' };
  }

  function priceMonoPoly(polyKey, e, c, arSyn) {
    var po = POLY_MONO[polyKey] || POLY_MONO.z159;
    var ac = Math.abs(c);
    if (polyKey !== 'syn159' && !(e >= -6 && e <= 4 && ac <= 2))
      return { avail: 0, why: ac > 2 ? 'Cil ' + c.toFixed(2) + ' supera −2.00: poli de stock no aplica' : 'Fuera de rango stock poli (esf −6 a +4)' };
    var cost = po.cost + (po.addAr ? (arSyn == null ? 280 : arSyn) : 0);
    return { cost: cost, idx: '1.59', tipo: po.tipo, entrega: po.entrega, avail: 1, key: polyKey };
  }

  function priceProg(lv, fin, ei, man) {
    var T = PROG[lv];
    var ak = fin === 'polar' ? Object.keys(POLAR_PROG[lv] || {}) : Object.keys(T.idx || T.base);
    if (man && ei && ak.indexOf(ei) < 0) return { avail: 0, why: 'No se fabrica en ' + ei };
    if (fin === 'polar') {
      var o = POLAR_PROG[lv]; var ix = clampIdx(ei, Object.keys(o)); var cc = o[ix];
      return cc == null ? { avail: 0 } : { cost: cc, idx: ix, tipo: 'Procesado', entrega: ix === '1.74' ? '13 días' : '7 días', avail: 1 };
    }
    var keys = Object.keys(T.idx || T.base);
    if (fin === 'foto') keys = keys.filter(function (k) { return k !== '1.74'; }); // PhotoFusion máx 1.67
    var idx = clampIdx(ei, keys);
    var base;
    if (T.poli) { var ob = T.idx[idx]; base = ob ? ob[(fin === 'tinte' ? 'verde' : fin)] : null; }
    else { var b = T.base[idx]; base = b != null ? b + PROG_ADD[fin === 'tinte' ? 'verde' : fin] : null; }
    if (base == null) return { avail: 0 };
    var cost = base, en = idx === '1.74' ? '13 días' : '7 días';
    if (fin === 'tinte') { cost += 500; en = '13 días'; }
    return { cost: cost, idx: idx, tipo: 'Procesado', entrega: en, avail: 1 };
  }

  function priceBif(p, ar, incAr) {
    var B = BIF[p]; return { cost: B.cost + (incAr === false ? 0 : (ar == null ? 280 : ar)), idx: B.idx, tipo: 'A proceso', entrega: 'Consultar', avail: 1 };
  }

  // ====== "Pedir a ZEISS" (producto exacto p/ Visustore) ======
  function zMono(k, idx) {
    if (k === 'verde')      return idx === '1.74' ? 'SmartLife V.Sencilla 1.74 · Blanco' : 'Visión Sencilla · ClearView DuraVision Platinum';
    if (k === 'azul')       return idx === '1.74' ? 'SmartLife V.Sencilla 1.74 · BlueGuard' : 'Visión Sencilla · BlueGuard DuraVision Platinum';
    if (k === 'foto')       return 'Visión Sencilla · PhotoFusion X DuraVision Platinum';
    if (k === 'polarizado') return 'SmartLife V.Sencilla · Polarizado Sun';
    if (k === 'tinte')      return 'SmartLife V.Sencilla Blanco · + Tinte Sun';
    if (k === 'chrome')     return 'Visión Sencilla · DuraVision Chrome';
    if (k === 'silver')     return 'Visión Sencilla · DuraVision Silver';
    return 'ZEISS';
  }
  function zProg(k, fin) {
    var coat = fin === 'verde' ? 'DuraVision Platinum' : fin === 'azul' ? 'BlueGuard' : fin === 'foto' ? 'PhotoFusion X' : fin === 'polar' ? 'Polarizado Sun' : 'Blanco + Tinte Sun';
    return PROG[k].nm + ' · ' + coat;
  }
  function zBif(k, incAr) {
    var code = k === 'n7081' ? 'Synchrony FT28 1.5 (N7081)' : k === 'n7086' ? 'Synchrony FT28 1.59 poli (N7086)' : 'Synchrony FT28 1.5 Photo Grey (N7082)';
    return code + (incAr === false ? ' (sin AR)' : ' + AR ZEISS (HM)');
  }

  // Aviso de aberración cromática (Abbe bajo + graduación alta). '' si no aplica.
  function caWarn(idx, pot) {
    var ab = ABBE[idx]; if (!ab || ab > 35) return '';
    if (pot >= 6) return 'Aberración cromática probable en bordes (la visión central es limpia). Material de Abbe bajo + graduación alta; minimiza con buen centrado y armazón chico.';
    if (pot >= 4) return 'Posible ligera aberración cromática en bordes. El 1.6 (Abbe 41) la reduce y casi no engrosa.';
    return '';
  }

  function buildRx(tipo, e, c, eje, add, pd, alt) {
    var rx = 'Esf ' + (e >= 0 ? '+' : '') + e.toFixed(2) + ' / Cil ' + c.toFixed(2) + (c !== 0 ? ' x ' + (parseInt(eje, 10) || 0) + '°' : '');
    if (tipo !== 'mono' && add) rx += ' / Add +' + num(add).toFixed(2);
    if (pd) rx += ' / DI ' + pd + 'mm';
    if (tipo !== 'mono' && alt) rx += ' / Alt ' + (tipo === 'bif' ? 'segmento ' : 'pupila ') + alt + 'mm';
    return rx;
  }

  /* ============ API PÚBLICA ============ */
  /*
    cotizar(input) — input:
      tipo:          'mono' | 'prog' | 'bif'           (requerido)
      esf, cil:      número (dioptrías)
      eje:           0-180 (grados)
      add:           adición (prog/bif)
      opcion:        mono -> 'verde'|'azul'|'foto'|'polarizado'|'tinte'
                     prog -> acabado 'verde'|'azul'|'foto'|'polar'|'tinte'
                     bif  -> 'n7081'|'n7086'|'n7082'
      nivel:         prog -> 'precision'|'pure'|'plus'|'superb'|'individual'
      indice:        opcional, forzar índice ('1.5'..'1.74'); si no, se recomienda
      poli:          true -> policarbonato 1.59 (solo mono)
      polyKey:       'z159'|'syn159'|'synf159' (si poli)
      color:         'Gris'|'Café' (fotocromático)
      pd, altura:    mm
      incAr:         bif -> false para quitar el AR
      multiplicador: default 2.2
      iva:           default 0.16
      arSynchrony:   costo del AR ZEISS p/ Synchrony, default 280

    devuelve:
      { disponible, motivo,
        etiqueta, indice, tipoFab, entrega,
        costoLista, costoIva, pvp, utilidad, margen,
        productoZEISS, ordenZEISS, color, avisoAbbe, potencia }
      ** pvp y costos son POR PAR **
  */
  function cotizar(inp) {
    inp = inp || {};
    var tipo = inp.tipo, e = num(inp.esf), c = num(inp.cil);
    var iva = 1 + (inp.iva != null ? inp.iva : 0.16);
    var mult = inp.multiplicador || 2.2;
    var rec = recommend(e, c);
    var ei = inp.indice || rec.recIndex;
    var p, label, z, color = null;

    if (tipo === 'mono') {
      if (inp.poli) {
        p = priceMonoPoly(inp.polyKey || 'z159', e, c, inp.arSynchrony);
        if (p.avail) { label = POLY_MONO[p.key].nm; z = (p.key === 'z159') ? 'ClearView 1.59 policarbonato (AR incluido)' : 'Synchrony SV 1.59 policarbonato + AR ZEISS (HM)'; }
      } else {
        var k = inp.opcion || 'verde';
        p = priceMono(k, e, c, ei, !!inp.indice);
        if (p.avail) { label = MONO[k].nm; z = zMono(k, p.idx); if (k === 'foto') color = inp.color || 'Gris'; }
      }
    } else if (tipo === 'prog') {
      var lv = inp.nivel || 'pure', fin = inp.opcion || 'verde';
      p = priceProg(lv, fin, ei, !!inp.indice);
      if (p.avail) { label = PROG[lv].nm + ' · ' + (FINNAME[fin] || fin); z = zProg(lv, fin); if (fin === 'foto') color = inp.color || 'Gris'; }
    } else if (tipo === 'bif') {
      var bk = inp.opcion || 'n7081';
      p = priceBif(bk, inp.arSynchrony, inp.incAr);
      label = BIF[bk].nm + (inp.incAr === false ? ' (sin AR)' : ' + AR'); z = zBif(bk, inp.incAr);
    } else {
      return { disponible: false, motivo: 'Tipo inválido (usa mono/prog/bif)' };
    }

    if (!p || !p.avail) return { disponible: false, motivo: (p && p.why) || 'No disponible para esta graduación' };

    var costoIva = p.cost * iva;
    var pvpOriginal = Math.round(costoIva * mult / 50) * 50;
    var pvp = getOnlinePrice(pvpOriginal);
    var rx = buildRx(tipo, e, c, inp.eje, inp.add, inp.pd, inp.altura);
    var orden = (z || label) + (color ? ' · color ' + color : '') + ' · índice ' + p.idx + ' · ' + p.tipo + ' · ' + rx;

    return {
      disponible: true,
      etiqueta: label + (color ? ' · ' + color : ''),
      indice: p.idx, tipoFab: p.tipo, entrega: p.entrega,
      costoLista: p.cost, costoIva: Math.round(costoIva), pvp: pvp,
      utilidad: pvp - Math.round(costoIva), margen: Math.round((pvp - costoIva) / pvp * 100),
      productoZEISS: z || label, ordenZEISS: orden, color: color,
      avisoAbbe: caWarn(inp.poli ? '1.59' : p.idx, rec.pot),
      potencia: rec.pot, recomendado: rec.recIndex
    };
  }

  var API = { cotizar: cotizar, recomendarIndice: recommend, datos: { MONO: MONO, PROG: PROG, BIF: BIF, POLY_MONO: POLY_MONO } };

  if (typeof module !== 'undefined' && module.exports) module.exports = API;       // CommonJS / Node
  else if (typeof define === 'function' && define.amd) define(function () { return API; }); // AMD
  global.ZeissEngine = API;                                                          // navegador / window
})(typeof globalThis !== 'undefined' ? globalThis : this);

