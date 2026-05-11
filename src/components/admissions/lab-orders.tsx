"use client";

import { useState, useEffect } from "react";
import { 
  Microscope, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FlaskConical,
  Beaker
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LabTest {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
}

interface LabOrder {
  id: string;
  orderNumber: string;
  test: LabTest;
  status: string;
  result?: string;
  createdAt: string;
}

interface LabOrdersProps {
  admissionId: string;
}

export function LabOrders({ admissionId }: LabOrdersProps) {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const fetchData = async () => {
    try {
      const [ordersRes, testsRes] = await Promise.all([
        fetch(`/api/admissions/${admissionId}/lab`),
        fetch("/api/lab")
      ]);
      if (ordersRes.ok) setOrders(await ordersRes.ok ? await ordersRes.json() : []);
      if (testsRes.ok) setTests(await testsRes.ok ? await testsRes.json() : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [admissionId]);

  const handleOrder = async () => {
    if (!selectedTestId) return;
    setIsOrdering(true);
    try {
      const res = await fetch(`/api/admissions/${admissionId}/lab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: selectedTestId }),
      });
      if (res.ok) {
        setSelectedTestId("");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
             <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Diagnostic Test</label>
                <Select onValueChange={setSelectedTestId} value={selectedTestId}>
                   <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:border-blue-500 transition-all">
                      <SelectValue placeholder="Search from test catalog..." />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl max-h-[300px]">
                      {tests.map((test) => (
                        <SelectItem key={test.id} value={test.id} className="focus:bg-slate-50 rounded-xl">
                           <div className="flex flex-col text-left py-1">
                              <span className="font-bold text-slate-900">{test.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{test.category} • PHP {test.price}</span>
                           </div>
                        </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </div>
             <Button 
               onClick={handleOrder}
               disabled={isOrdering || !selectedTestId}
               className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 px-10 font-bold shadow-lg shadow-blue-100"
             >
                Place Order
                <Plus className="h-5 w-5 ml-2" />
             </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white group hover:border-blue-100 border border-transparent transition-all">
             <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                   <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FlaskConical className="h-6 w-6" />
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                     order.status === 'PENDING' ? "bg-amber-100 text-amber-600" : 
                     order.status === 'COMPLETED' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                   )}>
                     {order.status}
                   </div>
                </div>
                <div>
                   <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">{order.test.name}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.test.category} • {order.orderNumber}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleString()}</span>
                   </div>
                   {order.status === 'PENDING' && (
                     <span className="text-[10px] font-bold text-amber-500 animate-pulse uppercase tracking-widest">Awaiting Sample</span>
                   )}
                </div>
             </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
             <div className="max-w-xs mx-auto opacity-20">
                <Beaker className="h-12 w-12 mx-auto mb-4" />
                <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">No active laboratory orders.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
