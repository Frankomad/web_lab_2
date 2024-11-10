import pool from '../config/db.js';

export const login = async (req, res) => {
  const { username, password, vulnerabilityEnabled } = req.body;

  let queryText;
  let result;

  try {
    if (vulnerabilityEnabled) {
      // Vulnerable query without parameterization (SQL Injection)
      queryText = `
        SELECT * FROM users WHERE username = '${username}' AND password = '${password}'
      `;
      console.log("query text: ", queryText)
      console.log("SQL Injection Vulnerability Enabled");
    } else {
      // Secure query using parameterized input
      queryText = `
        SELECT * FROM users WHERE username = $1 AND password = $2
      `;
      console.log("SQL Injection Protection Enabled");
    }

    result = await pool.query(queryText, vulnerabilityEnabled ? [] : [username, password]);
    // Check if user exists
    if (result.rows.length > 0) {
      res.send(`Welcome, ${username}!`);
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('An error occurred');
  }
};

// ' OR 1=1 --
