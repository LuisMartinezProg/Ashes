// data/dialogues.js
// Ashes of the Reborn | Valiant Gaming

export const DIALOGUES = {

  aldeano: {
    name: 'Aldeano',
    lines: [
      'Bienvenido a Aeltherion, forastero.',
      'Últimamente hay criaturas merodeando fuera de los muros.',
      'Ten cuidado si sales al campo.',
    ],
  },

  herrero: {
    name: 'Herrero',
    lines: [
      'No tengo tiempo para charlas, el yunque me espera.',
      'Si necesitas un arma, vuelve cuando tenga stock.',
      'La herrería lleva tres generaciones en mi familia.',
    ],
  },

  guardia: {
    name: 'Guardia',
    lines: [
      'Alto. Identifícate.',
      '...Está bien, puedes pasar. Pero vigila tus movimientos.',
      'Nadie sale del pueblo de noche. Órdenes del capitán.',
    ],
  },

  vendedor_armas: {
    name: 'Armero',
    shop: 'armas',
    lines: [
      'Bienvenido a mi armería, viajero.',
      'Tengo las mejores armas de la región.',
    ],
  },

  vendedor_items: {
    name: 'Alquimista',
    shop: 'items',
    lines: [
      'Pociones, elixires... todo lo que necesitas para sobrevivir.',
      'Mis precios son justos, mi calidad inigualable.',
    ],
  },

  mika: {
    name: 'Mika',
    lines: [
      '¡Por favor, ayúdame! Hay bandidos cerca...',
      'Gracias. De verdad, pensé que no saldría de esta.',
      'Me llamo Mika. Conozco bien el camino a Ironfell — puedo guiarte si quieres.',
      'Ironfell no es perfecta, pero es un buen lugar. Ya verás.',
    ],
    linesAfterRescue: [
      'Ya está, todo bien. ¿Vamos juntos a Ironfell?',
      'Oye... ¿escuchaste eso? Hay alguien en ese carruaje.',
    ],
  },

  yuna: {
    name: 'Yuna',
    lines: [
      'Alto. Ironfell no acepta extraños sin identificación.',
      '...Vienes con Mika. Está bien, puedes entrar.',
      'Soy Yuna, guardia de la puerta norte. Cualquier problema, me buscas.',
      'Mantente fuera de problemas dentro de los muros.',
    ],
  },

  voron: {
    name: 'Voron',
    lines: [
      'Así que eres el forastero del que me habló Mika.',
      'Ironfell tiene sus propias reglas. Respétalas y no habrá problemas.',
      'Si quieres ganarte un lugar aquí, demuestra tu valía.',
      'La Academia Veldris acepta nuevos estudiantes. Podrías presentarte.',
    ],
  },

  elfa_vendedora: {
    name: 'Aerith',
    shop: 'items',
    lines: [
      'Bienvenido a mi tienda, viajero. Soy Aerith.',
      'Vengo del bosque élfico del este. Mis mercancías son únicas.',
      'Toma lo que necesites — a un precio justo, claro.',
    ],
  },

};

// ── TIENDAS ────────────────────────────────────────────────────────
// Cada item ahora referencia un ID real de data/items.js.
// currency: 'monedas' (normal) | 'oro' (premium)
// price: monto en la moneda indicada

export const SHOPS = {

  armas: {
    title: 'Armería',
    items: [
      { id: 'espadaHierro',   currency: 'monedas', price: 65   },
      { id: 'espadaRunica',   currency: 'oro',      price: 180  },
      { id: 'arcoElfico',     currency: 'oro',      price: 180  },
      { id: 'armaduraHierro', currency: 'monedas', price: 65   },
      { id: 'armaduraRunica', currency: 'oro',      price: 190  },
      { id: 'anilloFuerza',   currency: 'oro',      price: 170  },
      { id: 'katanaOscura',   currency: 'oro',      price: 1200 },
      { id: 'bastónCristal',  currency: 'oro',      price: 1200 },
      { id: 'mantoDeSombra',  currency: 'oro',      price: 1100 },
      { id: 'amuletoCristal', currency: 'oro',      price: 1100 },
    ],
  },

  items: {
    title: 'Alquimia',
    items: [
      { id: 'pocionVida',       currency: 'monedas', price: 18 },
      { id: 'pocionMana',       currency: 'monedas', price: 15 },
      { id: 'pocionVidaGrande', currency: 'monedas', price: 55 },
      { id: 'elixirFuerza',     currency: 'monedas', price: 70 },
      { id: 'elixirGuardia',    currency: 'monedas', price: 70 },
    ],
  },

};
