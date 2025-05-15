
export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    precio: number;
    cantidad?: number;
}

export interface Factura {
    id: number;
    products: Producto[];
    total: number;
    status: 'online' | 'offline';
}

