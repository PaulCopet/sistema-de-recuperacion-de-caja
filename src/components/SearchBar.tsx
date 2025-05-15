
import { useState } from 'react';
import type { Producto } from '../types';

interface Props {
    productos: Producto[];
    onAgregar: (producto: Producto) => void;
}

export default function SearchBar({ productos, onAgregar }: Props) {
    const [query, setQuery] = useState('');

    const sugerencias = productos.filter(p =>
        p.codigo.includes(query.toLowerCase())
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar por código..."
                className="w-full p-2 border rounded mb-2"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="border rounded">
                {sugerencias.map((producto) => (
                    <li
                        key={producto.codigo}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            onAgregar(producto);
                            setQuery('');
                        }}
                    >
                        {producto.codigo} - {producto.nombre} - ${producto.precio}
                    </li>
                ))}
            </ul>
        </div>
    );
}
