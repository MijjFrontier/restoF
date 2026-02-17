"use client";

import type { Table } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { markOrderAsReady } from '@/lib/actions';
import { Check, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderCardProps {
  table: Table;
}

export function OrderCard({ table }: OrderCardProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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

  return (
    <Card className="flex flex-col h-full bg-card">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-2xl">{table.name}</CardTitle>
            {table.orderTimestamp && (
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(table.orderTimestamp, { addSuffix: true, locale: es })}
                </span>
            )}
        </div>
        {table.waiterName && (
            <CardDescription className="flex items-center pt-1">
                <User className="w-3 h-3 mr-1.5"/> {table.waiterName}
            </CardDescription>
        )}
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent>
          <ul className="space-y-3">
            {table.order.map(item => (
              <li key={item.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{item.name} <span className="font-normal text-muted-foreground">x{item.quantity}</span></span>
                </div>
                {item.notes && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 pl-2 border-l-2 border-amber-500/50 ml-1 mt-1">
                    {item.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </ScrollArea>
      <CardFooter className="mt-auto">
        <Button className="w-full" onClick={handleMarkAsReady} disabled={isPending}>
            <Check className="mr-2 h-4 w-4" />
            {isPending ? "Marcando..." : "Marcar como Listo"}
        </Button>
      </CardFooter>
    </Card>
  );
}
