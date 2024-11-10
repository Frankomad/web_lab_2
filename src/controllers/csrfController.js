import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import csrf from 'csurf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CSRF Protection Middleware
const csrfProtection = csrf({ cookie: false }); // Using session-based tokens

// Global flag to toggle CSRF protection
let csrfEnabled = true;

// Custom middleware that applies CSRF protection only if csrfEnabled is true
export const conditionalCsrfProtection = (req, res, next) => {
  if (csrfEnabled) {
    csrfProtection(req, res, next);
  } else {
    next();
  }
};

// Handler to serve the main CSRF demo page
export const getCsrfDemoPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/csrf.html'));
};

// Handler to toggle CSRF protection
export const toggleCsrfProtection = (req, res) => {
  csrfEnabled = !csrfEnabled;
  console.log(`CSRF protection status changed: ${csrfEnabled ? "Enabled" : "Disabled"}`);
  
  // Redirect back to the main page without requiring CSRF token validation
  res.redirect('/csrf');
};

// Handler to set the auth cookie (simulate login)
export const setAuthCookie = (req, res) => {
  const username = 'admin@example.com';
  
  // Set authentication cookie
  res.cookie('auth', 'true', { httpOnly: true, sameSite: 'Lax' });
  
  // Store the username in the session
  req.session.username = username;
  
  res.redirect('/csrf');
};

// Handler to serve the attack demonstration page (no CSRF validation)
export const getAttackPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/attack_page.html'));
};

// Handler to get the current CSRF protection status
export const getCsrfStatus = (req, res) => {
  res.json({ csrfEnabled });
};

// Handler to provide CSRF token for legitimate form submissions
export const getCsrfToken = (req, res) => {
  if (csrfEnabled) {
    try {
      const token = req.csrfToken();
      console.log("Generated CSRF Token:", token); // Debugging
      res.json({ csrfToken: token });
    } catch (error) {
      console.error('Error generating CSRF token:', error);
      res.status(500).json({ error: 'Could not generate CSRF token' });
    }
  } else {
    res.json({ csrfToken: null });
  }
};

// Handler to process bank transfer requests
export const handleBankTransfer = (req, res, next) => {
  if (csrfEnabled) {
    console.log("CSRF protection is enabled. Validating CSRF token.");
    next(); // Allow CSRF middleware to validate the token
  } else {
    console.log("CSRF protection is disabled. Skipping CSRF validation.");
    processTransfer(req, res); // Directly process the transfer without CSRF validation
  }
};

// Function to process the bank transfer
const processTransfer = async (req, res) => {
  try {
    const auth = req.cookies['auth'];
    const username = req.session.username;
    
    if (!auth || !username) {
      return res.status(401).send('Unauthorized');
    }

    const { amount, recipient } = req.body;

    if (!amount || !recipient) {
      return res.status(400).send('Invalid transfer details');
    }

    const transferAmount = parseInt(amount, 10);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).send('Invalid transfer amount');
    }

    const insertQuery = `
      INSERT INTO transactions (sender, amount, recipient)
      VALUES ($1, $2, $3)
      RETURNING id, amount, recipient, sender, created_at
    `;
    const insertValues = [username, transferAmount, recipient];
    const transferResult = await pool.query(insertQuery, insertValues);

    const transfer = transferResult.rows[0];
    res.send(`Transferred $${transfer.amount} to ${transfer.recipient} successfully! Transfer ID: ${transfer.id}`);
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).send('An error occurred while processing the transfer.');
  }
};
