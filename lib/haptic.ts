/**
 * Haptic feedback utility.
 * Uses the Vibration API (mobile only, no-op on desktop).
 */

/**
 * Short tap feedback (10ms).
 */
export function hapticTap() {
  navigator?.vibrate?.(10);
}

/**
 * Medium feedback (30ms) — e.g., scoring a point.
 */
export function hapticMedium() {
  navigator?.vibrate?.(30);
}

/**
 * Double buzz — e.g., direction change or warning.
 */
export function hapticDouble() {
  navigator?.vibrate?.([20, 50, 20]);
}

/**
 * Celebration pattern — e.g., winning the game.
 */
export function hapticCelebration() {
  navigator?.vibrate?.([50, 30, 50, 30, 100]);
}
