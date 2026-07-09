export const buildMaterielCode = (year: number, sequence: number): string => {
  return `MAT-${year}-${sequence.toString().padStart(5, '0')}`;
};

export const parseMaterielCodeSequence = (code: string, year: number): number => {
  const prefix = `MAT-${year}-`;
  if (!code.startsWith(prefix)) {
    return 0;
  }

  const sequence = parseInt(code.slice(prefix.length), 10);
  return Number.isNaN(sequence) ? 0 : sequence;
};
