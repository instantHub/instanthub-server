export const authorize = (...roles) => {
  return (req, res, next) => {
    // req.role is set by the generic `auth` middleware
    console.log("authorize - req.role", req.role);
    console.log("authorize - roles", roles);

    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(
          " or "
        )}. You have role: ${req.role}.`,
      });
    }
    next();
  };
};
