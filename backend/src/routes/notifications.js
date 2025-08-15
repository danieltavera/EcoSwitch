const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

// Middleware to validate user authentication and get real user from JWT token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecoswitch_secret_key');
    
    // Check if user exists in database
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    // Attach user info to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// GET /api/notifications - Get user notifications with pagination and filters
router.get('/', authenticateUser, async (req, res) => {
  const userId = req.userId; // From JWT token, not URL parameter
  const { 
    page = 1, 
    limit = 20, 
    type = null, 
    unread_only = false 
  } = req.query;

  try {
    // Build the query with filters
    let query = `
      SELECT 
        id,
        type,
        title,
        message,
        data,
        is_read,
        created_at,
        sent_at
      FROM notifications 
      WHERE user_id = $1
    `;
    
    const queryParams = [userId];
    let paramCount = 1;

    // Add type filter if specified
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      queryParams.push(type);
    }

    // Add unread filter if specified
    if (unread_only === 'true') {
      query += ` AND is_read = FALSE`;
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC`;
    
    const offset = (page - 1) * limit;
    paramCount += 2;
    query += ` LIMIT $${paramCount - 1} OFFSET $${paramCount}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM notifications 
      WHERE user_id = $1
    `;
    const countParams = [userId];

    if (type) {
      countQuery += ` AND type = $2`;
      countParams.push(type);
    }

    if (unread_only === 'true') {
      countQuery += ` AND is_read = FALSE`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticateUser, async (req, res) => {
  const userId = req.userId; // From JWT token

  try {
    // Use the database function we created
    const result = await pool.query(
      'SELECT get_unread_notification_count($1) as count',
      [userId]
    );

    res.json({
      success: true,
      data: {
        unreadCount: result.rows[0].count
      }
    });

  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // From JWT token

  try {
    // Validate UUID format for notification ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }

    // Use the database function we created
    const result = await pool.query(
      'SELECT mark_notification_read($1, $2) as success',
      [id, userId]
    );

    const wasUpdated = result.rows[0].success;

    if (wasUpdated) {
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      res.status(404).json({
        error: 'Notification not found or already read'
      });
    }

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read for authenticated user
router.put('/mark-all-read', authenticateUser, async (req, res) => {
  const userId = req.userId; // From JWT token

  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      message: `Marked ${result.rowCount} notifications as read`
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/notifications - Create a manual notification (admin use)
router.post('/', authenticateUser, async (req, res) => {
  const { targetUserId, type, title, message, data = {}, scheduledFor = null } = req.body;
  
  // For now, allow any authenticated user to create notifications
  // In production, you might want to restrict this to admin users
  
  try {
    // If no targetUserId specified, create notification for current user
    const userId = targetUserId || req.userId;
    
    // Validate required fields
    if (!type || !title || !message) {
      return res.status(400).json({ 
        error: 'Required fields: type, title, message' 
      });
    }

    // If targetUserId is specified, validate it exists
    if (targetUserId) {
      const userExists = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND is_active = true',
        [targetUserId]
      );
      
      if (userExists.rows.length === 0) {
        return res.status(404).json({ error: 'Target user not found or inactive' });
      }
    }

    // Validate notification type
    const validTypes = [
      'achievement', 'reminder', 'tip', 'challenge', 'goal', 
      'system', 'social', 'bill_reminder', 'savings_report', 'welcome'
    ];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Invalid notification type. Valid types: ${validTypes.join(', ')}` 
      });
    }

    // Use the database function we created
    const result = await pool.query(
      'SELECT create_notification($1, $2, $3, $4, $5, $6) as notification_id',
      [userId, type, title, message, JSON.stringify(data), scheduledFor]
    );

    const notificationId = result.rows[0].notification_id;

    res.status(201).json({
      success: true,
      data: {
        notificationId,
        message: 'Notification created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // From JWT token

  try {
    // Validate UUID format for notification ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }

    // Only allow users to delete their own notifications
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'Notification not found or access denied'
      });
    }

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/notifications/types - Get available notification types
router.get('/types', (req, res) => {
  try {
    const notificationTypes = [
      { type: 'achievement', description: 'User earned a new achievement or milestone' },
      { type: 'reminder', description: 'Reminder to log energy consumption or complete tasks' },
      { type: 'tip', description: 'Energy saving tips and recommendations' },
      { type: 'challenge', description: 'New challenges available or challenge updates' },
      { type: 'goal', description: 'Goal progress updates and achievements' },
      { type: 'system', description: 'System announcements and updates' },
      { type: 'social', description: 'Community posts, comments, and social interactions' },
      { type: 'bill_reminder', description: 'Reminder to input monthly energy bills' },
      { type: 'savings_report', description: 'Monthly or weekly energy savings reports' },
      { type: 'welcome', description: 'Welcome messages for new users or feature introductions' }
    ];

    res.json({
      success: true,
      data: notificationTypes
    });
  } catch (error) {
    console.error('Error fetching notification types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
