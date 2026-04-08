'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, query, where, getDoc, DocumentData } from 'firebase/firestore';
import type { OrderItem, MenuItem, Employee, Table, Transaction } from './data';

// Generic function to convert Firestore doc to a specific type
function docToDataType<T>(document: DocumentData): T {
    const data = document.data();
    // Convert Firestore Timestamps to JS Date objects
    for (const key in data) {
        if (data[key] && typeof data[key].toDate === 'function') {
            data[key] = data[key].toDate();
        }
    }
    return { ...data, id: document.id } as T;
}


// Table Actions
export async function getTables() {
    const tablesCollection = collection(db, 'tables');
    const tableSnapshot = await getDocs(tablesCollection);
    const tablesList = tableSnapshot.docs.map(d => docToDataType<Table>(d));
    // Sort tables by name, assuming format "Mesa X"
    return tablesList.sort((a, b) => {
        const aNum = parseInt(a.name.split(' ')[1]);
        const bNum = parseInt(b.name.split(' ')[1]);
        return aNum - bNum;
    });
}

export async function getTableById(id: string) {
    const tableDocRef = doc(db, 'tables', id);
    const tableDoc = await getDoc(tableDocRef);
    if (tableDoc.exists()) {
        return docToDataType<Table>(tableDoc);
    }
    return undefined;
}

export async function addTable() {
    const tablesRef = collection(db, 'tables');
    const snapshot = await getDocs(tablesRef);
    const newTableNumber = snapshot.docs.length + 1;

    const newTable = {
        name: `Mesa ${newTableNumber}`,
        status: 'free' as const,
        order: [],
    };
    const docRef = await addDoc(tablesRef, newTable);
    revalidatePath('/waiter');
    return { success: true, newTable: { ...newTable, id: docRef.id } };
}

export async function deleteTable(tableId: string) {
    const tableDocRef = doc(db, 'tables', tableId);
    const tableDoc = await getDoc(tableDocRef);

    if (tableDoc.exists()) {
        const tableData = tableDoc.data() as Table;
        if (tableData.status !== 'free') {
            return { success: false, message: 'No se puede eliminar una mesa ocupada o reservada.' };
        }
        await deleteDoc(tableDocRef);
        revalidatePath('/waiter');
        revalidatePath('/cashier');
        return { success: true };
    }
    return { success: false, message: 'Mesa no encontrada.' };
}


// Order Actions
export async function updateOrder(tableId: string, newOrder: OrderItem[], waiterName?: string) {
  const tableDocRef = doc(db, 'tables', tableId);
  const table = await getDoc(tableDocRef);

  if (table.exists()) {
    const currentTableData = table.data() as Table;
    const updateData: Partial<Table> = {
        order: newOrder,
    };

    if (newOrder.length > 0) {
        updateData.status = 'occupied';
        
        // Determinar si hay artículos nuevos por cocinar
        const hasUnprocessedItems = newOrder.some(item => item.quantity > (item.processedQuantity || 0));
        
        if (hasUnprocessedItems) {
            updateData.orderStatus = 'cooking';
            // Si el pedido estaba vacío o era nuevo para cocina, actualizamos el timestamp
            if (currentTableData.order.length === 0 || currentTableData.orderStatus === 'ready') {
                updateData.orderTimestamp = new Date();
            }
        } else {
            // Si todo lo que queda ya estaba listo, mantenemos el estado ready
            updateData.orderStatus = currentTableData.orderStatus === 'ready' ? 'ready' : 'cooking';
        }
        
        if(waiterName) updateData.waiterName = waiterName;
    } else {
        updateData.status = 'free';
        updateData.waiterName = '';
        updateData.orderStatus = undefined;
        updateData.orderTimestamp = undefined;
    }

    await updateDoc(tableDocRef, updateData as any);
    revalidatePath('/', 'layout');
    return { success: true };
  }
  
  return { success: false, message: 'Table not found' };
}

export async function markOrderAsReady(tableId: string) {
    const tableDocRef = doc(db, 'tables', tableId);
    const table = await getDoc(tableDocRef);

    if (table.exists()) {
        const currentTableData = table.data() as Table;
        
        // Al marcar como listo, todas las cantidades actuales se consideran procesadas
        const processedOrder = currentTableData.order.map(item => ({
            ...item,
            processedQuantity: item.quantity
        }));

        await updateDoc(tableDocRef, {
            order: processedOrder,
            orderStatus: 'ready'
        });
        
        revalidatePath('/kitchen');
        revalidatePath('/waiter');
        return { success: true };
    }
    return { success: false, message: 'Mesa no encontrada.' };
}

// Payment Actions
export async function finalizePayment(tableId: string) {
    const tableDocRef = doc(db, 'tables', tableId);
     if ((await getDoc(tableDocRef)).exists()) {
        await updateDoc(tableDocRef, {
            order: [],
            status: 'free',
            waiterName: '',
            orderStatus: null,
            orderTimestamp: null
        });
        
        revalidatePath('/waiter');
        revalidatePath('/cashier');
        revalidatePath(`/cashier/table/${tableId}`);
        revalidatePath('/kitchen');
        
        return { success: true };
    }
    return { success: false, message: 'Table not found' };
}

export async function processPayment(tableId: string, paymentMethod: string) {
    const tableDocRef = doc(db, 'tables', tableId);
    const tableDoc = await getDoc(tableDocRef);

    if (tableDoc.exists()) {
        const table = docToDataType<Table>(tableDoc);
        if(table.order.length === 0) return { success: false, message: 'La orden está vacía' };
        
        const total = table.order.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const receiptDetails = {
            order: [...table.order],
            total: total,
            tableName: table.name
        };

        const newTransaction = {
            tableId: table.id,
            tableName: table.name,
            order: [...table.order],
            total,
            paymentMethod,
            timestamp: new Date(),
        };

        await addDoc(collection(db, 'transactions'), newTransaction);
        
        revalidatePath('/cashier/close-shift');
        revalidatePath('/admin/close-shift');
        return { success: true, receipt: receiptDetails };
    }
    return { success: false, message: 'Table not found or order is empty' };
}

export async function getTransactions() {
    const transactionsCollection = collection(db, 'transactions');
    const transactionSnapshot = await getDocs(transactionsCollection);
    return transactionSnapshot.docs.map(d => docToDataType<Transaction>(d));
}

export async function clearTransactions() {
    const transactionsCollection = collection(db, 'transactions');
    const transactionSnapshot = await getDocs(transactionsCollection);
    
    const batch = writeBatch(db);
    transactionSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    revalidatePath('/cashier/close-shift');
    revalidatePath('/admin/close-shift');
    return { success: true };
}


// Admin Actions - Menu
export async function getMenu() {
    const menuCollection = collection(db, 'menu');
    const menuSnapshot = await getDocs(menuCollection);
    return menuSnapshot.docs.map(d => docToDataType<MenuItem>(d));
}


export async function upsertMenuItem(data: Omit<MenuItem, 'id'> & { id?: string }) {
    let updatedMenuItem: MenuItem | undefined;

    if (data.id) {
        const menuItemDocRef = doc(db, 'menu', data.id);
        await updateDoc(menuItemDocRef, data as any);
        updatedMenuItem = { ...data, id: data.id } as MenuItem;
    } else {
        const docRef = await addDoc(collection(db, 'menu'), data);
        updatedMenuItem = { ...data, id: docRef.id } as MenuItem;
    }
    
    revalidatePath('/', 'layout');

    if (updatedMenuItem) {
        return { success: true, menuItem: updatedMenuItem };
    }

    return { success: false, message: 'No se pudo crear o encontrar el artículo.' };
}

export async function deleteMenuItem(itemId: string) {
    const menuItemDocRef = doc(db, 'menu', itemId);
    if((await getDoc(menuItemDocRef)).exists()){
        await deleteDoc(menuItemDocRef);
        revalidatePath('/', 'layout');
        return { success: true };
    }
    return { success: false, message: 'Artículo no encontrado.' };
}


// Admin Actions - Employees
export async function getEmployees() {
    const employeesCollection = collection(db, 'employees');
    const employeeSnapshot = await getDocs(employeesCollection);
    return employeeSnapshot.docs.map(d => docToDataType<Employee>(d));
}

export async function upsertEmployee(data: Omit<Employee, 'id'> & { id?: string }) {
    let updatedEmployee: Employee | undefined;

    if (data.id) {
        const employeeDocRef = doc(db, 'employees', data.id);
        await updateDoc(employeeDocRef, data as any);
        updatedEmployee = { ...data, id: data.id } as Employee;
    } else {
        const docRef = await addDoc(collection(db, 'employees'), data);
        updatedEmployee = { ...data, id: docRef.id } as Employee;
    }

    revalidatePath('/admin/employees');
    revalidatePath('/'); // For login form

    if (updatedEmployee) {
        return { success: true, employee: updatedEmployee };
    }

    return { success: false, message: 'No se pudo crear o encontrar el empleado.' };
}

export async function deleteEmployee(employeeId: string) {
    const employeeDocRef = doc(db, 'employees', employeeId);
     if((await getDoc(employeeDocRef)).exists()){
        await deleteDoc(employeeDocRef);
        revalidatePath('/admin/employees');
        revalidatePath('/'); // For login form
        return { success: true };
    }
    return { success: false, message: 'Empleado no encontrado.' };
}

export async function changeEmployeePin({ employeeId, oldPin, newPin }: { employeeId: string, oldPin: string, newPin:string }) {
    if (employeeId === 'admin') {
        return { success: false, message: 'El PIN del administrador no se puede cambiar desde aquí.' };
    }

    const employeeDocRef = doc(db, 'employees', employeeId);
    const employeeDoc = await getDoc(employeeDocRef);

    if (!employeeDoc.exists()) {
        return { success: false, message: 'Empleado no encontrado.' };
    }

    const employee = employeeDoc.data() as Employee;

    if (employee.pin !== oldPin) {
        return { success: false, message: 'El PIN actual es incorrecto.' };
    }

    await updateDoc(employeeDocRef, { pin: newPin });
    
    return { success: true };
}
