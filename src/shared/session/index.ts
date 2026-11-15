// Только для серверного кода: в клиентском компоненте импорт упадёт на сборке.
export {
  getCurrentUser,
  requireUser,
  sessionHeaders,
  type SessionUser,
} from "./current-user";
