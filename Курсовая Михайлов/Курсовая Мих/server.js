const express = require('express');
const msnodesql = require('msnodesqlv8'); // Используем прямой драйвер вместо mssql
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Прямая строка подключения к вашей базе данных LocalDB
const connectionString = "Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\MSSQLLocalDB;Database=KeyDecisionDB;Trusted_Connection=yes;";

// Маршрут для получения квартир
app.get('/api/flats', (req, res) => {
    const query = "SELECT * FROM Flats";
    
    // Выполняем запрос напрямую через драйвер Windows
    msnodesql.query(connectionString, query, (err, rows) => {
        if (err) {
            console.error('Ошибка SQL Server:', err);
            res.status(500).send('Ошибка чтения базы данных');
        } else {
            res.json(rows); // Отправляем полученные 50 квартир на сайт
        }
    });
});

app.listen(3000, () => {
    console.log('Сервер бэкенда успешно запущен на http://localhost:3000');
});
