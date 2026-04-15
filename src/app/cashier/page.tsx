import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { TablesGrid } from '@/components/TablesGrid';
import { Button } from '@/components/ui/button';
import { DoorClosed } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function CashierDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Gestión de Caja">
        <Button asChild variant="outline">
          <Link href="/cashier/close-shift">
            <DoorClosed className="mr-2 h-4 w-4" />
            Cierre de Caja
          </Link>
        </Button>
      </AppHeader>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
            <h2 className="text-2xl font-headline font-semibold">Mesas para Cobrar</h2>
            <p className="text-muted-foreground">Selecciona una mesa ocupada para procesar el pago.</p>
        </div>
        <TablesGrid role="cashier" />
      </main>
    </div>
  );
}
