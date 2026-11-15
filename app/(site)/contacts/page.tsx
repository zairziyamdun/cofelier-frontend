import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Адрес, часы работы и телефон кофейни Cofelier, карта проезда",
};

export { ContactsPage as default } from "@/views/contacts";
