/**
 * index.js — Entry point OpenClaw.
 * Menginisialisasi Telegram bot dan menjalankan scheduler.
 */

const { initBot } = require("./bot/telegram");
const { startScheduler } = require("./scheduler");

console.log("🚀 OpenClaw - Automation Engine dimulai");
console.log("=".repeat(40));

// Inisialisasi Telegram Bot
initBot();

// Jalankan Scheduler
startScheduler();
