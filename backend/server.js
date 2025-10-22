// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const port = process.env.PORT || 3000;

// --- 1. НАСТРОЙКА CORS (Разрешение для Vercel) ---
// Вставляем URL вашего фронтенда, чтобы разрешить ему запросы
const allowedOrigin = 'https://my-excel-parser-app.vercel.app';

const corsOptions = {
    origin: allowedOrigin
};

app.use(cors(corsOptions));
app.use(express.json());

// --- 2. НАСТРОЙКА MULTER (Для приема файла) ---
// Используем память для хранения файла, чтобы сразу его обработать
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- 3. API-МАРШРУТ (Обработка загрузки) ---
// Маршрут: /api/parse
app.post('/api/parse', upload.single('excelFile'), (req, res) => {
    // Проверка, был ли загружен файл
    if (!req.file) {
        return res.status(400).json({ error: 'Excel file not provided.' });
    }

    try {
        // req.file.buffer содержит данные файла в виде буфера
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        
        // Массив для хранения данных со всех листов
        const jsonData = {};
        
        // Перебор всех листов в книге
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            // Преобразование данных листа в массив JSON-объектов
            const sheetData = xlsx.utils.sheet_to_json(worksheet);
            jsonData[sheetName] = sheetData;
        });

        // Отправляем собранные JSON-данные обратно клиенту
        res.status(200).json({ 
            message: "File successfully parsed!",
            data: jsonData 
        });

    } catch (error) {
        console.error('Parsing error:', error);
        res.status(500).json({ error: 'Error processing the Excel file.' });
    }
});

// --- 4. ЗАПУСК СЕРВЕРА ---
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});