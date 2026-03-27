const creditCentPerCredit = 100;

export function fromCreditCent(value: number): number {
  return value / creditCentPerCredit;
}

export function formatCredit(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function formatCreditCent(value: number): string {
  return formatCredit(fromCreditCent(value));
}
