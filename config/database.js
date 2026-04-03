const { Pool } = require('pg');
require('dotenv').config();

// Database type: 'memory' or 'postgres'
const DB_TYPE = process.env.DB_TYPE || 'memory';

// In-memory storage
const contacts = [];
let idCounter = 1;

// PostgreSQL connection pool (lazy init)
let pgPool = null;

const getPgPool = () => {
  if (!pgPool && process.env.DATABASE_URL) {
    pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pgPool;
};

// Check if PostgreSQL is configured
const isPostgresConfigured = () => {
  return !!process.env.DATABASE_URL;
};

// Initialize database (run migrations if postgres)
const initDatabase = async () => {
  if (!isPostgresConfigured()) {
    console.log('Using in-memory database');
    return;
  }

  const pool = getPgPool();
  if (!pool) return;

  try {
    // Create contacts table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('PostgreSQL database initialized');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

const db = {
  // Find all contacts with pagination, search, and sort
  async findAll({ page = 1, limit = 10, search = '', sort = 'name', order = 'asc' }) {
    if (DB_TYPE === 'postgres' && isPostgresConfigured()) {
      const pool = getPgPool();
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      let params = [];
      if (search) {
        whereClause = 'WHERE name ILIKE $1';
        params = [`%${search}%`];
      }

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM contacts ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count);

      const sortCol = sort === 'created_at' ? 'created_at' : 'name';
      const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
      
      const result = await pool.query(
        `SELECT * FROM contacts ${whereClause} ORDER BY ${sortCol} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      );

      return {
        contacts: result.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }

    // In-memory fallback
    let result = [...contacts];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(searchLower));
    }

    result.sort((a, b) => {
      let valA = a[sort];
      let valB = b[sort];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const offset = (page - 1) * limit;
    result = result.slice(offset, offset + limit);

    return {
      contacts: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  // Find contact by ID
  async findById(id) {
    if (DB_TYPE === 'postgres' && isPostgresConfigured()) {
      const pool = getPgPool();
      const result = await pool.query('SELECT * FROM contacts WHERE id = $1', [parseInt(id)]);
      return result.rows[0] || null;
    }
    return contacts.find(c => c.id === parseInt(id)) || null;
  },

  // Create contact
  async create(contactData) {
    if (DB_TYPE === 'postgres' && isPostgresConfigured()) {
      const pool = getPgPool();
      const result = await pool.query(
        'INSERT INTO contacts (name, phone, photo_url) VALUES ($1, $2, $3) RETURNING *',
        [contactData.name, contactData.phone, contactData.photo_url || null]
      );
      return result.rows[0];
    }

    const contact = {
      id: idCounter++,
      name: contactData.name,
      phone: contactData.phone,
      photo_url: contactData.photo_url || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    contacts.push(contact);
    return contact;
  },

  // Update contact
  async update(id, contactData) {
    if (DB_TYPE === 'postgres' && isPostgresConfigured()) {
      const pool = getPgPool();
      const result = await pool.query(
        'UPDATE contacts SET name = $1, phone = $2, photo_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [contactData.name, contactData.phone, contactData.photo_url, parseInt(id)]
      );
      return result.rows[0] || null;
    }

    const index = contacts.findIndex(c => c.id === parseInt(id));
    if (index === -1) return null;
    
    contacts[index] = {
      ...contacts[index],
      ...contactData,
      updated_at: new Date()
    };
    return contacts[index];
  },

  // Delete contact
  async delete(id) {
    if (DB_TYPE === 'postgres' && isPostgresConfigured()) {
      const pool = getPgPool();
      const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [parseInt(id)]);
      return !!result.rows[0];
    }

    const index = contacts.findIndex(c => c.id === parseInt(id));
    if (index === -1) return false;
    contacts.splice(index, 1);
    return true;
  },

  // Check if phone exists
  async phoneExists(phone, excludeId = null) {
    if (DB_TYPE === 'postgres' && isPostgresConfigured()) {
      const pool = getPgPool();
      let query = 'SELECT id FROM contacts WHERE phone = $1';
      const params = [phone];
      if (excludeId) {
        query += ' AND id != $2';
        params.push(parseInt(excludeId));
      }
      const result = await pool.query(query, params);
      return result.rows.length > 0;
    }

    return contacts.some(c => c.phone === phone && c.id !== parseInt(excludeId || 0));
  },

  // Get total count
  async count() {
    if (DB_TYPE === 'postgres' && isPostgresConfigured()) {
      const pool = getPgPool();
      const result = await pool.query('SELECT COUNT(*) FROM contacts');
      return parseInt(result.rows[0].count);
    }
    return contacts.length;
  }
};

module.exports = { db, initDatabase, isPostgresConfigured };
