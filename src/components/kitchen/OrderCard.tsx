"use client";

import type { Table } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { markOrderAsReady, markOrderAsPreparing } from '@/lib/actions';
import { Check, User, Play } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  table: Table;
}

export function OrderCard({ table }: OrderCardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const isPreparing = table.orderStatus === 'preparing';

  // Solo mostramos los artículos que aún no han sido procesados (preparados)
  const itemsToPrepare = table.order.filter(item => {
    const quantityToMake = item.quantity - (item.processedQuantity || 0);
    return quantityToMake > 0;
  });

  const handleStartPreparing = () => {
    startTransition(async () => {
      const result = await markOrderAsPreparing(table.id);
      if (result.success) {
        toast({
          title: 'Preparación Iniciada',
          description: `Se ha marcado el pedido de la ${table.name} como "En preparación".`,
        });
      }
    });
  };

  const handleMarkAsReady = () => {
    startTransition(async () => {
      const result = await markOrderAsReady(table.id);
      if (result.success) {
        toast({
          title: 'Pedido Listo',
          description: `El pedido de la ${table.name} ha sido marcado como listo para servir.`,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  if (itemsToPrepare.length === 0) return null;

  return (
    <Card className={cn(
      "flex flex-col h-full bg-card transition-colors duration-500",
      isPreparing ? "border-blue-500/50 bg-blue-50/10" : "border-primary/20"
    )}>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-2xl">{table.name}</CardTitle>
            {table.orderTimestamp && (
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(table.orderTimestamp, { addSuffix: true, locale: es })}
                </span>
            )}
        </div>
        <div className="flex flex-col gap-1 mt-1">
            {table.waiterName && (
                <CardDescription className="flex items-center">
                    <User className="w-3 h-3 mr-1.5"/> {table.waiterName}
                </CardDescription>
            )}
            <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider w-fit px-1.5 py-0.5 rounded",
                isPreparing ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
            )}>
                {isPreparing ? "En preparación" : "Pendiente"}
            </span>
        </div>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent>
          <ul className="space-y-3">
            {itemsToPrepare.map(item => {
              const quantityToMake = item.quantity - (item.processedQuantity || 0);
              return (
                <li key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-lg">
                        {item.name} <span className="text-primary font-bold ml-1">x{quantityToMake}</span>
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 pl-2 border-l-2 border-amber-500/50 ml-1 mt-1">
                      {item.notes}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </ScrollArea>
      <CardFooter className="mt-auto pt-4 border-t gap-2">
        {!isPreparing ? (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStartPreparing} disabled={isPending}>
                <Play className="mr-2 h-4 w-4" />
                {isPending ? "Procesando..." : "Empezar"}
            </Button>
        ) : (
            <Button className="w-full" onClick={handleMarkAsReady} disabled={isPending}>
                <Check className="mr-2 h-4 w-4" />
                {isPending ? "Marcando..." : "Listo para Servir"}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
