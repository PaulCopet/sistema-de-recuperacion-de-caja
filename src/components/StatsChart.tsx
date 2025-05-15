import { useEffect, useRef } from 'react';
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

    useEffect(() => {
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
    }, [props]);

    return <canvas ref={canvasRef} />;
}
