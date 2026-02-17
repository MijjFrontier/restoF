"use client";

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { changeEmployeePin } from '@/lib/actions';
import { KeyRound } from 'lucide-react';

const formSchema = z.object({
  oldPin: z.string().min(1, { message: "Debes ingresar tu PIN actual." }),
  newPin: z.string().min(4, { message: "El nuevo PIN debe tener al menos 4 dígitos." }).max(8, { message: "El nuevo PIN no puede tener más de 8 dígitos."}),
  confirmPin: z.string(),
}).refine(data => data.newPin === data.confirmPin, {
  message: "Los nuevos PINs no coinciden.",
  path: ["confirmPin"],
});

type ChangePinFormValues = z.infer<typeof formSchema>;

export function ChangePinDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // We only check for the employee ID when the dialog is opened
  // to avoid running localStorage on the server.
  useEffect(() => {
    if (open) {
      const id = localStorage.getItem('loggedInEmployeeId');
      setEmployeeId(id);
    }
  }, [open]);

  const form = useForm<ChangePinFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPin: '',
      newPin: '',
      confirmPin: '',
    },
  });

  const onSubmit = (values: ChangePinFormValues) => {
    if (!employeeId || employeeId === 'admin') {
        toast({ title: 'Error', description: 'No se puede cambiar el PIN para este usuario.', variant: 'destructive' });
        return;
    }

    startTransition(async () => {
      const result = await changeEmployeePin({
          employeeId: employeeId,
          oldPin: values.oldPin,
          newPin: values.newPin
      });
      if (result.success) {
        toast({
          title: `PIN Actualizado`,
          description: `Tu PIN se ha cambiado correctamente.`,
        });
        setOpen(false);
        form.reset();
      } else {
        toast({
          title: 'Error al cambiar PIN',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
            <KeyRound className="h-5 w-5" />
            <span className="sr-only">Cambiar PIN</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar PIN de Acceso</DialogTitle>
          <DialogDescription>
            Ingresa tu PIN actual y el nuevo PIN para actualizar tu acceso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="oldPin" className="text-right">
              PIN Actual
            </Label>
            <div className="col-span-3">
              <Input id="oldPin" type="password" {...form.register('oldPin')} />
              {form.formState.errors.oldPin && <p className="text-destructive text-xs mt-1">{form.formState.errors.oldPin.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newPin" className="text-right">
              Nuevo PIN
            </Label>
            <div className="col-span-3">
              <Input id="newPin" type="password" {...form.register('newPin')} />
              {form.formState.errors.newPin && <p className="text-destructive text-xs mt-1">{form.formState.errors.newPin.message}</p>}
            </div>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirmPin" className="text-right">
              Confirmar PIN
            </Label>
            <div className="col-span-3">
              <Input id="confirmPin" type="password" {...form.register('confirmPin')} />
              {form.formState.errors.confirmPin && <p className="text-destructive text-xs mt-1">{form.formState.errors.confirmPin.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
