# Contact Manager

A simple Contact Manager application built with Express.js, EJS, and Tailwind CSS.

## Features

- ✅ Create, Read, Update, Delete contacts
- ✅ Photo upload for contacts
- ✅ Search contacts by name
- ✅ Sort by name or date (ASC/DESC)
- ✅ Pagination
- ✅ Custom delete confirmation modal
- ✅ WCAG accessible (ARIA labels, focus states, screen reader support)
- ✅ Dual database support (in-memory or PostgreSQL)
- ✅ Responsive design (mobile-friendly)

## Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The app will be available at `http://localhost:3000`

## Database Configuration

### Option 1: In-Memory Database (Default)
No configuration needed. Data persists while the server is running.

### Option 2: PostgreSQL
1. Create a PostgreSQL database
2. Update `.env` file:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/contact_db
DB_TYPE=postgres
PORT=3000
```
3. Restart the server - migrations run automatically

## Project Structure

```
├── config/
│   └── database.js       # Database configuration
├── controllers/
│   └── ContactController.js
├── middleware/
│   ├── errorHandler.js
│   ├── upload.js
│   └── validation.js
├── migrations/
│   ├── 001_create_contacts_table.sql
│   └── run.js
├── models/
│   └── ContactModel.js
├── public/
│   ├── js/main.js
│   └── uploads/contacts/
├── routes/
│   └── contactRoutes.js
├── views/
│   └── contacts/
│       ├── create.ejs
│       ├── edit.ejs
│       └── list.ejs
├── .env
├── package.json
├── server.js
└── tailwind.config.js
```

## Tech Stack

- **Backend**: Express.js
- **Templating**: EJS
- **Styling**: Tailwind CSS (CDN)
- **Database**: In-memory (default) or PostgreSQL
- **File Upload**: Multer
- **Validation**: Custom middleware

## License

MIT
