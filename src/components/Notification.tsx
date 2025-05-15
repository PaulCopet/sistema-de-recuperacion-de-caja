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

    const bg =
        notif.type === 'success' ? 'bg-green-500' :
            notif.type === 'error' ? 'bg-red-500' :
                notif.type === 'warning' ? 'bg-yellow-400 text-black' :
                    'bg-blue-500';

    return (
        <div
            className={`
        notification ${bg} text-white p-4 rounded shadow mb-2
        animate-slide-in
        ${visible ? '' : 'fade-out'}
      `}
            onAnimationEnd={handleAnimationEnd}
        >
            <button
                className="close-btn text-white bg-amber-50 h-full"
                onClick={() => setVisible(false)}
                aria-label="Cerrar notificación"
            >
                &times;
            </button>
            {notif.message}
        </div>
    );
}
