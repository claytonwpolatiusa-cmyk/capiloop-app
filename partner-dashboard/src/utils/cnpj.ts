/**
 * Validar CNPJ brasileiro
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '')

  if (cleanCNPJ.length !== 14) {
    return false
  }

  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false
  }

  let size = cleanCNPJ.length - 2
  let numbers = cleanCNPJ.substring(0, size)
  const digits = cleanCNPJ.substring(size)

  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) {
      pos = 9
    }
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) {
    return false
  }

  size = size + 1
  numbers = cleanCNPJ.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) {
      pos = 9
    }
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) {
    return false
  }

  return true
}

/**
 * Formatar CNPJ para exibição
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '')

  if (cleanCNPJ.length !== 14) {
    return cnpj
  }

  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Remover formatação do CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, '')
}
