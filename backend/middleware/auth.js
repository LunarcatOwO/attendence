/**
 * Authentication Middleware
 * Verifies API tokens and management passwords
 */

const apiTokenAuth = (req, res, next) => {
  const token = req.headers['x-api-token'] || req.query.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'API token required'
    });
  }

  if (token !== process.env.API_TOKEN) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API token'
    });
  }

  next();
};

const managementAuth = (req, res, next) => {
  const password = req.headers['x-management-password'] || req.body.password;
  
  if (!password) {
    return res.status(401).json({
      success: false,
      message: 'Management password required'
    });
  }

  if (password !== process.env.MANAGEMENT_PASSWORD) {
    return res.status(403).json({
      success: false,
      message: 'Invalid management password'
    });
  }

  next();
};

module.exports = {
  apiTokenAuth,
  managementAuth
};
