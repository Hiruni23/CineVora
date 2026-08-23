function calculateSplitBreakdown(totalAmount, participants, labels = []) {
  const safeTotal = Math.max(0, Number(totalAmount) || 0);
  const safeParticipants = Math.max(1, Math.floor(Number(participants) || 1));

  const totalCents = Math.round(safeTotal * 100);
  const baseCents = Math.floor(totalCents / safeParticipants);
  const remainder = totalCents % safeParticipants;

  const breakdown = Array.from({ length: safeParticipants }, (_, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0);
    return {
      label: labels[index] || `Seat ${index + 1}`,
      amount: Number((cents / 100).toFixed(2))
    };
  });

  return {
    totalAmount: Number(safeTotal.toFixed(2)),
    participants: safeParticipants,
    remainderCents: remainder,
    breakdown
  };
}

module.exports = { calculateSplitBreakdown };