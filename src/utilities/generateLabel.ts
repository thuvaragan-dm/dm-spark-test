export default function generateLabel(fieldName: string): string {
  if (!fieldName) return "";
  return fieldName
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
