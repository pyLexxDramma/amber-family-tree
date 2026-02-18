/** Simulates network delay */
export const delay = (ms = 600) => new Promise(r => setTimeout(r, ms));

/** Simulates a random failure (for demo error states) */
export const maybeError = (chance = 0) => {
  if (Math.random() < chance) throw new Error('Network error — please try again.');
};
