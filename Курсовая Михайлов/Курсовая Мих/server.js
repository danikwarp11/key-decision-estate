const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// КОНФИГУРАЦИЯ ПОДКЛЮЧЕНИЯ К ВАШЕМУ SQL SERVER
const dbConfig = {
    user: 'sa',                 // Логин от вашего SQL Server (обычно sa)
    password: 'ВашПарольОтБД',  // Введите ваш пароль от СУБД
    server: 'localhost',        // Оставляем localhost, если база на этом же компьютере
    database: 'ИмяВашейБазы',   // Точное имя базы данных из SQL Server Management Studio
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Запрос списка квартир из таблицы
app.get('/api/flats', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        // ВНИМАНИЕ: Замените Flats на точное название вашей таблицы в SQL Server
        let result = await pool.request().query('SELECT * FROM Flats'); 
        res.json(result.recordset);
    } catch (err) {
        console.error('Ошибка базы данных:', err);
        res.status(500).send('Ошибка сервера при получении данных');
    }
});

// Запуск сервера на 3000 порту
app.listen(3000, () => {
    console.log('Сервер бэкенда успешно запущен на http://localhost:3000');
});
