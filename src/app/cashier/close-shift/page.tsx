import { CloseShiftClientPage } from '@/components/cashier/CloseShiftClientPage';
import { getTransactions, getTables } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function CloseShiftPage() {
  const currentTransactions = await getTransactions();
  const allTables = await getTables();
  
  // Contamos las mesas que están ocupadas o tienen pedidos activos
  const occupiedTablesCount = allTables.filter(t => t.status === 'occupied' || t.order.length > 0).length;

  return (
    <div className="min-h-screen bg-background">
      <CloseShiftClientPage 
        transactions={currentTransactions} 
        occupiedTablesCount={occupiedTablesCount} 
      />
    </div>
  );
}
