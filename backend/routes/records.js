const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { apiTokenAuth, managementAuth } = require('../middleware/auth');

/**
 * GET /api/records
 * Get all records or filter by userId
 */
router.get('/', [apiTokenAuth, managementAuth], async (req, res) => {
  try {
    const { userId, startDate, endDate, limit = 100 } = req.query;

    let query = 'SELECT * FROM records WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND userId = ?';
      params.push(userId);
    }

    if (startDate) {
      query += ' AND startTime >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND endTime <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY startTime DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await db.execute(query, params);

    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch records'
    });
  }
});

/**
 * GET /api/records/:id
 * Get a specific record by ID
 */
router.get('/:id', [apiTokenAuth, managementAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM records WHERE recordId = ?';
    const [rows] = await db.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch record'
    });
  }
});

/**
 * PUT /api/records/:id
 * Update a record (for manual edits/corrections)
 */
router.put('/:id', [apiTokenAuth, managementAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, notes } = req.body;

    const updates = [];
    const params = [];

    if (startTime !== undefined) {
      updates.push('startTime = ?');
      params.push(startTime);
    }
    if (endTime !== undefined) {
      updates.push('endTime = ?');
      params.push(endTime);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    params.push(id);
    const query = `UPDATE records SET ${updates.join(', ')} WHERE recordId = ?`;
    
    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record updated successfully'
    });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update record'
    });
  }
});

/**
 * DELETE /api/records/:id
 * Delete a record
 */
router.delete('/:id', [apiTokenAuth, managementAuth], async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM records WHERE recordId = ?';
    
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete record'
    });
  }
});

module.exports = router;
