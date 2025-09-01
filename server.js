// Отлично! Давай сделаем полностью рабочий server.js, который будет:
// Отдавать твои статические файлы(HTML, CSS, JS)
// Подключаться к базе PostgreSQL на Render
// Содержать API / api / cards для получения и сохранения карточек
// Вот готовый код для server.js:

// Отлично, это полностью рабочий server.js для Render. ✅
// Вот что важно:
// Статические файлы — весь проект(HTML, CSS, JS, картинки) отдаётся через express.static.
// PostgreSQL — подключение через pg к базе Render с SSL.
// API / api / cards — теперь можно получать карточки(GET) и сохранять(POST) в централизованной базе.
// Таблица cards создаётся автоматически, если её нет.

// =======================================
// server.js — рабочий для Render PostgreSQL
// =======================================



// =======================================
// server.js — полностью рабочий для Render
// =======================================
// =======================================
// Импорты
// =======================================


const express = require("express");
const path = require("path");
const { Pool } = require("pg");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================================
// Подключение к базе PostgreSQL (Render)
// =======================================
// DATABASE_URL хранится в Environment Variables на Render
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }, // обязательно для Render
});

// =======================================
// Настройка Cloudinary
// =======================================
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// тоже должны быть добавлены в Render → Environment Variables
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =======================================
// Настройка Multer + Cloudinary
// =======================================
// Multer-storage-cloudinary автоматически отправляет файл в облако
// и возвращает ссылку
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "my-online-store", // папка в Cloudinary
		allowed_formats: ["jpg", "jpeg", "png", "gif"], // какие файлы разрешены
	},
});
const upload = multer({ storage });

// =======================================
// Middleware
// =======================================
// Чтобы Express умел читать JSON и отдавать статику (HTML/JS/CSS)
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// =======================================
// Создание таблицы cards (если её нет)
// =======================================
// Таблица хранит все карточки товаров
async function createTableIfNotExists() {
	try {
		await pool.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        description TEXT,
        availability TEXT,
        imgSrc TEXT,
        date TEXT
      )
    `);
		console.log("✅ Таблица cards готова");
	} catch (err) {
		console.error("❌ Ошибка при создании таблицы:", err);
	}
}
createTableIfNotExists();

// =======================================
// API для карточек
// =======================================

// Получить все карточки
app.get("/api/cards", async (req, res) => {
	try {
		const { rows } = await pool.query("SELECT * FROM cards ORDER BY id ASC");
		res.json(rows);
	} catch (err) {
		console.error("❌ Ошибка при получении карточек:", err);
		res.status(500).json({ error: "Ошибка при получении карточек" });
	}
});

// Сохранить карточки (перезаписать все)
app.post("/api/cards", async (req, res) => {
	const cards = req.body;
	try {
		// очищаем таблицу
		await pool.query("TRUNCATE cards");

		// вставляем новые карточки
		for (const c of cards) {
			await pool.query(
				"INSERT INTO cards (name, price, description, availability, imgSrc, date) VALUES ($1,$2,$3,$4,$5,$6)",
				[c.name, c.price, c.description, c.availability, c.imgSrc, c.date]
			);
		}

		res.json({ status: "ok" });
	} catch (err) {
		console.error("❌ Ошибка при сохранении карточек:", err);
		res.status(500).json({ error: "Ошибка при сохранении карточек" });
	}
});

// =======================================
// API для загрузки фото на Cloudinary
// =======================================
// Когда фронт отправляет POST /api/upload с файлом,
// multer-storage-cloudinary сразу загружает его в облако
app.post("/api/upload", upload.single("photo"), (req, res) => {
	try {
		if (!req.file || !req.file.path) {
			console.error("❌ Файл не загружен, req.file:", req.file);
			return res.status(400).json({ error: "Файл не загружен", file: req.file });
		}
		// Возвращаем ссылку на картинку
		res.json({ url: req.file.path }); // теперь фронт будет получать поле url
	} catch (err) {
		console.error("❌ Ошибка загрузки файла:", err);
		res.status(500).json({ error: "Ошибка при загрузке фото", details: err });
	}
});

// =======================================
// Запуск сервера
// =======================================
app.listen(PORT, () => {
	console.log(`🚀 Server is running on port ${PORT}`);
});


// Обратите внимание:
// Cloudinary требует регистрации и использования cloud_name, api_key, api_secret, которые можно добавить как Environment Variables в Render.
// Все загруженные изображения теперь будут храниться в облаке Cloudinary, URL сразу возвращается и сохраняется в базе.
// Локальная папка uploadsfoto больше не нужна.
// На клиентском скрипте(main.js) нужно отправлять форму через FormData на / api / upload, как мы делали раньше.
// Если хочешь, могу переписать твой клиентский JS сразу под Cloudinary, чтобы картинки реально сохранялись и отображались после перезагрузки.
