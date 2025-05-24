import { LAPTOP, DESKTOP } from "../constants/general.js";

const isLaptopDesktop = (categoryName) => {
  return [LAPTOP, DESKTOP].includes(categoryName);
};

export { isLaptopDesktop };
