"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, DocumentData } from 'firebase/firestore';
import type { Table } from '@/lib/data';
import { TableCard } from '@/components/TableCard';
import { AddTableCard } from '@/components/AddTableCard';

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

interface TablesGridProps {
    role: 'waiter' | 'cashier';
}

export function TablesGrid({ role }: TablesGridProps) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'tables'));
        
        // Listener en tiempo real para todas las mesas
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tablesList = snapshot.docs.map(doc => docToDataType<Table>(doc.id, doc.data()));
            
            // Ordenar mesas por número (ej: "Mesa 1", "Mesa 2")
            const sortedTables = tablesList.sort((a, b) => {
                const aNum = parseInt(a.name.split(' ')[1]) || 0;
                const bNum = parseInt(b.name.split(' ')[1]) || 0;
                return aNum - bNum;
            });
            
            setTables(sortedTables);
            setLoading(false);
        }, (error) => {
            console.error("Error escuchando cambios en mesas:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <p className="text-muted-foreground animate-pulse">Cargando mesas en tiempo real...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map(table => (
                <TableCard key={table.id} table={table} role={role} />
            ))}
            {role === 'waiter' && <AddTableCard />}
        </div>
    );
}
