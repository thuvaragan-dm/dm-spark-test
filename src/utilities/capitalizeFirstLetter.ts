export default function capitalizeFirstLetter(word: string) {
  const [firstLetter, ...rest] = word?.split("") || [];

  return [firstLetter?.toUpperCase(), ...rest].join("");
}
