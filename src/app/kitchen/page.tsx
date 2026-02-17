import { AppHeader } from '@/components/AppHeader';
import { getTables } from '@/lib/actions';
import { OrderCard } from '@/components/kitchen/OrderCard';

export const dynamic = 'force-dynamic';

export default async function KitchenDashboard() {
  const allTables = await getTables();

  const activeOrders = allTables
    .filter(table => table.status === 'occupied' && table.orderStatus === 'cooking' && table.order.length > 0)
    .sort((a, b) => (a.orderTimestamp?.getTime() ?? 0) - (b.orderTimestamp?.getTime() ?? 0));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Gestión de Cocina" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h2 className="text-2xl font-headline font-semibold">Pedidos Pendientes</h2>
            <p className="text-muted-foreground">Pedidos recibidos que necesitan preparación.</p>
        </div>
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeOrders.map(table => (
              <OrderCard key={table.id} table={table} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">¡Todo al día!</h3>
            <p className="text-muted-foreground mt-2">No hay pedidos pendientes en este momento.</p>
          </div>
        )}
      </main>
    </div>
  );
}
