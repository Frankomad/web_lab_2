import express from 'express';
import {
  getCsrfDemoPage,
  toggleCsrfProtection,
  setAuthCookie,
  getAttackPage,
  handleBankTransfer,
  getCsrfStatus,
  getCsrfToken,
  conditionalCsrfProtection
} from '../controllers/csrfController.js';

const router = express.Router();

// Route to serve the main CSRF demo page
router.get('/', getCsrfDemoPage);

// Apply conditional CSRF protection to sensitive routes only
router.post('/toggle', conditionalCsrfProtection, toggleCsrfProtection);
router.post('/set_auth', conditionalCsrfProtection, setAuthCookie);
router.post('/bank_transfer', conditionalCsrfProtection, handleBankTransfer);
router.get('/get_token', conditionalCsrfProtection, getCsrfToken);

// Route to serve the attack demonstration page (no CSRF protection needed)
router.get('/attack_page', getAttackPage);

// Route to get current CSRF protection status (no CSRF required)
router.get('/status', getCsrfStatus);

export default router;
