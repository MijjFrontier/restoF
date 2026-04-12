"use client";

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bookmark, BookmarkX } from 'lucide-react';
import { toggleTableReservation } from '@/lib/actions';

interface ReserveTableButtonProps {
  tableId: string;
  isReserved: boolean;
  isEnabled: boolean;
}

export function ReserveTableButton({ tableId, isReserved, isEnabled }: ReserveTableButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startTransition(async () => {
      const result = await toggleTableReservation(tableId);
      if (result.success) {
        toast({
          title: result.newStatus === 'reserved' ? 'Mesa Reservada' : 'Reserva Cancelada',
          description: `El estado de la mesa ha sido actualizado.`,
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

  if (!isEnabled && !isReserved) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start text-blue-600 hover:bg-blue-50"
      disabled={isPending}
      onClick={handleToggle}
    >
      {isReserved ? (
        <>
          <BookmarkX className="mr-2 h-4 w-4" />
          {isPending ? 'Procesando...' : 'Quitar Reserva'}
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" />
          {isPending ? 'Procesando...' : 'Reservar Mesa'}
        </>
      )}
    </Button>
  );
}
