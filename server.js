const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

// Configuración de MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Tu contraseña de MySQL (vacía en XAMPP por defecto)
  database: 'techforge',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ═══════════════════════════════════════════════
//  SOLICITUDES DE SERVICIO
// ═══════════════════════════════════════════════
app.get('/api/solicitudes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, srv.nombre as servicio 
      FROM solicitudes_servicio s
      LEFT JOIN servicios srv ON s.servicio_id = srv.id
      ORDER BY s.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error solicitudes:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════
//  PRODUCTOS - LISTAR TODOS
// ═══════════════════════════════════════════════
app.get('/api/productos', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id 
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error productos:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════
//  PRODUCTO - INDIVIDUAL POR ID
// ═══════════════════════════════════════════════
app.get('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id 
      WHERE p.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Error producto individual:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════
//  CREAR PRODUCTO ✅ SIN precio_anterior
// ═══════════════════════════════════════════════
app.post('/api/productos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria_id, estado } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !precio || !categoria_id) {
      return res.status(400).json({ mensaje: 'Nombre, precio y categoría son obligatorios' });
    }

    const sql = `INSERT INTO productos 
      (nombre, descripcion, precio, stock, imagen, categoria_id, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await pool.query(sql, [
      nombre, 
      descripcion || null, 
      parseFloat(precio), 
      parseInt(stock) || 0, 
      imagen || null, 
      parseInt(categoria_id), 
      estado || 'activo'
    ]);
    
    res.status(201).json({ 
      mensaje: 'Producto creado exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════
//  ACTUALIZAR PRODUCTO (PUT) ✅ SIN precio_anterior
// ═══════════════════════════════════════════════
app.put('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, imagen, categoria_id, estado } = req.body;
    
    console.log('📦 Actualizando producto:', { id, nombre, precio, categoria_id, estado });
    
    // Validar que el producto exista
    const [existing] = await pool.query('SELECT id FROM productos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const sql = `UPDATE productos SET 
      nombre = ?, 
      descripcion = ?, 
      precio = ?, 
      stock = ?, 
      imagen = ?, 
      categoria_id = ?, 
      estado = ? 
      WHERE id = ?`;
    
    await pool.query(sql, [
      nombre, 
      descripcion || null, 
      parseFloat(precio), 
      parseInt(stock) || 0, 
      imagen || null, 
      parseInt(categoria_id), 
      estado || 'activo',
      id
    ]);
    
    console.log('✅ Producto actualizado correctamente');
    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════
//  ELIMINAR PRODUCTO
// ═══════════════════════════════════════════════
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════
//  CATEGORÍAS
// ═══════════════════════════════════════════════
app.get('/api/productos/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    console.error('❌ Error categorías:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════
//  INICIAR SERVIDOR
// ═══════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  ✅ TechForge API Server                     ║
║  🚀 Servidor corriendo en puerto ${PORT}          ║
║  📍 API: http://localhost:${PORT}              ║
║  📊 Base de datos: techforge                 ║
╚══════════════════════════════════════════════╝
  `);
});