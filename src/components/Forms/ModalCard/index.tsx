import { CardControl } from "./ModalCard";

export { ModalCard, type CardControl } from "./ModalCard";
export { default as useModalCard } from "./useModalCard";

const formatLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();

export const getCardControlsFromRecord = (
  record: Record<string, unknown>
): CardControl[] =>
  Object.keys(record)
    .filter((key) => typeof record[key] !== "function")
    .map((key) => ({
      name: key,
      label: formatLabel(key),
      component: <></>,
    }));
