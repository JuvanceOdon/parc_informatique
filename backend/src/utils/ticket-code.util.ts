export const buildTicketCode = (year: number, sequence: number): string => {
  return `TKT-${year}-${sequence.toString().padStart(5, '0')}`;
};

export const parseTicketCodeSequence = (code: string, year: number): number => {
  const prefix = `TKT-${year}-`;
  if (!code.startsWith(prefix)) {
    return 0;
  }

  const sequence = parseInt(code.slice(prefix.length), 10);
  return Number.isNaN(sequence) ? 0 : sequence;
};
