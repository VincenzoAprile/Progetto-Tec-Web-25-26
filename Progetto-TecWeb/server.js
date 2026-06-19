const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurazione CORS (per far parlare Angular su porta 4200 e Node su porta 3000)
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true, // Consente il passaggio dei cookie di sessione
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Configurazione Sessione
app.use(session({
    secret: process.env.SESSION_SECRET || 'segreto_temporaneo_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // false perché siamo in locale (HTTP)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 giorno
    }
}));

// Connessione a PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'wikiblank_db',
    password: process.env.DB_PASSWORD || 'root', // Metti la tua password di pgAdmin se diversa
    port: process.env.DB_PORT || 5432
});

// Verifichiamo subito se si connette
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error("Errore DB:", err.message);
    else console.log("Server connesso a wikiblank_db!");
});

// --- API REGISTRAZIONE ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Username già occupato.' });
        }
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
        console.log(`👤 Utente registrato: ${username}`);
        res.json({ message: 'Registrazione completata!' });
    } catch (error) {
        res.status(500).json({ error: 'Errore nel server.' });
    }
});

// --- API LOGIN ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND password = $2', [username, password]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }
        
        // Salviamo l'utente nella sessione di Node
        req.session.username = result.rows[0].username;
        console.log(`Login riuscito per: ${req.session.username}`);
        
        res.json({ message: 'Login effettuato!', username: req.session.username });
    } catch (error) {
        res.status(500).json({ error: 'Errore nel server.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});