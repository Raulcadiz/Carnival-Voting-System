const jwt = require('jsonwebtoken');

// Middleware para verificar si el usuario es admin
const authMiddleware = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado - Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cambiar_esto_en_produccion');
    
    // Agregar datos del admin al request
    req.admin = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Error de autenticación' });
  }
};

// Generar token JWT
const generateToken = (username) => {
  return jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET || 'cambiar_esto_en_produccion',
    { expiresIn: '24h' }
  );
};

// Verificar credenciales de admin
const verifyAdminCredentials = (username, password) => {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'carnival2025';
  
  return username === adminUsername && password === adminPassword;
};

module.exports = {
  authMiddleware,
  generateToken,
  verifyAdminCredentials
};
