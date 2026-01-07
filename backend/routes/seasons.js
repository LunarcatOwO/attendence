const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { apiTokenAuth, managementAuth } = require('../middleware/auth');

/**
 * GET /api/seasons
 * Get all season start dates
 */
router.get('/', apiTokenAuth, async (req, res) => {
  try {
    const query = 'SELECT DISTINCT seasonStartDate FROM pastseasons ORDER BY seasonStartDate DESC';
    const [rows] = await db.execute(query);

    res.json({
      success: true,
      data: rows.map(row => row.seasonStartDate),
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seasons'
    });
  }
});

/**
 * GET /api/seasons/:date
 * Get all users for a specific season
 */
router.get('/:date', apiTokenAuth, async (req, res) => {
  try {
    const { date } = req.params;
    
    const query = 'SELECT * FROM pastseasons WHERE seasonStartDate = ? ORDER BY hours DESC';
    const [rows] = await db.execute(query, [date]);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching season data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch season data'
    });
  }
});

/**
 * POST /api/seasons
 * Create a new season (archives current season data)
 */
router.post('/', [apiTokenAuth, managementAuth], async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { seasonStartDate } = req.body;

    if (!seasonStartDate) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'seasonStartDate required (format: YYYY-MM-DD)'
      });
    }

    // Check if season already exists
    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM pastseasons WHERE seasonStartDate = ?',
      [seasonStartDate]
    );

    if (existing[0].count > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Season already exists'
      });
    }

    // Copy current user data to past seasons
    const archiveQuery = `
      INSERT INTO pastseasons (userId, hours, name, seasonStartDate)
      SELECT userId, hours, name, ?
      FROM users
    `;
    await connection.execute(archiveQuery, [seasonStartDate]);

    // Reset all user hours
    await connection.execute('UPDATE users SET hours = 0.00');

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'New season created successfully',
      seasonStartDate
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating season:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create season'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
