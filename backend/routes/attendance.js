const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { apiTokenAuth, managementAuth } = require('../middleware/auth');

/**
 * POST /api/attendance/sign-in
 * Sign in a user via RFID
 */
router.post('/sign-in', apiTokenAuth, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    const { rfidKey, userId } = req.body;

    if (!rfidKey && !userId) {
      return res.status(400).json({
        success: false,
        message: 'rfidKey or userId required'
      });
    }

    // Find user
    const findQuery = rfidKey 
      ? 'SELECT * FROM users WHERE rfidKey = ?'
      : 'SELECT * FROM users WHERE userId = ?';
    const findParam = rfidKey || userId;

    const [users] = await connection.execute(findQuery, [findParam]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Check if already logged in
    if (user.loggedIn === 1) {
      return res.status(400).json({
        success: false,
        message: 'User is already logged in'
      });
    }

    // Sign in user
    const updateQuery = 'UPDATE users SET loggedIn = 1, lastLogin = NOW() WHERE userId = ?';
    await connection.execute(updateQuery, [user.userId]);

    res.json({
      success: true,
      message: 'User signed in successfully',
      user: {
        userId: user.userId,
        name: user.name,
        loggedIn: true
      }
    });
  } catch (error) {
    console.error('Error signing in user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign in user'
    });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/attendance/sign-out
 * Sign out a user
 */
router.post('/sign-out', apiTokenAuth, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { rfidKey, userId } = req.body;

    if (!rfidKey && !userId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'rfidKey or userId required'
      });
    }

    // Find user
    const findQuery = rfidKey 
      ? 'SELECT * FROM users WHERE rfidKey = ?'
      : 'SELECT * FROM users WHERE userId = ?';
    const findParam = rfidKey || userId;

    const [users] = await connection.execute(findQuery, [findParam]);

    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Check if logged in
    if (user.loggedIn === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'User is not logged in'
      });
    }

    // Sign out user and update lastLogout
    const signOutQuery = 'UPDATE users SET loggedIn = 0, lastLogout = NOW() WHERE userId = ?';
    await connection.execute(signOutQuery, [user.userId]);

    // Calculate hours worked and update total hours
    const hoursQuery = `
      UPDATE users 
      SET hours = hours + (TIMESTAMPDIFF(SECOND, lastLogin, NOW()) / 3600)
      WHERE userId = ?
    `;
    await connection.execute(hoursQuery, [user.userId]);

    // Get updated times
    const [updatedUser] = await connection.execute(
      'SELECT lastLogin, lastLogout FROM users WHERE userId = ?',
      [user.userId]
    );

    // Create record
    const recordQuery = `
      INSERT INTO records (userId, startTime, endTime)
      VALUES (?, ?, ?)
    `;
    await connection.execute(recordQuery, [
      user.userId,
      updatedUser[0].lastLogin,
      updatedUser[0].lastLogout
    ]);

    await connection.commit();

    res.json({
      success: true,
      message: 'User signed out successfully',
      user: {
        userId: user.userId,
        name: user.name,
        loggedIn: false
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error signing out user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign out user'
    });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/attendance/sign-out-all
 * Sign out all logged-in users (management only)
 */
router.post('/sign-out-all', [apiTokenAuth, managementAuth], async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get all logged-in users
    const [loggedInUsers] = await connection.execute(
      'SELECT userId, lastLogin FROM users WHERE loggedIn = 1'
    );

    if (loggedInUsers.length === 0) {
      await connection.rollback();
      return res.json({
        success: true,
        message: 'No users to sign out',
        count: 0
      });
    }

    // Sign out all users
    await connection.execute('UPDATE users SET loggedIn = 0, lastLogout = NOW() WHERE loggedIn = 1');

    // Update hours for all users
    await connection.execute(`
      UPDATE users 
      SET hours = hours + (TIMESTAMPDIFF(SECOND, lastLogin, NOW()) / 3600)
      WHERE userId IN (${loggedInUsers.map(() => '?').join(',')})
    `, loggedInUsers.map(u => u.userId));

    // Create records for each user
    const recordsQuery = `
      INSERT INTO records (userId, startTime, endTime)
      VALUES ${loggedInUsers.map(() => '(?, ?, NOW())').join(', ')}
    `;
    const recordsParams = loggedInUsers.flatMap(u => [u.userId, u.lastLogin]);
    await connection.execute(recordsQuery, recordsParams);

    await connection.commit();

    res.json({
      success: true,
      message: 'All users signed out successfully',
      count: loggedInUsers.length
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error signing out all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sign out all users'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
