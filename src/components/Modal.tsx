import type { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ isOpen, title, onClose, children }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-lg mt-10 overflow-auto">
                <header className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-2xl leading-none">&times;</button>
                </header>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
