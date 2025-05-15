import React from 'react';
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

interface ModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ isOpen, title, onClose, children }: ModalProps) {
    const nodeRef = useRef<HTMLDivElement>(null);

    return (
        <CSSTransition
            in={isOpen}
            timeout={300}
            classNames="modal"
            unmountOnExit
            nodeRef={nodeRef}
        >
            <div
                ref={nodeRef}
                className="fixed inset-0 flex items-start justify-center p-4 modal-overlay"
            >
                <div className=" bg-white rounded-lg 
                w-full 
                max-w-lg 
                h-[80vh]
                overflow-hidden
                flex flex-col
                shadow-lg
                
                ">
                    <header className="flex justify-between items-center p-4">
                        <h3 className="text-2xl font-semibold">{title}</h3>
                        <button onClick={onClose} className="text-2xl leading-none">&times;</button>
                    </header>
                    <div className="p-4 flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </CSSTransition>
    );
}
