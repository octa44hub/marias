/**
 * Formata um valor em centavos para o formato brasileiro de moeda.
 * Ex: 4990 → "R$ 49,90"
 */
export function formatCurrency(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

/**
 * Formata uma data para o padrão brasileiro.
 * Ex: "2024-01-15" → "15/01/2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

/**
 * Formata data e hora.
 * Ex: "2024-01-15T14:30:00Z" → "15/01/2024 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

/**
 * Formata apenas o horário.
 * Ex: "2024-01-15T14:30:00Z" → "14:30"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

/**
 * Converte um string de entrada monetária (ex: "49,90" ou "49.90") para centavos.
 * Aceita vírgula ou ponto como separador decimal.
 */
export function parseCurrencyInput(value: string): number {
  // Remove tudo exceto dígitos, vírgula e ponto
  const cleaned = value.replace(/[^\d,\.]/g, "");
  // Substitui vírgula por ponto para parseFloat
  const normalized = cleaned.replace(",", ".");
  const float = parseFloat(normalized) || 0;
  return Math.round(float * 100);
}

/**
 * Converte centavos para reais (float).
 * Ex: 4990 → 49.9
 */
export function centavosToReais(centavos: number): number {
  return centavos / 100;
}

/**
 * Formata centavos como string de input monetário.
 * Ex: 4990 → "49,90"
 */
export function formatCurrencyInput(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/**
 * Formata número da venda com zeros à esquerda.
 * Ex: 42 → "000042"
 */
export function formatSaleNumber(num: number): string {
  return String(num).padStart(6, "0");
}

/**
 * Retorna a data de hoje no formato ISO (YYYY-MM-DD) no fuso de São Paulo.
 */
export function getTodayISO(): string {
  return new Date()
    .toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/")
    .reverse()
    .join("-");
}

/**
 * Retorna o primeiro e último dia do mês atual como strings ISO.
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1).toISOString().split("T")[0];
  const end = new Date(year, month + 1, 0).toISOString().split("T")[0];
  return { start, end };
}
