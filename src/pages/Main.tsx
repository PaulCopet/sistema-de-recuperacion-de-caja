// src/pages/Main.tsx
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import SearchBar from '../components/SearchBar';
import { formatNumberCO } from '../utils/format';
import ProductItem from '../components/ProductItem';
import InvoiceSummary from '../components/InvoiceSummary';
import Modal from '../components/Modal';
import StatsChart from '../components/StatsChart';
import Notification from '../components/Notification';
import type { NotificationData } from '../components/Notification';
import type { Producto, Factura } from '../types';

// Mantiene un map de refs para cada factura/producto


export default function Main() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [seleccionados, setSeleccionados] = useState<Producto[]>([]);
    const [notifs, setNotifs] = useState<NotificationData[]>([]);
    const [localInv, setLocalInv] = useState<Factura[]>(() => JSON.parse(localStorage.getItem('invoices') || '[]'));
    const [sentInv, setSentInv] = useState<Factura[]>(() => JSON.parse(localStorage.getItem('sentInvoices') || '[]'));
    const [savedInv, setSavedInv] = useState<Factura[]>(() => JSON.parse(localStorage.getItem('savedInvoices') || '[]'));
    const [isOnline, setIsOnline] = useState(false);
    const [showFactModal, setShowFactModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const nodeRefs = useRef<Record<number, React.RefObject<HTMLDivElement | null>>>({});
    const [expanded, setExpanded] = useState<number[]>([]);

    // Notificación helper
    const pushNotif = (message: string, type: NotificationData['type'] = 'info') => {
        const n: NotificationData = { id: Date.now(), message, type };
        setNotifs(nfs => [...nfs, n]);
    };
    const removeNotif = (id: number) => {
        setNotifs(nfs => nfs.filter(x => x.id !== id));
    };

    // mantiene qué facturas están expandidas
    const toggleExpand = (id: number) => {
        setExpanded(prev =>
            prev.includes(id)
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const syncInvoices = async () => {
        const porSincronizar = [...localInv];

        for (const inv of porSincronizar) {
            if (!isOnline) break;
            await new Promise(r => setTimeout(r, 500));

            try {
                const response = await fetch("http://localhost:3000/facturas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(inv)
                });

                if (!response.ok) throw new Error("Error al sincronizar factura");

                await response.json();

                // Si el POST fue exitoso:
                setLocalInv(prev => prev.filter(x => x.id !== inv.id));
                setSentInv(prev => [...prev, { ...inv, status: 'online' }]);
                setSavedInv(prev => [...prev, inv]);
                pushNotif(`Factura #${inv.bill?.number} sincronizada`, 'success');

            } catch (error) {
                console.error("Error al sincronizar factura:", error);
                pushNotif(`Error al sincronizar factura #${inv.bill?.number}`, 'error');
            }
        }
    };


    useEffect(() => {
        localStorage.setItem('invoices', JSON.stringify(localInv));
        localStorage.setItem('sentInvoices', JSON.stringify(sentInv));
        localStorage.setItem('savedInvoices', JSON.stringify(savedInv));
    }, [localInv, sentInv, savedInv]);
    useEffect(() => {
        const cargarProductos = async () => {
            if (navigator.onLine) {
                try {
                    const res = await fetch("http://localhost:3000/productos");
                    if (!res.ok) throw new Error("Error al obtener productos");
                    const data = await res.json();
                    setProductos(data);
                    localStorage.setItem("productosOffline", JSON.stringify(data));
                    pushNotif("Productos cargados desde servidor", "success");
                } catch (error) {
                    console.warn("Fallo al cargar desde el backend. Usando productos locales.");
                    const local = localStorage.getItem("productosOffline");
                    if (local) {
                        setProductos(JSON.parse(local));
                        pushNotif("Productos cargados desde almacenamiento local", "info");
                    } else {
                        pushNotif("No hay productos disponibles", "error");
                    }
                }
            } else {
                const local = localStorage.getItem("productosOffline");
                if (local) {
                    setProductos(JSON.parse(local));
                    pushNotif("Productos cargados en modo offline", "info");
                } else {
                    pushNotif("No hay productos disponibles en modo offline", "error");
                }
            }
        };

        cargarProductos();
    }, []);


    // Estado online/offline
    const toggleOnline = () => {
        setIsOnline(o => !o);
        pushNotif(isOnline ? 'Modo OFFLINE' : 'Modo ONLINE', 'info');
    };
    useEffect(() => { if (isOnline) syncInvoices(); }, [isOnline]);

    // Agregar producto
    const agregar = (p: Producto) => {
        setSeleccionados(sel => {
            const idx = sel.findIndex(x => x.code === p.code);
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

    const generarPago = async () => {
        if (seleccionados.length === 0) {
            pushNotif("Agrega productos a la factura", "error");
            return;
        }

        const nuevaFactura: Factura = {
            id: Date.now(), // id temporal para gestión local
            bill: {
                number: `FAC-${Date.now()}`,
                status: "Pendiente",
                totalPrice: seleccionados.reduce((sum, p) => sum + p.price_und * (p.cantidad || 1), 0),
                totalProducts: seleccionados.reduce((sum, p) => sum + (p.cantidad || 1), 0),
                fecha: new Date()
            },
            products: seleccionados.map(p => ({
                name: p.name,
                producto: String(p._id || p.id),  // <-- aquí convertimos a string
                quantity: p.cantidad || 1,
                price_und: p.price_und,
            }))

        };

        if (!isOnline) {
            // OFFLINE: Guardar localmente
            setLocalInv(prev => [...prev, nuevaFactura]);
            pushNotif("Factura guardada localmente", "success");
            setSeleccionados([]);
            return;
        }

        // ONLINE: Enviar a backend
        try {
            const response = await fetch("http://localhost:3000/facturas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaFactura)
            });

            if (!response.ok) throw new Error("Error al generar la factura");

            await response.json();

            // Actualizamos estados: enviada y guardada
            setSentInv(prev => [...prev, { ...nuevaFactura, status: 'online' }]);
            setSavedInv(prev => [...prev, nuevaFactura]);

            pushNotif("Factura enviada exitosamente al servidor", "success");
            setSeleccionados([]);
        } catch (error) {
            console.error("Error al generar factura:", error);
            pushNotif("Error al generar factura", "error");
        }
    };


    // Totales para la gráfica
    const totalOfflineAmt = localInv.reduce((s, x) => s + (x.bill?.totalPrice || 0), 0);
    const totalOnlineAmt = sentInv.reduce((s, x) => s + (x.bill?.totalPrice || 0), 0);
    const totalSavedAmt = savedInv.reduce((s, x) => s + (x.bill?.totalPrice || 0), 0);




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

                    <TransitionGroup component="div" className="divide-y divide-gray-200">
                        {seleccionados.map((p, i) => {
                            // Si no existe, créalo y guarda en nodeRefs
                            if (!nodeRefs.current[p.id]) {
                                nodeRefs.current[p.id] = React.createRef<HTMLDivElement>();
                            }
                            const nodeRef = nodeRefs.current[p.id]!;

                            return (
                                <CSSTransition
                                    key={p.id}
                                    nodeRef={nodeRef}
                                    timeout={300}
                                    classNames="item"
                                    onExited={() => {
                                        // opcional: limpiar el ref una vez animado el exit
                                        delete nodeRefs.current[p.id];
                                    }}
                                >
                                    <div ref={nodeRef}>
                                        <ProductItem
                                            producto={p}
                                            index={i}
                                            onCantidadChange={cambiarCant}
                                            onEliminar={eliminar}
                                        />
                                    </div>
                                </CSSTransition>
                            );
                        })}
                    </TransitionGroup>


                    <InvoiceSummary
                        total={seleccionados.reduce((s, x) => s + x.price_und * (x.cantidad || 1), 0)}
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
                    <SearchBar onAgregar={agregar} />
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

                {localInv.map(inv => {
                    const isOpen = expanded.includes(inv.id);
                    return (
                        <div
                            key={inv.id}
                            className={`
                bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4
                w-full max-w-md
                ${isOpen ? 'ring-2 ring-indigo-300' : ''}
                flex flex-col 
            `}
                        >
                            {/* Header de la tarjeta */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">Factura #{inv.bill?.number}</p>
                                    <p className="text-gray-600">
                                        Total: <span className="font-medium">{formatNumberCO(inv.bill?.totalPrice || 0)}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => toggleExpand(inv.id)}
                                    className={`
                        w-8 h-8 flex items-center justify-center text-xl font-bold
                        bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors
                    `}
                                    aria-label={isOpen ? 'Colapsar detalles' : 'Ver detalles'}
                                >
                                    {isOpen ? '–' : '+'}
                                </button>
                            </div>

                            {/* Detalles: lista de productos */}
                            {isOpen && (
                                <ul className="mt-3 space-y-2 w-full max-h-48 overflow-auto">
                                    {inv.products.map((p, idx) => (
                                        <li
                                            key={idx}
                                            className="flex justify-between text-gray-700 text-sm px-2"
                                        >
                                            <span className="flex-1 text-left">{p.name}</span>
                                            <span className="w-12 text-center">x{p.quantity}</span>
                                            <span className="w-20 text-center">{formatNumberCO(p.price_und)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}

            </Modal>

            {/* Modal estadísticas */}
            <Modal isOpen={showStatsModal} title="Estadísticas" onClose={() => setShowStatsModal(false)}>
                <StatsChart
                    onlineCount={sentInv.filter(i => i.bill?.status === 'Enviado').length}
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
