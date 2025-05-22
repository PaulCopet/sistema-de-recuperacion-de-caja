import { useState, useEffect } from 'react';
import type { Producto } from '../types';

interface Props {
    onAgregar: (producto: Producto) => void;
}

export default function SearchBar({ onAgregar }: Props) {
    const [query, setQuery] = useState('');
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Consumir el endpoint al montar el componente
    useEffect(() => {
        const fetchProductos = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/productos');
                if (!response.ok) {
                    throw new Error('Error al obtener productos');
                }
                const data = await response.json();
                setProductos(data);
            } catch (error) {

                console.error("Error fetching productos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    const sugerencias = productos.filter(p =>
        p.code.toLowerCase().includes(query.toLowerCase()) || p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (loading) return <div>Buscando productos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Buscar por código o nombre..."
                className="w-full p-2 border rounded mb-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            {query && (
                <ul className="absolute z-10 w-full border rounded bg-white shadow-lg max-h-60 overflow-auto">
                    {sugerencias.length > 0 ? (
                        sugerencias.map((producto) => (
                            <li
                                key={`${producto.code}-${producto.name}`}
                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                    onAgregar(producto);
                                    setQuery('');
                                }}
                            >
                                <div className="font-semibold">{producto.code}</div>
                                <div>{producto.name}</div>
                                <div className="text-green-600">${producto.price_und}</div>
                            </li>
                        ))
                    ) : (
                        <li className="p-2 text-gray-500">No se encontraron productos</li>
                    )}
                </ul>
            )}
        </div>
    );
}