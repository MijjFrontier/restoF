import { AppHeader } from '@/components/AppHeader';
import { KitchenClientPage } from '@/components/kitchen/KitchenClientPage';

export const dynamic = 'force-dynamic';

export default function KitchenDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Gestión de Cocina" />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h2 className="text-2xl font-headline font-semibold">Pedidos Pendientes</h2>
            <p className="text-muted-foreground">Pedidos recibidos en tiempo real que necesitan preparación.</p>
        </div>
        <KitchenClientPage />
      </main>
    </div>
  );
}
