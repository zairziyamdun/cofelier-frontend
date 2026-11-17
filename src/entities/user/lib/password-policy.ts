// Те же правила, что у бэкенда (common/password-policy.ts): менять вместе,
// иначе форма пропустит пароль, который сервер отклонит.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

type PasswordRule = {
  id: "length" | "letter" | "digit";
  label: string;
  // Текст ошибки совпадает с серверным.
  message: (password: string) => string;
  test: (password: string) => boolean;
};

export const passwordRules: readonly PasswordRule[] = [
  {
    id: "length",
    label: `От ${PASSWORD_MIN_LENGTH} до ${PASSWORD_MAX_LENGTH} символов`,
    message: (password) =>
      password.length < PASSWORD_MIN_LENGTH
        ? `Пароль — от ${PASSWORD_MIN_LENGTH} символов`
        : `Пароль — до ${PASSWORD_MAX_LENGTH} символов`,
    test: (password) =>
      password.length >= PASSWORD_MIN_LENGTH &&
      password.length <= PASSWORD_MAX_LENGTH,
  },
  {
    id: "letter",
    label: "Хотя бы одна буква",
    message: () => "В пароле нужна хотя бы одна буква",
    test: (password) => /\p{L}/u.test(password),
  },
  {
    id: "digit",
    label: "Хотя бы одна цифра",
    message: () => "В пароле нужна хотя бы одна цифра",
    test: (password) => /\d/.test(password),
  },
];

// Первая нарушенная причина или null, если пароль подходит.
export function passwordProblem(password: string): string | null {
  const broken = passwordRules.find((rule) => !rule.test(password));
  return broken ? broken.message(password) : null;
}
