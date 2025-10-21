const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Разрешаем запросы с любого домена
app.use(cors());
app.use(express.json());

// Главный endpoint для парсинга Excel
app.post('/parse', upload.single('excelFile'), (req, res) => {
    try {
        console.log('Получен файл:', req.file);
        
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        // Читаем Excel файл
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Конвертируем в JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Удаляем временный файл
        fs.unlinkSync(req.file.path);

        console.log('Успешно сконвертировано:', jsonData.length, 'записей');
        
        // Отправляем результат
        res.json({
            success: true,
            data: jsonData,
            fileName: req.file.originalname,
            message: 'Файл успешно сконвертирован!'
        });

    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка обработки файла: ' + error.message 
        });
    }
});

// Тестовый endpoint для проверки
app.get('/test', (req, res) => {
    res.json({ message: 'Сервер работает!', status: 'OK' });
});

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 API доступен по: http://localhost:${PORT}/parse`);
});