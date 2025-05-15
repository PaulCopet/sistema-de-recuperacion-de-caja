// src/pages/Main.tsx
import { useEffect, useState } from 'react';
import SearchBar from '../components/SearchBar';
import ProductItem from '../components/ProductItem';
import InvoiceSummary from '../components/InvoiceSummary';
import Modal from '../components/Modal';
import StatsChart from '../components/StatsChart';
import Notification from '../components/Notification';
import type { NotificationData } from '../components/Notification';
import type { Producto, Factura } from '../types';
import productosData from '../productos.json';

export default function Main() {
    const [productos] = useState<Producto[]>(productosData);
    const [seleccionados, setSeleccionados] = useState<Producto[]>([]);
    const [notifs, setNotifs] = useState<NotificationData[]>([]);
    const [localInv, setLocalInv] = useState<Factura[]>(() => JSON.parse(localStorage.getItem('invoices') || '[]'));
    const [sentInv, setSentInv] = useState<Factura[]>(() => JSON.parse(localStorage.getItem('sentInvoices') || '[]'));
    const [savedInv, setSavedInv] = useState<Factura[]>(() => JSON.parse(localStorage.getItem('savedInvoices') || '[]'));
    const [isOnline, setIsOnline] = useState(false);
    const [showFactModal, setShowFactModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);

    // Notificación helper
    const pushNotif = (message: string, type: NotificationData['type'] = 'info') => {
        const n: NotificationData = { id: Date.now(), message, type };
        setNotifs(nfs => [...nfs, n]);
    };
    const removeNotif = (id: number) => {
        setNotifs(nfs => nfs.filter(x => x.id !== id));
    };

    // Sync offline → online
    const syncInvoices = async () => {
        // Hacemos una copia del array al inicio
        const porSincronizar = [...localInv];
        for (const inv of porSincronizar) {
            if (!isOnline) break;              // Si volvemos a offline, interrumpimos
            // simulamos delay de red
            await new Promise(r => setTimeout(r, 500));

            // Eliminamos la factura sincronizada de localInv
            setLocalInv(prev => prev.filter(x => x.id !== inv.id));
            // Añadimos a sentInv con status online
            setSentInv(prev => [...prev, { ...inv, status: 'online' }]);
            // Guardamos en savedInv
            setSavedInv(prev => [...prev, inv]);

            // Notificación de éxito
            pushNotif(`Factura #${inv.id} sincronizada`, 'success');
        }
    };

    useEffect(() => {
        localStorage.setItem('invoices', JSON.stringify(localInv));
        localStorage.setItem('sentInvoices', JSON.stringify(sentInv));
        localStorage.setItem('savedInvoices', JSON.stringify(savedInv));
    }, [localInv, sentInv, savedInv]);

    // Estado online/offline
    const toggleOnline = () => {
        setIsOnline(o => !o);
        pushNotif(isOnline ? 'Modo OFFLINE' : 'Modo ONLINE', 'info');
    };
    useEffect(() => { if (isOnline) syncInvoices(); }, [isOnline]);

    // Agregar producto
    const agregar = (p: Producto) => {
        setSeleccionados(sel => {
            const idx = sel.findIndex(x => x.codigo === p.codigo);
            if (idx !== -1) {
                const copia = [...sel];
                copia[idx].cantidad!++;
                return copia;
            }
            return [...sel, { ...p, cantidad: 1 }];
        });
    };
    const cambiarCant = (i: number, c: number) => {
        setSeleccionados(sel => sel.map((x, idx) => idx === i ? { ...x, cantidad: c } : x));
    };
    const eliminar = (i: number) => {
        setSeleccionados(sel => sel.filter((_, idx) => idx !== i));
    };

    // Generar pago
    const generarPago = () => {
        const total = seleccionados.reduce((sum, x) => sum + x.precio * (x.cantidad || 1), 0);
        const inv: Factura = { id: Date.now(), products: seleccionados, total, status: isOnline ? 'online' : 'offline' };
        if (isOnline) setSentInv(si => [...si, inv]), pushNotif('Factura enviada', 'success');
        else if (localInv.length < 20) setLocalInv(li => [...li, inv]), pushNotif('Guardada localmente', 'warning');
        else pushNotif('Límite de facturas locales alcanzado', 'error');
        setSeleccionados([]);
    };

    // Totales para la gráfica
    const totalOfflineAmt = localInv.reduce((s, x) => s + x.total, 0);
    const totalOnlineAmt = sentInv.reduce((s, x) => s + x.total, 0);
    const totalSavedAmt = savedInv.reduce((s, x) => s + x.total, 0);

    return (
        <div className="p-4 space-y-4">
            {/* Botones y estado */}
            <div className="flex justify-between items-center">
                <div className="space-x-2">
                    <button onClick={() => setShowFactModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded">
                        Facturas Local ({localInv.length})
                    </button>
                    <button onClick={() => setShowStatsModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded">
                        Estadísticas
                    </button>
                </div>
                <button
                    onClick={toggleOnline}
                    className={`px-4 py-2 rounded text-white ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}
                >
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                </button>
            </div>

            <div className="flex space-x-4">
                {/* Lista productos seleccionados */}
                <div className="w-1/2">
                    <h2 className="text-xl font-semibold mb-2">Productos en la Factura</h2>
                    <div className="space-y-1">
                        {seleccionados.map((p, i) => (
                            <ProductItem
                                key={p.codigo}
                                producto={p}
                                index={i}
                                onCantidadChange={cambiarCant}
                                onEliminar={eliminar}
                            />
                        ))}
                    </div>
                    <InvoiceSummary
                        total={seleccionados.reduce((s, x) => s + x.precio * (x.cantidad || 1), 0)}
                    />
                    <button
                        onClick={generarPago}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                        Generar Pago
                    </button>
                </div>

                {/* Buscador */}
                <div className="w-1/2">
                    <h2 className="text-xl font-semibold mb-2">Agregar Producto</h2>
                    <SearchBar productos={productos} onAgregar={agregar} />
                </div>
            </div>

            {/* Notificaciones */}
            <div className="fixed top-4 right-4 w-80 z-50">
                {notifs.map(n => (
                    <Notification key={n.id} notif={n} onDone={removeNotif} />
                ))}
            </div>

            {/* Modal facturas locales */}
            <Modal isOpen={showFactModal} title="Facturas Locales" onClose={() => setShowFactModal(false)}>
                {localInv.length === 0
                    ? <p>No hay facturas locales.</p>
                    : localInv.map(f => (
                        <div key={f.id} className="border-b py-2">
                            <p><strong>ID:</strong> {f.id}</p>
                            <p><strong>Total:</strong> ${f.total.toFixed(2)}</p>
                            <p><strong>Productos:</strong> {f.products.length}</p>
                        </div>
                    ))
                }
            </Modal>

            {/* Modal estadísticas */}
            <Modal isOpen={showStatsModal} title="Estadísticas" onClose={() => setShowStatsModal(false)}>
                <StatsChart
                    onlineCount={sentInv.filter(i => i.status === 'online').length}
                    offlineCount={localInv.length}
                    savedCount={savedInv.length}
                    onlineAmount={totalOnlineAmt}
                    offlineAmount={totalOfflineAmt}
                    savedAmount={totalSavedAmt}
                />
            </Modal>
        </div>
    );
}
