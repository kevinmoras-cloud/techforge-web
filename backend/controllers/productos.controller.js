const db = require("../db");

// ================= LISTAR PRODUCTOS =================
exports.listarProductos = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.precio,
        p.precio_anterior,
        p.stock,
        p.imagen,
        p.estado,
        p.created_at,
        p.updated_at,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);

    return res.json(results);
  } catch (error) {
    console.error("❌ Error en listarProductos:", error);
    return res.status(500).json({ mensaje: "Error al obtener productos" });
  }
};

// ================= OBTENER PRODUCTO POR ID =================
exports.obtenerProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT p.*, c.nombre AS categoria
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error en obtenerProducto:", error);
    return res.status(500).json({ mensaje: "Error al obtener producto" });
  }
};

// ================= CREAR PRODUCTO =================
exports.crearProducto = async (req, res) => {
  const { nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id } = req.body;

  if (!nombre || !precio || categoria_id === undefined) {
    return res.status(400).json({ mensaje: "Nombre, precio y categoría son obligatorios" });
  }

  const precioNum     = parseFloat(precio);
  const precioAntNum  = precio_anterior != null ? parseFloat(precio_anterior) : null;
  const stockNum      = parseInt(stock ?? 0, 10);
  const catId         = parseInt(categoria_id, 10);

  if (isNaN(precioNum) || precioNum < 0) {
    return res.status(400).json({ mensaje: "Precio inválido" });
  }
  if (precioAntNum !== null && (isNaN(precioAntNum) || precioAntNum < 0)) {
    return res.status(400).json({ mensaje: "Precio anterior inválido" });
  }
  if (isNaN(stockNum) || stockNum < 0) {
    return res.status(400).json({ mensaje: "Stock inválido" });
  }

  try {
    const [catRows] = await db.query("SELECT id FROM categorias WHERE id = ?", [catId]);
    if (catRows.length === 0) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    // Estado inicial: activo si stock > 0, inactivo si stock = 0
    const estadoInicial = stockNum > 0 ? "activo" : "inactivo";

    const [result] = await db.query(
      `INSERT INTO productos
         (categoria_id, nombre, descripcion, precio, precio_anterior, stock, imagen, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        catId,
        nombre.trim(),
        descripcion?.trim() || null,
        precioNum,
        precioAntNum,
        stockNum,
        imagen?.trim() || null,
        estadoInicial,
      ]
    );

    return res.status(201).json({ mensaje: "Producto creado", id: result.insertId });
  } catch (error) {
    console.error("❌ Error en crearProducto:", error);
    return res.status(500).json({ mensaje: "Error al crear producto" });
  }
};

// ================= ACTUALIZAR PRODUCTO =================
exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, estado } = req.body;

  if (!id) return res.status(400).json({ mensaje: "ID requerido" });

  try {
    const [rows] = await db.query("SELECT id, stock FROM productos WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const fields = [];
    const values = [];

    if (nombre      !== undefined) { fields.push("nombre = ?");          values.push(nombre.trim()); }
    if (descripcion !== undefined) { fields.push("descripcion = ?");      values.push(descripcion?.trim() || null); }
    if (precio      !== undefined) { fields.push("precio = ?");           values.push(parseFloat(precio)); }
    if (precio_anterior !== undefined) {
      fields.push("precio_anterior = ?");
      values.push(precio_anterior !== null && precio_anterior !== "" ? parseFloat(precio_anterior) : null);
    }
    if (imagen      !== undefined) { fields.push("imagen = ?");           values.push(imagen?.trim() || null); }
    if (categoria_id !== undefined){ fields.push("categoria_id = ?");     values.push(parseInt(categoria_id, 10)); }

    // Stock: recalcular estado automáticamente si no se envía estado explícito
    if (stock !== undefined) {
      const nuevoStock = parseInt(stock, 10);
      fields.push("stock = ?");
      values.push(nuevoStock);

      // Solo auto-calcular estado si el admin no lo envió explícitamente
      if (estado === undefined) {
        fields.push("estado = ?");
        values.push(nuevoStock > 0 ? "activo" : "inactivo");
      }
    }

    if (estado !== undefined) {
      fields.push("estado = ?");
      values.push(estado);
    }

    if (fields.length === 0) {
      return res.status(400).json({ mensaje: "No hay campos para actualizar" });
    }

    values.push(id);
    await db.query(`UPDATE productos SET ${fields.join(", ")} WHERE id = ?`, values);

    return res.json({ mensaje: "Producto actualizado" });
  } catch (error) {
    console.error("❌ Error en actualizarProducto:", error);
    return res.status(500).json({ mensaje: "Error al actualizar producto" });
  }
};

// ================= ELIMINAR PRODUCTO (soft delete) =================
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ mensaje: "ID requerido" });

  try {
    const [rows] = await db.query("SELECT id FROM productos WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    await db.query("UPDATE productos SET estado = 'inactivo' WHERE id = ?", [id]);

    return res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    console.error("❌ Error en eliminarProducto:", error);
    return res.status(500).json({ mensaje: "Error al eliminar producto" });
  }
};

// ================= LISTAR CATEGORÍAS =================
exports.listarCategorias = async (req, res) => {
  try {
    const [results] = await db.query("SELECT id, nombre FROM categorias ORDER BY nombre");
    return res.json(results);
  } catch (error) {
    console.error("❌ Error en listarCategorias:", error);
    return res.status(500).json({ mensaje: "Error al obtener categorías" });
  }
};