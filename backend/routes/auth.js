const express = require('express');
const router = express.Router();
const { managementAuth } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Authenticate management user
 */
router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Password required'
    });
  }

  if (password === process.env.MANAGEMENT_PASSWORD) {
    return res.json({
      success: true,
      message: 'Authentication successful',
      hasManagementAccess: true
    });
  }

  res.status(401).json({
    success: false,
    message: 'Invalid password'
  });
});

/**
 * GET /api/auth/verify
 * Verify management credentials
 */
router.get('/verify', managementAuth, (req, res) => {
  res.json({
    success: true,
    hasManagementAccess: true
  });
});

module.exports = router;
