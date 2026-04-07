/**
 * Shared utility functions
 */

/**
 * Format a phone number to E.164 (strip +, spaces, dashes)
 */
function normalizePhone(phone) {
  return phone.replace(/[\s\-\+\(\)]/g, '');
}

/**
 * Get the current day name (lowercase)
 */
function getCurrentDay() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

/**
 * Check if a business is currently open
 */
function isBusinessOpen(business) {
  const day = getCurrentDay();
  const timing = business.timings?.[day];
  if (!timing || timing.closed) return false;

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return currentTime >= timing.open && currentTime <= timing.close;
}

/**
 * Format business hours as readable text
 */
function formatBusinessHours(business) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  let msg = `⏰ *${business.name} — Opening Hours*\n\n`;
  days.forEach((day, i) => {
    const t = business.timings?.[day];
    if (!t || t.closed) {
      msg += `${dayLabels[i]}: ❌ Closed\n`;
    } else {
      msg += `${dayLabels[i]}: ${t.open} - ${t.close}\n`;
    }
  });

  const open = isBusinessOpen(business);
  msg += `\n${open ? '🟢 We are currently OPEN!' : '🔴 We are currently CLOSED.'}`;

  return msg;
}

/**
 * Generate a unique tenant ID
 */
function generateTenantId() {
  const prefix = 'tenant';
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${timestamp}_${random}`;
}

module.exports = {
  normalizePhone,
  getCurrentDay,
  isBusinessOpen,
  formatBusinessHours,
  generateTenantId,
};
