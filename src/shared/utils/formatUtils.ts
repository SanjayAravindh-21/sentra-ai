// Utility functions for formatting and display

/**
 * Format timestamp to relative time (e.g., "5 mins ago")
 */
export function getRelativeTime(timestamp: string): string {
  try {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

/**
 * Get urgency level from risk score
 */
export function getUrgencyLevel(riskScore: number): string {
  if (riskScore >= 75) return 'URGENT';
  if (riskScore >= 50) return 'HIGH';
  if (riskScore >= 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Get action timeframe from risk score
 */
export function getActionTimeframe(riskScore: number): string {
  if (riskScore >= 90) return 'IMMEDIATE';
  if (riskScore >= 75) return 'Within 1 hour';
  if (riskScore >= 50) return 'Within 24 hours';
  if (riskScore >= 30) return 'This week';
  return 'Routine check';
}
