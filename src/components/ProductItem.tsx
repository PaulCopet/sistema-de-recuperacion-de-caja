import type { Producto } from '../types';
import { formatNumberCO } from '../utils/format';

interface Props {
    producto: Producto;
    index: number;
    onCantidadChange: (index: number, cantidad: number) => void;
    onEliminar: (index: number) => void;
}

export default function ProductItem({ producto, index, onCantidadChange, onEliminar }: Props) {
    const cantidad = producto.cantidad ?? 1;
    const bgClass = index % 2 === 0 ? 'bg-gray-100' : 'bg-white';

    return (
        <div className={`${bgClass} flex items-center justify-between p-3 rounded-lg`}>
            {/* Nombre y código */}
            <div className="flex-1 text-left text-[1.2rem]">
                {producto.codigo} – {producto.nombre}
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center space-x-1 ">
                <button
                    onClick={() => onCantidadChange(index, cantidad - 1)}
                    disabled={cantidad <= 1}
                    className="px-3 py-1 border rounded-md text-[1.2rem]"
                >
                    –
                </button>
                <span className="w-8 text-center text-[1.2rem]">{cantidad}</span>
                <button
                    onClick={() => onCantidadChange(index, cantidad + 1)}
                    className="px-3 py-1 border rounded-md text-[1.2rem]"
                >
                    +
                </button>
            </div>

            {/* Precio  formateado */}
            <div className="flex-1 text-center text-[1.2rem] ">
                {/* Quitamos el dólar manual y usamos formatNumberCO */}
                $ {formatNumberCO(producto.precio * cantidad, 0)}
            </div>

            {/* Botón eliminar */}
            <button
                onClick={() => onEliminar(index)}
                className="px-3 py-1 bg-red-500 text-white rounded-md"
            >
                Eliminar
            </button>
        </div>
    );
}
