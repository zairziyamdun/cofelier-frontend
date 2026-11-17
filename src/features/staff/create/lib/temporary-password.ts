import { passwordProblem } from "@/entities/user";

// Без похожих символов (0/O, 1/l/I): пароль диктуют или переписывают вручную.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomString(length: number): string {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

// Случайный временный пароль из криптографического генератора браузера;
// перебираем, пока не будет буквы и цифры, — иначе сервер его отклонит.
export function temporaryPassword(length = 12): string {
  let password = randomString(length);
  while (passwordProblem(password)) password = randomString(length);
  return password;
}
