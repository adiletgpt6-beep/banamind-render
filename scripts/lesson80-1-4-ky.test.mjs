// Проверки кыргызской версии ролика 80-1-4 — те же, что у русской
// (scripts/lesson80-1-4.test.mjs), по её репликам, надписям и озвучке.
// Запуск: npm run test:80-1-4-ky
process.env.A4_LANG = "ky";
await import("./lesson80-1-4.test.mjs");
