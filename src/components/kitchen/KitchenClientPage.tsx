"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData } from 'firebase/firestore';
import type { Table } from '@/lib/data';
import { OrderCard } from '@/components/kitchen/OrderCard';

// Función para convertir los datos de Firestore a nuestro tipo Table
function docToDataType<T>(id: string, data: DocumentData): T {
    const formattedData = { ...data };
    for (const key in formattedData) {
        if (formattedData[key] && typeof formattedData[key].toDate === 'function') {
            formattedData[key] = formattedData[key].toDate();
        }
    }
    return { ...formattedData, id } as T;
}

export function KitchenClientPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'tables'));
        
        // El "Listener" en tiempo real
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tablesList = snapshot.docs.map(doc => docToDataType<Table>(doc.id, doc.data()));
            setTables(tablesList);
            setLoading(false);
        }, (error) => {
            console.error("Error escuchando cambios en tablas:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const activeOrders = tables
        .filter(table => 
            table.status === 'occupied' && 
            (table.orderStatus === 'cooking' || table.orderStatus === 'preparing') && 
            table.order.length > 0
        )
        .sort((a, b) => {
            if (a.orderStatus === 'preparing' && b.orderStatus !== 'preparing') return -1;
            if (a.orderStatus !== 'preparing' && b.orderStatus === 'preparing') return 1;
            return (a.orderTimestamp?.getTime() ?? 0) - (b.orderTimestamp?.getTime() ?? 0);
        });

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <p className="text-muted-foreground animate-pulse">Cargando pedidos en tiempo real...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeOrders.length > 0 ? (
                activeOrders.map(table => (
                    <OrderCard key={table.id} table={table} />
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">¡Todo al día!</h3>
                    <p className="text-muted-foreground mt-2">No hay pedidos pendientes en este momento.</p>
                </div>
            )}
        </div>
    );
}
