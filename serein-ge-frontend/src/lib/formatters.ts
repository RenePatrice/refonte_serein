// ==============================================================================
// SEREIN-GE : Utilitaires de formatage monétaire et textuel
// ==============================================================================

/**
 * Formate un montant en Francs CFA (XOF)
 * Exemple: 4250000 -> "4 250 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0 FCFA';
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

/**
 * Formate une date au format français (ex: 28 août 2026)
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Génère une référence unique de commande
 * Exemple: SER-26-48291
 */
export function generateOrderReference(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(10000 + Math.random() * 90000);
  return `SER-${year}-${random}`;
}
