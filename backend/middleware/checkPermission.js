export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const admin = req.admin;
    const permission = admin.permissions.find((p) => p.resource === resource);

    if (!permission || !permission.actions.includes(action)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};
