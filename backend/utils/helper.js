import { ROLES } from "../constants/auth.js";
import { LAPTOP, DESKTOP } from "../constants/general.js";

export const isLaptopDesktop = (categoryName) => {
  return [LAPTOP, DESKTOP].includes(categoryName);
};

export async function getCategoryType(category) {
  const SIMPLE = category.categoryType.simple;
  const MULTI_VARIANTS = category.categoryType.multiVariants;
  const PROCESSOR_BASED = category.categoryType.processorBased;

  return { SIMPLE, MULTI_VARIANTS, PROCESSOR_BASED };
}

/**
 * Generates a structured, unique ID (e.g., PA-251203-1234).
 * * @param {string} role - The user's role ("partner", "executive", or "admin").
 * @returns {string} The formatted unique ID.
 */
export function generateUniqueID(role) {
  // 1. Define Role Prefixes
  const rolePrefixes = {
    [ROLES.admin]: "AD",
    [ROLES.marketing]: "ADM",
    [ROLES.sub_admin]: "ADS",
    [ROLES.executive]: "EX",
    [ROLES.partner]: "PA",
    [ROLES.partner_executive]: "PAE",
  };

  const prefix = rolePrefixes[role.toLowerCase()];

  // Handle invalid roles
  if (!prefix) {
    throw new Error(
      "Invalid role provided. Must be 'partner', 'executive', or 'admin'."
    );
  }

  // 2. Generate Timestamp/Date (YYMMDD)
  const now = new Date();

  // Get the last two digits of the year
  const year = now.getFullYear().toString().slice(-2);

  // Get the month (1-based) and pad with a leading zero if needed
  const month = (now.getMonth() + 1).toString().padStart(2, "0");

  // Get the day of the month and pad with a leading zero
  const day = now.getDate().toString().padStart(2, "0");

  const datePart = `${year}${month}${day}`; // e.g., 251203

  // 3. Generate Sequence (Substitute)
  // NOTE: For real-world use (especially high-volume), the sequence MUST be
  // generated and managed server-side (e.g., in MongoDB/Postgres) to guarantee uniqueness.
  // Here, we use a 4-digit random number as a simple placeholder.
  const sequencePart = Math.floor(Math.random() * 9000) + 1000; // Generates a random number between 1000 and 9999

  // 4. Combine parts
  return `${prefix}-${datePart}-${sequencePart}`;
}
