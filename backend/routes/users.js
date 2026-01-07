const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { apiTokenAuth, managementAuth } = require('../middleware/auth');

/**
 * GET /api/users
 * Get all users or specific user by ID or RFID
 */
router.get('/', apiTokenAuth, async (req, res) => {
  try {
    const { userId, rfidKey } = req.query;
    let query, params = [];

    if (userId) {
      query = 'SELECT * FROM users WHERE userId = ?';
      params = [userId];
    } else if (rfidKey) {
      query = 'SELECT * FROM users WHERE rfidKey = ?';
      params = [rfidKey];
    } else {
      query = 'SELECT * FROM users ORDER BY name ASC';
    }

    const [rows] = await db.execute(query, params);

    if (userId || rfidKey) {
      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      return res.json({
        success: true,
        data: rows[0]
      });
    }

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

/**
 * GET /api/users/logged-in
 * Get all currently logged-in users
 */
router.get('/logged-in', apiTokenAuth, async (req, res) => {
  try {
    const query = 'SELECT * FROM users WHERE loggedIn = 1 ORDER BY lastLogin ASC';
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching logged-in users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logged-in users'
    });
  }
});

/**
 * GET /api/users/:id/name
 * Get user's name by ID
 */
router.get('/:id/name', apiTokenAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT name FROM users WHERE userId = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      name: rows[0].name
    });
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user name'
    });
  }
});

/**
 * GET /api/users/:id/status
 * Check if user is logged in
 */
router.get('/:id/status', apiTokenAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT loggedIn FROM users WHERE userId = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      loggedIn: rows[0].loggedIn === 1
    });
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user status'
    });
  }
});

/**
 * GET /api/users/exists
 * Check if user exists by RFID or ID
 */
router.get('/exists', apiTokenAuth, async (req, res) => {
  try {
    const { userId, rfidKey } = req.query;
    
    if (!userId && !rfidKey) {
      return res.status(400).json({
        success: false,
        message: 'userId or rfidKey required'
      });
    }

    let query, params;
    if (userId) {
      query = 'SELECT COUNT(*) as count FROM users WHERE userId = ?';
      params = [userId];
    } else {
      query = 'SELECT COUNT(*) as count FROM users WHERE rfidKey = ?';
      params = [rfidKey];
    }

    const [rows] = await db.execute(query, params);

    res.json({
      success: true,
      exists: rows[0].count > 0
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user existence'
    });
  }
});

/**
 * POST /api/users
 * Create a new user (requires management auth)
 */
router.post('/', [apiTokenAuth, managementAuth], async (req, res) => {
  try {
    const { name, rfidKey } = req.body;

    if (!name || !rfidKey) {
      return res.status(400).json({
        success: false,
        message: 'Name and RFID key are required'
      });
    }

    // Check if RFID already exists
    const [existing] = await db.execute(
      'SELECT userId FROM users WHERE rfidKey = ?',
      [rfidKey]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'RFID key already exists'
      });
    }

    const query = `
      INSERT INTO users (name, rfidKey, hours, loggedIn)
      VALUES (?, ?, 0.00, 0)
    `;
    
    const [result] = await db.execute(query, [name, rfidKey]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

/**
 * PUT /api/users/:id
 * Update user information (requires management auth)
 */
router.put('/:id', [apiTokenAuth, managementAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hours } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (hours !== undefined) {
      updates.push('hours = ?');
      params.push(hours);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE userId = ?`;
    
    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user (requires management auth)
 */
router.delete('/:id', [apiTokenAuth, managementAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM users WHERE userId = ?';
    
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;
