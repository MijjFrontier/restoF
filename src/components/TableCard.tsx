import Link from 'next/link';
import type { Table, TableStatus } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DeleteTableButton } from './DeleteTableButton';
import { User } from 'lucide-react';

type TableCardProps = {
  table: Table;
  role: 'waiter' | 'cashier' | 'kitchen';
};

type DisplayStatus = TableStatus | 'ready' | 'preparing';

const statusMap: Record<DisplayStatus, { text: string; className: string }> = {
  free: { text: 'Libre', className: 'bg-green-500/20 text-green-700 border-green-500/30' },
  occupied: { text: 'Ocupada', className: 'bg-orange-500/20 text-orange-700 border-orange-500/30' },
  reserved: { text: 'Reservada', className: 'bg-blue-500/20 text-blue-700 border-blue-500/30' },
  preparing: { text: 'En preparación', className: 'bg-blue-500/20 text-blue-700 border-blue-500/30 animate-pulse' },
  ready: { text: 'Listo', className: 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30 animate-bounce' },
};

export function TableCard({ table, role }: TableCardProps) {
  let effectiveStatus: DisplayStatus = table.order.length > 0 ? 'occupied' : table.status;
  let description = 'Toca para empezar un pedido';

  if (table.orderStatus === 'ready') {
    effectiveStatus = 'ready';
    description = 'Pedido listo para servir';
  } else if (table.orderStatus === 'preparing') {
    effectiveStatus = 'preparing';
    description = 'Cocina preparando el pedido';
  } else if (effectiveStatus === 'occupied') {
    description = `${table.order.length} artículo(s) en el pedido`;
  } else if (effectiveStatus === 'reserved') {
    description = 'Mesa reservada';
  }


  const isClickable = role === 'waiter' || (role === 'cashier' && table.order.length > 0);
  const LinkWrapper = isClickable ? Link : 'div';
  const linkProps = isClickable ? { href: `/${role}/table/${table.id}` } : {};

  return (
    <Card className={cn(
      "h-full transition-all duration-300 shadow-md flex flex-col",
      isClickable && "hover:shadow-lg hover:border-primary/50",
      !isClickable && "bg-muted/50 cursor-not-allowed"
    )}>
      <LinkWrapper {...linkProps} className="block flex-grow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className='flex-1'>
              <CardTitle className="font-headline text-2xl">{table.name}</CardTitle>
              <CardDescription className="pt-2">
                {description}
              </CardDescription>
            </div>
            <Badge variant="outline" className={cn("text-sm whitespace-nowrap", statusMap[effectiveStatus].className)}>
              {statusMap[effectiveStatus].text}
            </Badge>
          </div>
        </CardHeader>
      </LinkWrapper>
       {effectiveStatus !== 'free' && table.waiterName && (
         <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex items-center">
            <User className="w-4 h-4 mr-2" />
            Atendido por: {table.waiterName}
         </CardContent>
       )}
      {role === 'waiter' && (
        <CardFooter className="p-2 pt-0 mt-auto">
          <DeleteTableButton tableId={table.id} tableName={table.name} isEnabled={effectiveStatus === 'free'} />
        </CardFooter>
      )}
    </Card>
  );
}
