const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const dotenv = require('dotenv');
const pg = require('pg');
const { cors } = require('hono/cors');

const APP_PORT = process.env.APP_PORT || 3000;

dotenv.config();

// Initiate the PostgreSQL client
const { Pool } = pg
const pool = new Pool({
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	database: process.env.POSTGRES_DB,
	password: process.env.POSTGRES_PASSWORD,
	port: process.env.POSTGRES_PORT || 5432, // Use correct port for PostgreSQL
});
console.log('PostgreSQL client initialized');

// ... rest of your query function ...
const query = async (text, params) => {
	// Inject param values into query string (for logging only)
	const formatted = text.replace(/\$\d+/g, (match) => {
		const index = parseInt(match.slice(1)) - 1;
		const val = params[index];
		if (val === null || val === undefined) return 'NULL';
		if (typeof val === 'string') return `'${val}'`;
		return val;
	});

	console.log('🧠 Executed Query:', formatted);
	const start = Date.now();
	const res = await pool.query(text, params);
	const duration = Date.now() - start;
	console.log('⏱️ Duration:', duration + 'ms', '| 📦 Rows:', res.rowCount);

	return res;
};

const app = new Hono();
app.use('*', cors())

app.get('/', (c) => {
	return c.json({ message: 'Hello from Hono!' })
});

app.get('/places', async (c) => {
	const result = await query("SELECT * FROM places");
	return c.json(result.rows)
});

// Use the serve function instead of app.listen
serve({
	fetch: app.fetch,
	port: APP_PORT
});

console.log(`Server is running on http://localhost:${APP_PORT}`);