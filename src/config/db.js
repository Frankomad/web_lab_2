import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: false
});

// Function to create the users and transactions tables and insert sample data if empty
const initializeDatabase = async () => {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL
    );
  `;

  const insertSampleUsersQuery = `
    INSERT INTO users (username, password, email)
    VALUES 
      ('admin', 'admin123', 'admin@example.com'),
      ('john', 'password123', 'john@example.com'),
      ('jane', 'mypassword', 'jane@example.com'),
      ('alice', 'alicepass', 'alice@example.com'),
      ('bob', 'bobpassword', 'bob@example.com'),
      ('charlie', 'charliepass', 'charlie@example.com'),
      ('dave', 'davepass', 'dave@example.com'),
      ('eve', 'evepassword', 'eve@example.com'),
      ('frank', 'frankpass', 'frank@example.com'),
      ('grace', 'gracepass', 'grace@example.com')
    ON CONFLICT DO NOTHING;
  `;

  const createTransactionsTableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      amount INT NOT NULL,
      recipient VARCHAR(100) NOT NULL,
      sender VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const insertSampleTransactionsQuery = `
    INSERT INTO transactions (amount, recipient, sender)
    VALUES 
      (100, 'john@example.com', 'admin@example.com'),
      (200, 'jane@example.com', 'john@example.com'),
      (50, 'alice@example.com', 'bob@example.com'),
      (150, 'charlie@example.com', 'dave@example.com')
    ON CONFLICT DO NOTHING;
  `;

  try {
    // Create the users table if it doesn't exist
    await pool.query(createUsersTableQuery);
    console.log('Table "users" is ready.');

    // Check if there are any users in the table
    const userResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userResult.rows[0].count, 10);

    // Insert sample data into the users table only if it's empty
    if (userCount === 0) {
      await pool.query(insertSampleUsersQuery);
      console.log('Sample users have been added to the database.');
    } else {
      console.log('Database already contains users. No sample user data added.');
    }

    // Create the transactions table if it doesn't exist
    await pool.query(createTransactionsTableQuery);
    console.log('Table "transactions" is ready.');

    // Check if there are any transactions in the table
    const transactionResult = await pool.query('SELECT COUNT(*) FROM transactions');
    const transactionCount = parseInt(transactionResult.rows[0].count, 10);

    // Insert sample data into the transactions table only if it's empty
    if (transactionCount === 0) {
      await pool.query(insertSampleTransactionsQuery);
      console.log('Sample transactions have been added to the database.');
    } else {
      console.log('Database already contains transactions. No sample transaction data added.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize the database setup
initializeDatabase();

export default pool;
