
interface Props {
    total: number;
}

export default function InvoiceSummary({ total }: Props) {
    const iva = total * 0.19;
    const totalConIVA = total + iva;

    return (
        <div className="bg-gray-50 p-4 rounded shadow mt-4">
            <p>Total de productos: ${total.toFixed(2)}</p>
            <p>IVA (19%): ${iva.toFixed(2)}</p>
            <p className="font-bold text-lg">Total con IVA: ${totalConIVA.toFixed(2)}</p>
        </div>
    );
}
