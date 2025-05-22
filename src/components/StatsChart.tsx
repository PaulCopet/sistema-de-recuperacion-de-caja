import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface Props {
    onlineCount: number;
    offlineCount: number;
    savedCount: number;
    onlineAmount: number;
    offlineAmount: number;
    savedAmount: number;
}

export default function StatsChart(props: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);
    const [activeTab, setActiveTab] = useState<'chart' | 'summary'>('chart');

    useEffect(() => {
        if (activeTab !== 'chart') return; // solo renderiza cuando se ve el canvas

        const ctx = canvasRef.current!.getContext('2d')!;
        if (chartRef.current) chartRef.current.destroy();

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Online', 'Offline Pendiente', 'Salvadas'],
                datasets: [
                    {
                        label: 'Cantidad',
                        data: [props.onlineCount, props.offlineCount, props.savedCount],
                        backgroundColor: ['rgba(0,70,173,0.7)', 'rgba(230,57,70,0.7)', 'rgba(42,157,143,0.7)']
                    },
                    {
                        label: 'Montos',
                        data: [props.onlineAmount, props.offlineAmount, props.savedAmount],
                        type: 'line',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }, [props, activeTab]);

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
            {/* Tabs */}
            <div className="flex border-b mb-4">
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'chart'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-blue-600'
                    }`}
                    onClick={() => setActiveTab('chart')}
                >
                    📈 Gráfico
                </button>
                <button
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'summary'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-blue-600'
                    }`}
                    onClick={() => setActiveTab('summary')}
                >
                    🧾 Resumen
                </button>
            </div>

            {/* Tab content */}
            <div>
                {activeTab === 'chart' && (
                    <div className="w-full overflow-x-auto">
                        <canvas ref={canvasRef} />
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="p-4 space-y-4">
                        <div className="grid gap-4">
                            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                <div>
                                    <p className="text-sm text-blue-700 font-semibold">Facturas Online</p>
                                    <p className="text-lg text-blue-900 font-bold">
                                        {props.onlineCount} facturas – ${props.onlineAmount.toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-2xl">🟢</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                                <div>
                                    <p className="text-sm text-red-700 font-semibold">Facturas Offline Pendientes</p>
                                    <p className="text-lg text-red-900 font-bold">
                                        {props.offlineCount} facturas – ${props.offlineAmount.toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-2xl">🔴</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                                <div>
                                    <p className="text-sm text-green-700 font-semibold">Facturas Salvadas</p>
                                    <p className="text-lg text-green-900 font-bold">
                                        {props.savedCount} facturas – ${props.savedAmount.toFixed(2)}
                                    </p>
                                </div>
                                <span className="text-2xl">🟢</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

