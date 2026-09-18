// lib/residencia/generateCode.ts

/**
 * Gera um código alfanumérico no formato HB-LLNN.
 * HB representa Huambo, seguido de duas letras e dois números.
 */
export function generateUniqueCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const randomCharacter = (characters: string) => characters.charAt(Math.floor(Math.random() * characters.length));

  const randomPart = [
    randomCharacter(letters),
    randomCharacter(letters),
    randomCharacter(numbers),
    randomCharacter(numbers),
  ].join('');

  return `HB-${randomPart}`;
}