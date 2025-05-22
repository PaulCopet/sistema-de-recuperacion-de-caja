
import express from "express";
import { factModel, productModel } from "./index.js";

const router = express.Router();

// Obtener todas las facturas
router.get("/facturas", async (req, res) => {
  try {
    const facturas = await factModel.find().populate({
      path: "products.producto",
      model: "Product"
    });
    res.status(200).json(facturas);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener facturas", error: error.message });
  }
});

// Obtener una factura por ID
router.get("/facturas/:id", async (req, res) => {
  try {
    const factura = await factModel.findById(req.params.id).populate({
      path: "products.producto",
      model: "Product"
    });
    
    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    res.status(200).json(factura);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la factura", error: error.message });
  }
});

// Crear nueva factura
router.post("/facturas", async (req, res) => {
  try {
    const { bill, products } = req.body;
    // Calcular totales
    let totalPrice = 0;
    let totalProducts = 0;
    
    // Si hay productos en la factura, calculamos los totales
    if (products && products.length > 0) {
      // Calculamos el precio total de cada producto (precio unitario * cantidad)
      for (const product of products) {
        totalProducts += product.quantity;
        product.price_total = product.price_total || product.quantity * product.price_und;
        totalPrice += product.price_total;
      }
    }
    
    // Asignar los totales calculados
    const billData = {
      ...bill,
      totalPrice,
      totalProducts
    };
    
    const nuevaFactura = new factModel({
      bill: billData,
      products
    });
    
    const facturaGuardada = await nuevaFactura.save();
    res.status(201).json(facturaGuardada);
  } catch (error) {
    res.status(400).json({ message: "Error al crear la factura", error: error.message });
  }
});

// Actualizar factura
router.put("/facturas/:id", async (req, res) => {
  try {
    const { bill, products } = req.body;
    
    // Calcular totales
    let totalPrice = 0;
    let totalProducts = 0;
    
    // Si hay productos en la factura, calculamos los totales
    if (products && products.length > 0) {
      // Calculamos el precio total de cada producto (precio unitario * cantidad)
      for (const product of products) {
        totalProducts += product.quantity;
        product.price_total = product.price_total || product.quantity * product.price_und;
        totalPrice += product.price_total;
      }
    }
    
    // Asignar los totales calculados
    const billData = {
      ...(bill || {}),
      totalPrice,
      totalProducts
    };
    
    const facturaActualizada = await factModel.findByIdAndUpdate(
      req.params.id,
      {
        bill: billData,
        products
      },
      { new: true }
    );
    
    if (!facturaActualizada) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    res.status(200).json(facturaActualizada);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar la factura", error: error.message });
  }
});

// Eliminar factura
router.delete("/facturas/:id", async (req, res) => {
  try {
    const facturaEliminada = await factModel.findByIdAndDelete(req.params.id);
    
    if (!facturaEliminada) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }
    
    res.status(200).json({ message: "Factura eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la factura", error: error.message });
  }
});

// Crear nuevo producto (endpoint adicional para facilitar pruebas)
router.post("/productos", async (req, res) => {
  try {
    const nuevoProducto = new productModel(req.body);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    res.status(400).json({ message: "Error al crear el producto", error: error.message });
  }
});

// Obtener todos los productos (endpoint adicional para facilitar pruebas)
router.get("/productos", async (req, res) => {
  try {
    const productos = await productModel.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error: error.message });
  }
});

export default router;