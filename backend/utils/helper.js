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
