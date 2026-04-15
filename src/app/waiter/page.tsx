import { AppHeader } from '@/components/AppHeader';
import { TablesGrid } from '@/components/TablesGrid';

export const dynamic = 'force-dynamic';

export default function WaiterDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Gestión de Mesas - Camarero" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <TablesGrid role="waiter" />
      </main>
    </div>
  );
}
