// Без похожих символов (0/O, 1/l/I): пароль диктуют или переписывают вручную.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

// Случайный временный пароль из криптографического генератора браузера.
export function temporaryPassword(length = 12): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}
