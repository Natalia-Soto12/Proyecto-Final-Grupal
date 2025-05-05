function adminAuth(req, res, next) {
  if (req.session && req.session.nombreAdmin) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado, por favor inicie sesión como administrador' });
  }
}

module.exports = { adminAuth };
