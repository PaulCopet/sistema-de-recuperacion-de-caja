
export interface Producto {
    id: number;
    code: string;
    name: string;
    price_und: number;
    cantidad?: number;
}

export interface Factura {
    id: number;
    products: Producto[];
    total: number;
    status: 'online' | 'offline';
}

