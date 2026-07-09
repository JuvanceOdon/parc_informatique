export const buildMaintenanceCode = (year: number, sequence: number): string => {
  return `MNT-${year}-${sequence.toString().padStart(5, '0')}`;
};

export const parseMaintenanceCodeSequence = (code: string, year: number): number => {
  const prefix = `MNT-${year}-`;
  if (!code.startsWith(prefix)) {
    return 0;
  }

  const sequence = parseInt(code.slice(prefix.length), 10);
  return Number.isNaN(sequence) ? 0 : sequence;
};
