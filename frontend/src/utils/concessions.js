export const CONCESSION_CATALOG = {
  butterPopcorn: { category: 'Popcorn', name: 'Butter Popcorn', unitPrice: 450 },
  caramelPopcorn: { category: 'Popcorn', name: 'Caramel Popcorn', unitPrice: 520 },
  cheesePopcorn: { category: 'Popcorn', name: 'Cheese Popcorn', unitPrice: 580 },
  saltedPopcorn: { category: 'Popcorn', name: 'Salted Popcorn', unitPrice: 400 },
  cola: { category: 'Drinks', name: 'Cola', unitPrice: 320 },
  lemonade: { category: 'Drinks', name: 'Lemonade', unitPrice: 280 },
  water: { category: 'Drinks', name: 'Water', unitPrice: 180 },
  orangeJuice: { category: 'Drinks', name: 'Orange Juice', unitPrice: 350 }
};

export const CONCESSION_CATEGORIES = [
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

export const CONCESSION_GROUPS = CONCESSION_CATEGORIES;

export const createEmptyConcessionSelection = () => ({
  popcorn: [],
  drink: []
});

export const buildConcessions = (selection = {}) => {
  return CONCESSION_CATEGORIES
    .flatMap((category) => {
      const categorySelections = Array.isArray(selection[category.key]) ? selection[category.key] : [];

      return categorySelections
        .map((categorySelection) => {
          const itemKey = category.options.includes(categorySelection.itemKey)
            ? categorySelection.itemKey
            : category.defaultItemKey;
          const quantity = Math.max(0, Number(categorySelection.quantity || 0));

          if (quantity === 0) {
            return null;
          }

          const item = CONCESSION_CATALOG[itemKey];

          return {
            item: itemKey,
            category: category.key,
            name: item.name,
            quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * quantity
          };
        })
        .filter(Boolean);
    })
    .filter(Boolean);
};

export const getConcessionsTotal = (selection = {}) => {
  return buildConcessions(selection).reduce((sum, concession) => sum + concession.totalPrice, 0);
};