const fs = require('fs');

let html = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

const injection = `
  var isPreorder = false;
  var isContact = false;
  var contactType = 'spherical';
  var params = new URLSearchParams(window.location.search);
  if (params.get('isPreorder') === 'true') {
      isPreorder = true;
  }
  var minDays = isPreorder ? 7 : 2;
  var maxDays = isPreorder ? 14 : 3;
  
  if (inp.tipo === 'prog' || inp.tipo === 'bif' || inp.tipo === 'ocupacional') { 
      minDays += 4; maxDays += 7; 
  } else if (inp.tipo === 'mono') {
      if (ST.treat === 'foto' || ST.treat === 'polar' || ST.treat === 'tinte' || ST.poli) { 
          minDays += 4; maxDays += 7; 
      } else if (inp.indice === '1.67' || inp.indice === '1.74' || inp.indice === '1.60' || inp.indice === '1.59') { 
          minDays += 2; maxDays += 3; 
      } else { 
          minDays += 1; maxDays += 2; 
      }
  }
  
  function addBizDays(start, days) {
      var d = new Date(start.getTime());
      var added = 0;
      while (added < days) {
          d.setDate(d.getDate() + 1);
          if (d.getDay() !== 0 && d.getDay() !== 6) added++;
      }
      return d;
  }
  var today = new Date();
  var dMin = addBizDays(today, minDays);
  var dMax = addBizDays(today, maxDays);
  var months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  if (dMin.getMonth() === dMax.getMonth()) {
      q.entrega = "Llega entre el " + dMin.getDate() + " y el " + dMax.getDate() + " de " + months[dMax.getMonth()];
  } else {
      q.entrega = "Llega entre el " + dMin.getDate() + " de " + months[dMin.getMonth()] + " y el " + dMax.getDate() + " de " + months[dMax.getMonth()];
  }
`;

if (!html.includes('addBizDays')) {
    html = html.replace('q.mult=m;', 'q.mult=m;' + injection.replace(/\n/g, '').replace(/\s+/g, ' '));
    fs.writeFileSync('public/asesor_zeiss.html', html);
    console.log('asesor_zeiss.html updated');
} else {
    console.log('Already injected');
}
