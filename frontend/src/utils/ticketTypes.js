export const TICKET_TYPE_OPTIONS = [
  {
    key: 'adult',
    label: 'ODC Adult',
    description: 'Standard ticket fare',
    rateFactor: 1,
    accent: 'Adult'
  },
  {
    key: 'child',
    label: 'ODC Child',
    description: 'Discounted child fare',
    rateFactor: 0.85,
    accent: 'Child'
  }
];

export const createEmptyTicketTypeCounts = (selectedSeatCount = 1) => ({
  adult: Math.max(0, Number(selectedSeatCount) || 0),
  child: 0
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
      totalPrice: Number((quantity * unitPrice).toFixed(2))
    };
  });

  const total = Number(summary.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));

  return {
    items: summary,
    total,
    basePerSeat: Number(basePerSeat.toFixed(2)),
    selectedSeatCount: safeSeatCount
  };
};
