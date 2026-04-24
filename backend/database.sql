-- ELIMINAR BASE DE DATOS SI EXISTE
DROP DATABASE IF EXISTS techforge;

-- CREAR BASE DE DATOS LIMPIA
CREATE DATABASE techforge
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE techforge;

-- =========================================
-- ROLES
-- =========================================
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(100),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (nombre, descripcion) VALUES
('usuario', 'Cliente general'),
('tecnico', 'Técnico de soporte'),
('admin', 'Administrador del sistema');

-- =========================================
-- USUARIOS
-- =========================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  direccion VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol_id INT DEFAULT 1,
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- =========================================
-- CATEGORIAS
-- =========================================
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(150),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categorias (nombre, descripcion) VALUES
('Procesadores', 'Procesadores para PC'),
('Tarjetas Gráficas', 'GPUs'),
('Memoria RAM', 'RAM'),
('Almacenamiento', 'SSD y HDD');

-- =========================================
-- PRODUCTOS
-- =========================================
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT,
  nombre VARCHAR(120),
  descripcion TEXT,
  precio DECIMAL(10,2),
  stock INT DEFAULT 0,
  imagen VARCHAR(255),
  estado ENUM('activo','inactivo') DEFAULT 'activo',
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- =========================================
-- SERVICIOS
-- =========================================
CREATE TABLE servicios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) UNIQUE,
  descripcion TEXT,
  precio_base DECIMAL(10,2) DEFAULT 0
);

INSERT INTO servicios (nombre, descripcion) VALUES
('Ensamble PC','Armado de computadores'),
('Reparación','Reparación general'),
('Mantenimiento','Limpieza y optimización');

-- =========================================
-- ESTADOS SERVICIO
-- =========================================
CREATE TABLE estados_servicio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(40) UNIQUE
);

INSERT INTO estados_servicio (nombre) VALUES
('pendiente'),
('en_proceso'),
('finalizado');

-- =========================================
-- SOLICITUDES
-- =========================================
CREATE TABLE solicitudes_servicio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  servicio_id INT,
  nombre_contacto VARCHAR(100),
  correo_contacto VARCHAR(100),
  descripcion TEXT,
  estado_id INT DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (servicio_id) REFERENCES servicios(id),
  FOREIGN KEY (estado_id) REFERENCES estados_servicio(id)
);

-- =========================================
-- CARRITO
-- =========================================
CREATE TABLE carritos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNIQUE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE carrito_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carrito_id INT,
  producto_id INT,
  cantidad INT,
  FOREIGN KEY (carrito_id) REFERENCES carritos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =========================================
-- PEDIDOS
-- =========================================
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  total DECIMAL(10,2),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE pedido_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  producto_id INT,
  cantidad INT,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);