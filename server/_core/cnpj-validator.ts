/** Remove máscara e preserva apenas os 14 dígitos do CNPJ. */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/** Valida os dois dígitos verificadores de um CNPJ brasileiro. */
export function isValidCNPJ(value: string): boolean {
  const cnpj = cleanCNPJ(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = [...base].reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const first = calculateDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calculateDigit(cnpj.slice(0, 12) + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj === cnpj.slice(0, 12) + first + second;
}

export function formatCNPJ(value: string) {
  const cnpj = cleanCNPJ(value).slice(0, 14);
  return cnpj
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
