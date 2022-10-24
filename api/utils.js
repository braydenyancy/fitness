function requireUser(req, res, next) {
    if (!req.user) {
      next({
        error: "error",
        name: "MissingUserError",
        message: "You must be logged in to perform this action"
      });
      res.status(401)
    }
    
    next();
  }
  
  module.exports = {
    requireUser
  }