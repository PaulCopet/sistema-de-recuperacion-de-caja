
import type { Producto } from '../types';

interface Props {
    producto: Producto;
    index: number;
    onCantidadChange: (index: number, cantidad: number) => void;
    onEliminar: (index: number) => void;
}

export default function ProductItem({ producto, index, onCantidadChange, onEliminar }: Props) {
    return (
        <div className="flex justify-between items-center p-2 border rounded bg-white shadow-sm my-1">
            <span>{producto.codigo} - {producto.nombre}</span>
            <input
                type="number"
                value={producto.cantidad}
                onChange={(e) => onCantidadChange(index, parseInt(e.target.value))}
                className="w-16 text-center border rounded"
                min={1}
                title="Cantidad"
                placeholder="Cantidad"
            />
            <span>${(producto.precio * (producto.cantidad ?? 1)).toFixed(2)}</span>
            <button onClick={() => onEliminar(index)} className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
        </div>
    );
}
