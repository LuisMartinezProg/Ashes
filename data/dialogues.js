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

};

// ── TIENDAS ──────────────────────────────────────────────────────────────────

export const SHOPS = {

  armas: {
    title: 'Armería',
    items: [
      { id: 'sword',  name: 'Espada',     icon: '⚔️',  price: 80,  desc: 'Daño equilibrado. Buena para combate directo.' },
      { id: 'bow',    name: 'Arco',       icon: '🏹',  price: 100, desc: 'Ataque a distancia. Requiere puntería.' },
      { id: 'magic',  name: 'Orbe Mágico',icon: '🔮',  price: 120, desc: 'Canaliza energía arcana. Alto daño mágico.' },
    ],
  },

  items: {
    title: 'Alquimia',
    items: [
      { id: 'potion_hp',     name: 'Poción HP',      icon: '🧪', price: 20,  desc: 'Restaura 30 puntos de vida.' },
      { id: 'potion_energy', name: 'Poción Energía',  icon: '⚗️', price: 25,  desc: 'Restaura 40 puntos de energía.' },
      { id: 'potion_hp_max', name: 'Elixir Mayor',    icon: '🫧', price: 60,  desc: 'Restaura toda la vida.' },
    ],
  },

};
