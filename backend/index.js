const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const dotenv = require('dotenv');
const pg = require('pg');
const { cors } = require('hono/cors');
const fs = require('fs');
const path = require('path');

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
	try {
		const res = await pool.query(text, params);
		const duration = Date.now() - start;
		console.log('⏱️ Duration:', duration + 'ms', '| 📦 Rows:', res.rowCount);
		return res;
	} catch (error) {
		console.error('❌ Database query error:', error.message);
		console.error('🧠 Query:', formatted);
		throw error; // Re-throw the error to let the caller handle it
	}
};

const app = new Hono();
app.use('*', cors())

app.get('/', (c) => {
	return c.json({ message: 'Hello from Hono!' })
});

app.get('/places', async (c) => {
	const { rows } = await pool.query(`
  SELECT id, name, image_url, ST_AsGeoJSON(geom) as geometry FROM places
`);

	const geojson = {
		type: "FeatureCollection",
		features: rows.map(row => ({
			type: "Feature",
			geometry: JSON.parse(row.geometry),  // this avoids the string problem
			properties: {
				id: row.id,
				name: row.name,
				image_url: row.image_url,
			}
		}))
	}
	return c.json(geojson);
});

app.get('/media/:name', async (c) => {
	const mediaDir = path.join(__dirname, 'media');
	const requestedName = c.req.param('name');
	let foundFile = null;

	try {
		const files = fs.readdirSync(mediaDir);
		for (const file of files) {
			const base = path.parse(file).name;
			if (base === requestedName) {
				foundFile = file;
				break;
			}
		}
		if (!foundFile) {
			return c.notFound();
		}
		const filePath = path.join(mediaDir, foundFile);
		const ext = path.extname(foundFile).toLowerCase();
		const mimeTypes = {
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.png': 'image/png',
			'.gif': 'image/gif',
			'.webp': 'image/webp',
			'.bmp': 'image/bmp',
			'.svg': 'image/svg+xml'
		};
		const mimeType = mimeTypes[ext] || 'application/octet-stream';
		const fileBuffer = fs.readFileSync(filePath);
		return new Response(fileBuffer, {
			headers: { 'Content-Type': mimeType }
		});
	} catch (err) {
		console.error('Error serving media:', err);
		return c.text('Internal Server Error', 500);
	}
});

// Use the serve function instead of app.listen
serve({
	fetch: app.fetch,
	port: APP_PORT
});

console.log(`Server is running on http://localhost:${APP_PORT}`);