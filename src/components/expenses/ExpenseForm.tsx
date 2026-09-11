import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpense } from '@/lib/api';
import { Expense } from '@/lib/types';

interface ExpenseFormProps {
  onClose?: () => void;
}

export function ExpenseForm({ onClose }: ExpenseFormProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation(createExpense, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      if (onClose) onClose();
    },
  });

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [recorrente, setRecorrente] = useState(false);
  const [frequencia, setFrequencia] = useState('1');
  const [totalParcelas, setTotalParcelas] = useState('1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNumber = parseFloat(valor.replace(',', '.')) * 100; // store as cents
    const payload: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 0, // backend will ignore / set from auth context
      descricao,
      valor: valorNumber,
      categoria,
      dataVencimento,
      dataPagamento: null,
      status: 'Pendente',
      recorrente: recorrente ? true : undefined,
      frequencia: recorrente ? parseInt(frequencia) : undefined,
      parcelaNumero: 1,
      totalParcelas: recorrente ? parseInt(totalParcelas) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mutation.mutate(payload as any);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Nova despesa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar nova despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descricao" className="text-right">
              Descrição
            </Label>
            <Input id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="valor" className="text-right">
              Valor (R$)
            </Label>
            <Input id="valor" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoria" className="text-right">
              Categoria
            </Label>
            <Input id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataVencimento" className="text-right">
              Vencimento
            </Label>
            <Input id="dataVencimento" type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} className="col-span-3" required />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="recorrente" checked={recorrente} onCheckedChange={(c) => setRecorrente(!!c)} />
            <Label htmlFor="recorrente">Parcelado</Label>
          </div>
          {recorrente && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequencia" className="text-right">
                  Frequência (meses)
                </Label>
                <Input id="frequencia" type="number" min="1" value={frequencia} onChange={(e) => setFrequencia(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalParcelas" className="text-right">
                  Total de parcelas
                </Label>
                <Input id="totalParcelas" type="number" min="1" value={totalParcelas} onChange={(e) => setTotalParcelas(e.target.value)} className="col-span-3" required />
              </div>
            </>
          )}
          <DialogFooter>
            <Button type="submit" disabled={mutation.isLoading}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
