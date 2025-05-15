import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import facturasRouter from "./routes.js";

// Configuración básica
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Variables de entorno
const PORT = process.env.PORT || 3000;
const MONGOURL = process.env.MONGODB_URL;

console.log("MONGODB_URL:", MONGOURL);

// Definición de esquemas
const productos = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    measuare_und: {
        type: String,
        required: true
    },
    price_und: {
        type: Number,
        required: true
    }
});

const productoFacturaSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price_total: {
        type: Number,
        default: 0
    }
});

const factura = new mongoose.Schema({
    bill: {
        number: String,
        status: {
            type: String,
            enum: ["Pendiente", "Enviado"],
            default: "Pendiente",
        },
        totalPrice: {
            type: Number,
            default: 0
        },
        totalProducts: {
            type: Number,
            default: 0
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    },
    products: [productoFacturaSchema]
});

// Creación de modelos
const productModel = mongoose.model("Product", productos);
const factModel = mongoose.model("Bill", factura);



// Registrar el router en la aplicación
app.use("/api", facturasRouter);

// Ruta de prueba para verificar que el servidor funciona
app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente");
});

// Conexión a MongoDB
mongoose.connect(MONGOURL)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on Port ${PORT}`);
        });
    })
    .catch((error) => console.log("Error connecting to MongoDB:", error));

// Exportar modelos
export { productModel, factModel };