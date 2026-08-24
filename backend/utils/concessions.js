const CONCESSION_CATALOG = {
  butterPopcorn: { category: 'Popcorn', name: 'Butter Popcorn', unitPrice: 450 },
  caramelPopcorn: { category: 'Popcorn', name: 'Caramel Popcorn', unitPrice: 520 },
  cheesePopcorn: { category: 'Popcorn', name: 'Cheese Popcorn', unitPrice: 580 },
  saltedPopcorn: { category: 'Popcorn', name: 'Salted Popcorn', unitPrice: 400 },
  cola: { category: 'Drinks', name: 'Cola', unitPrice: 320 },
  lemonade: { category: 'Drinks', name: 'Lemonade', unitPrice: 280 },
  water: { category: 'Drinks', name: 'Water', unitPrice: 180 },
  orangeJuice: { category: 'Drinks', name: 'Orange Juice', unitPrice: 350 }
};

const CONCESSION_CATEGORIES = [
  {
    key: 'popcorn',
    title: 'Popcorn',
    defaultItemKey: 'butterPopcorn',
    options: ['butterPopcorn', 'caramelPopcorn', 'cheesePopcorn', 'saltedPopcorn']
  },
  {
    key: 'drink',
    title: 'Drinks',
    defaultItemKey: 'cola',
    options: ['cola', 'lemonade', 'water', 'orangeJuice']
  }
];

const CONCESSION_GROUPS = CONCESSION_CATEGORIES;

function getCatalogEntries() {
  return Object.entries(CONCESSION_CATALOG).map(([key, value]) => ({
    key,
    ...value
  }));
}

function normalizeConcessions(concessions = []) {
  if (!Array.isArray(concessions)) {
    return [];
  }

  return concessions
    .map((concession) => {
      const rawKey = String(concession?.item || concession?.name || '').trim().toLowerCase();
      const catalogKey = Object.keys(CONCESSION_CATALOG).find((key) => rawKey === key || rawKey.includes(key));

      if (!catalogKey) {
        return null;
      }

      const quantity = Math.max(1, parseInt(concession.quantity, 10) || 0);

      if (!quantity) {
        return null;
      }

      const catalogItem = CONCESSION_CATALOG[catalogKey];

      return {
        item: catalogKey,
        category: catalogItem.category,
        name: catalogItem.name,
        quantity,
        unitPrice: catalogItem.unitPrice,
        totalPrice: catalogItem.unitPrice * quantity
      };
    })
    .filter(Boolean);
}

function getConcessionsTotal(concessions = []) {
  return concessions.reduce((sum, concession) => sum + Number(concession.totalPrice || 0), 0);
}

module.exports = {
  CONCESSION_CATALOG,
  CONCESSION_CATEGORIES,
  CONCESSION_GROUPS,
  getCatalogEntries,
  normalizeConcessions,
  getConcessionsTotal
};