
export interface Producto {
    _id: string;
    id: number;
    code: string;
    name: string;
    price_und: number;
    cantidad?: number;
}

export interface Factura {
    id: number
    bill: {
        number: string;
        status?: "Pendiente" | "Enviado";
        totalPrice?: number;
        totalProducts?: number;
        fecha?: Date;
    };
    products: {
        name: string;
        producto: string; // ID de Mongo o el objeto populate
        quantity: number;
        price_und: number;
        price_total?: number;
    }[];
}
