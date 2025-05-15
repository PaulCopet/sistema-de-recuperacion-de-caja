// src/components/Notification.tsx
import { useEffect, useState } from 'react';

export interface NotificationData {
    id: number;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

interface Props {
    notif: NotificationData;
    onDone: (id: number) => void;
}

export default function Notification({ notif, onDone }: Props) {
    const [visible, setVisible] = useState(true);

    // Auto-dismiss después de 4s
    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    // Cuando termina la animación de salida, notificamos al padre para removerla
    const handleAnimationEnd = () => {
        if (!visible) {
            onDone(notif.id);
        }
    };

    const bgClass =
        notif.type === 'success' ? 'bg-green-500 text-white' :
            notif.type === 'error' ? 'bg-red-500 text-white' :
                notif.type === 'warning' ? 'bg-yellow-400 text-black' :
                    'bg-blue-500';

    return (
        <div
            className={`
        notification ${bgClass} rounded-2xl text-shadow-2xs text-[1.1rem] shadow p-4 mb-2
        flex items-center justify-between
        animate-slide-in
        ${visible ? '' : 'fade-out'}
        `}
            onAnimationEnd={handleAnimationEnd}
        >
            <span>{notif.message}</span>
            <button
                className="ml-4 font-bold text-xl leading-none focus:outline-none"
                onClick={() => setVisible(false)}
                aria-label="Cerrar notificación"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    );
}
