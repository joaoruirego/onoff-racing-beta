const partNames = {
  pt: {
    bodyF: "Frente",
    bodyB: "Trás",
    mangaL: "Manga Esquerda",
    mangaR: "Manga Direita",
    hoodOut: "Capuz",
    hoodIn: "Forro",
    agulhetas: "Agulhetas",
    pocket: "Bolso",
    argolas: "Argolas",
    corda: "Cordões",
    elasticoC: "Elástico Central",
    elasticoL: "Elástico Esquerdo",
    elasticoR: "Elástico Direito",
    punhoL: "Elástico Esquerdo",
    punhoR: "Elástico Direito",
  },
  en: {
    bodyF: "Front",
    bodyB: "Back",
    mangaL: "Left Sleeve",
    mangaR: "Right Sleeve",
    hoodOut: "Hood",
    hoodIn: "Lining",
    agulhetas: "Drawstring Needles",
    pocket: "Pocket",
    argolas: "Rings",
    corda: "Drawstrings",
    elasticoC: "Central Elastic",
    elasticoL: "Left Elastic",
    elasticoR: "Right Elastic",
    punhoL: "Elástico Esquerdo",
    punhoR: "Elástico Direito",
  },
};

export const getPartName = (filename, lang) => {
  const prefix = Object.keys(partNames[lang]).find((prefix) =>
    filename.startsWith(prefix)
  );
  return prefix ? partNames[lang][prefix] : "Parte Desconhecida";
};
