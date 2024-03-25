const TelegramBot = require("node-telegram-bot-api");

const token = "7058326399:AAEV49RGI9PfsAcnsc3_t5KD6ydE8k8nXfo";
const bot = new TelegramBot(token, { polling: true });

const tasks = {};

let userCount = new Set();
let totalTask = 0;
let totalTask1 = 0;
const adminId = 427253866;

const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ["Статистика користувачів"],
      ["Календарний план"],
      ["Налаштувати сповіщення"],
    ],
  },
};

const calendarMenuKeyboard = {
  reply_markup: {
    keyboard: [["Створити календарний план"], ["Переглянути календарний план"]],
  },
};

const returnToMainMenuKeyboard = {
  reply_markup: {
    keyboard: [["В головне меню"], ["Додати завдання"]],
  },
};

bot.onText(/^\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Привіт! Я бот для планування завдань. Що ви хочете зробити?",
    mainMenuKeyboard
  );
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  const text = msg.text;
  userCount.add(chatId);
  switch (text) {
    case "Календарний план":
      bot.sendMessage(chatId, "Виберіть дію:", calendarMenuKeyboard);
      break;
    case "Налаштувати сповіщення":
      bot.sendMessage(chatId, "Виберіть налаштування сповіщень:", {
        reply_markup: {
          keyboard: [
            ["Сповіщення за день", "Сповіщення за 3 дні"],
            ["Сповіщення за тиждень", "Скасувати сповіщення"],
          ],
        },
      });
      break;
    case "Сповіщення за день":
      bot.sendMessage(
        chatId,
        "Ви впевнені, що хочете отримувати сповіщення за день до терміну виконання завдання?",
        {
          reply_markup: {
            keyboard: [["Так", "Ні"]],
          },
        }
      );
      bot.once("message", (msg) => {
        const confirmation = msg.text;
        if (confirmation === "Так") {
          sendNotificationsForTasks(1);
          bot.sendMessage(
            chatId,
            "Сповіщення за день успішно налаштовано.",
            mainMenuKeyboard
          );
        } else {
          bot.sendMessage(
            chatId,
            "Налаштування сповіщень за день скасовано.",
            mainMenuKeyboard
          );
        }
      });
      break;
    case "Сповіщення за 3 дні":
      bot.sendMessage(
        chatId,
        "Ви впевнені, що хочете отримувати сповіщення за 3 дні до терміну виконання завдання?",
        {
          reply_markup: {
            keyboard: [["Так", "Ні"]],
          },
        }
      );
      bot.once("message", (msg) => {
        const confirmation = msg.text;
        if (confirmation === "Так") {
          sendNotificationsForTasks(3);
          bot.sendMessage(
            chatId,
            "Сповіщення за 3 дні успішно налаштовано.",
            mainMenuKeyboard
          );
        } else {
          bot.sendMessage(
            chatId,
            "Налаштування сповіщень за 3 дні скасовано.",
            mainMenuKeyboard
          );
        }
      });
      break;
    case "Сповіщення за тиждень":
      bot.sendMessage(
        chatId,
        "Ви впевнені, що хочете отримувати сповіщення за тиждень до терміну виконання завдання?",
        {
          reply_markup: {
            keyboard: [["Так", "Ні"]],
          },
        }
      );
      bot.once("message", (msg) => {
        const confirmation = msg.text;
        if (confirmation === "Так") {
          sendNotificationsForTasks(7);
          bot.sendMessage(
            chatId,
            "Сповіщення за тиждень успішно налаштовано.",
            mainMenuKeyboard
          );
        } else {
          bot.sendMessage(
            chatId,
            "Налаштування сповіщень за тиждень скасовано.",
            mainMenuKeyboard
          );
        }
      });
      І;
      break;
    case "Статистика користувачів":
      if (chatId == adminId) {
        const statistics = `Статистика:
      Кількість користувачів: ${userCount.size}
      Усього задач: ${totalTask + totalTask1}`;
        bot.sendMessage(chatId, statistics);
      } else {
        bot.sendMessage(chatId, "У вас немає доступу");
      }
      break;

    case "Створити календарний план":
      bot.sendMessage(
        chatId,
        "Вкажіть дату до якої потрібно виконати (рррр-мм-дд):"
      );
      bot.once("message", (msg) => {
        const date = msg.text;
        if (isValidDate(date)) {
          bot.sendMessage(chatId, "Напишіть, яке завдання має бути виконане:");
          bot.once("message", (msg) => {
            const taskText = msg.text.trim();
            if (taskText !== "") {
              if (!tasks[chatId]) {
                tasks[chatId] = [];
              }
              tasks[chatId].push({ date: date, text: taskText });
              totalTask++;
              bot.sendMessage(
                chatId,
                "Завдання додано.",
                returnToMainMenuKeyboard
              );
            } else {
              bot.sendMessage(chatId, "Будь ласка, введіть текст завдання.");
            }
          });
        } else {
          bot.sendMessage(
            chatId,
            "Некоректний формат дати. Будь ласка, введіть дату у форматі РРРР-ММ-ДД."
          );
        }
      });
      break;
    case "Переглянути календарний план":
      const taskList = tasks[chatId] || [];
      if (taskList.length > 0) {
        let reply = "Ваш календарний план:\n";
        taskList.forEach((task, index) => {
          reply += `${index + 1}. ${task.date}: ${task.text}\n`;
        });
        bot.sendMessage(chatId, reply, returnToMainMenuKeyboard);
      } else {
        bot.sendMessage(
          chatId,
          "У вас поки немає завдань в календарному плані.",
          returnToMainMenuKeyboard
        );
      }
      break;
    case "В головне меню":
      bot.sendMessage(chatId, "Що ви хочете зробити?", mainMenuKeyboard);
      break;
    case "Додати завдання":
      bot.sendMessage(
        chatId,
        "Вкажіть дату до якої потрібно виконати (рррр-мм-дд):",
        {
          reply_markup: {
            keyboard: [["Скасувати"]],
          },
        }
      );
      bot.once("message", (msg) => {
        const date = msg.text;
        if (date === "Скасувати") {
          bot.sendMessage(
            chatId,
            "Додавання завдання скасовано.",
            mainMenuKeyboard
          );
        } else {
          bot.sendMessage(chatId, "Напишіть, яке завдання має бути виконане:");
          bot.once("message", (msg) => {
            const taskText = msg.text;
            if (!tasks[chatId]) {
              tasks[chatId] = [];
            }
            tasks[chatId].push({ date: date, text: taskText });
            totalTask1++;
            bot.sendMessage(
              chatId,
              "Завдання додано.",
              returnToMainMenuKeyboard
            );
          });
        }
      });
      break;
    default:
  }
});

// Функція для перевірки правильності формату дати
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

// Розсилка сповіщень за кілька днів до терміну виконання завдання
// Функція для розсилки сповіщень за вказану кількість днів до терміну виконання завдання
function sendNotificationsForTasks(days) {
  const currentDate = new Date();
  const targetDate = new Date(currentDate);
  targetDate.setDate(targetDate.getDate() + days);

  Object.keys(tasks).forEach((chatId) => {
    tasks[chatId].forEach((task) => {
      const taskDate = new Date(task.date);
      const diffTime = taskDate.getTime() - targetDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        bot.sendMessage(
          chatId,
          `Сьогодні останній день для виконання завдання "${task.text}"! Термін виконання: ${task.date}.`
        );
      } else if (diffDays === -days) {
        bot.sendMessage(
          chatId,
          `Залишилося ${days} днів до виконання завдання "${task.text}"! Термін виконання: ${task.date}.`,
          {
            reply_markup: {
              keyboard: [["Повернутися назад"]],
            },
          }
        );
      }
    });
  });
}

console.log("Бот для планування завдань успішно запущений.");
