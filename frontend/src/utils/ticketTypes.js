export const TICKET_TYPE_OPTIONS = [
  {
    key: 'adult',
    label: 'Standard Adult',
    description: 'General admission for ages 13 and above',
    rateFactor: 1.0,
    accent: 'Standard',
    tag: 'Regular'
  },
  {
    key: 'child',
    label: 'Child (Ages 3–12)',
    description: 'Discounted concession ticket for children',
    rateFactor: 0.75,
    accent: '25% OFF',
    tag: 'Child'
  },
  {
    key: 'senior',
    label: 'Senior Citizen (60+)',
    description: 'Special concession fare for senior moviegoers',
    rateFactor: 0.80,
    accent: '20% OFF',
    tag: 'Senior'
  },
  {
    key: 'student',
    label: 'Student Pass (with ID)',
    description: 'Discounted rate for verified high school & college students',
    rateFactor: 0.85,
    accent: '15% OFF',
    tag: 'Student'
  },
  {
    key: 'vip',
    label: 'VIP Luxury Experience',
    description: 'Zero-gravity leather recliner access with complimentary popcorn voucher',
    rateFactor: 1.25,
    accent: 'VIP Luxury',
    tag: 'Premium'
  }
];

export const createEmptyTicketTypeCounts = (selectedSeatCount = 1) => ({
  adult: Math.max(0, Number(selectedSeatCount) || 0),
  child: 0,
  senior: 0,
  student: 0,
  vip: 0
});

export const buildTicketTypeSummary = (counts = {}, baseTotal = 0, selectedSeatCount = 0) => {
  const safeSeatCount = Math.max(1, Number(selectedSeatCount) || 1);
  const basePerSeat = safeSeatCount > 0 ? Number(baseTotal || 0) / safeSeatCount : 0;

  const summary = TICKET_TYPE_OPTIONS.map((option) => {
    const quantity = Math.max(0, Number(counts[option.key] || 0));
    const unitPrice = Number((basePerSeat * option.rateFactor).toFixed(2));

    return {
      key: option.key,
      label: option.label,
      description: option.description,
      quantity,
      unitPrice,
      totalPrice: Number((quantity * unitPrice).toFixed(2)),
      accent: option.accent,
      tag: option.tag
    };
  });

  const total = Number(summary.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));

  return {
    items: summary.filter(item => item.quantity > 0 || counts[item.key] !== undefined),
    total,
    basePerSeat: Number(basePerSeat.toFixed(2)),
    selectedSeatCount: safeSeatCount
  };
};
