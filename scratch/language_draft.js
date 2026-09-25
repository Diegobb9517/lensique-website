const clientFriendlySummary = (ST) => {
  let typeStr = "";
  if (ST.type === "mono") typeStr = "Una distancia";
  if (ST.type === "prog") typeStr = "Progresivo";
  if (ST.type === "bif") typeStr = "Bifocal";

  let idxStr = "Delgadez estándar";
  if (ST.idx === "1.60") idxStr = "Más delgado";
  if (ST.idx === "1.67") idxStr = "Muy delgado";
  if (ST.idx === "1.74") idxStr = "Ultra delgado";
  if (ST.poli) idxStr = "Policarbonato resistente";

  let treatStr = "Antirreflejante";
  if (ST.treat === "ar" && ST.arPremium) treatStr = "Antirreflejante premium";
  if (ST.treat === "azul") treatStr = "Filtro de luz azul";
  if (ST.treat === "foto") treatStr = "Fotocromático";
  if (ST.treat === "polar") treatStr = "Polarizado";
  if (ST.treat === "invisible") treatStr = "Sin línea visible";
  if (ST.treat === "entintado") treatStr = "Entintado";
  if (ST.treat === "espejo") treatStr = "Espejo";

  if (ST.type === "prog") {
     return `Progresivo cómodo para todo el día · ${treatStr} · ${idxStr}`;
  }
  return `${typeStr} · ${treatStr} · ${idxStr}`;
};

const topBarLabel = (ST, q) => {
  if (!q || !q.disponible) return "";
  if (q.pvp <= 1200) return "micas incluidas";
  
  let t = ST.type === "prog" ? "Progresivo" : (ST.type === "bif" ? "Bifocal" : "");
  let treat = "";
  if (ST.treat === "ar" && ST.arPremium) treat = "AR premium"; // Wait, "sin nombres de catálogo ZEISS, con mayúsculas normales. Progresivo + antirreflejante"
  if (ST.treat === "ar" && !ST.arPremium) treat = "antirreflejante";
  if (ST.treat === "ar" && ST.arPremium) treat = "antirreflejante premium";
  if (ST.treat === "azul") treat = "filtro azul";
  if (ST.treat === "foto") treat = "fotocromático";
  if (ST.treat === "polar") treat = "polarizado";
  
  if (t) {
    return `${t} + ${treat}`;
  } else {
    return `incluye ${treat}`;
  }
};
