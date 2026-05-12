"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  FlaskConical,
  Beaker,
  FileEdit,
  TestTube2,
  Dna
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
import { Protected } from "@/components/auth/protected";
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
  const [editingResult, setEditingResult] = useState<{ id: string, text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, testsRes] = await Promise.all([
        fetch(`/api/admissions/${admissionId}/lab`),
        fetch("/api/lab")
      ]);
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data);
      }
      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [admissionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const updateStatus = async (orderId: string, status: string, result?: string) => {
    try {
      const res = await fetch(`/api/lab/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, result }),
      });
      if (res.ok) {
        setEditingResult(null);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <Protected permission="create_lab_orders">
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
      </Protected>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white group hover:border-blue-100 border border-transparent transition-all">
             <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FlaskConical className="h-6 w-6" />
                   </div>
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                     order.status === 'PENDING' ? "bg-amber-100 text-amber-600" : 
                     order.status === 'COLLECTED' ? "bg-blue-100 text-blue-600" : 
                     order.status === 'PROCESSING' ? "bg-purple-100 text-purple-600" : 
                     order.status === 'COMPLETED' ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"
                   )}>
                     {order.status}
                   </div>
                </div>
                <div>
                   <h4 className="text-xl font-bold text-slate-900 leading-tight mb-1">{order.test.name}</h4>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.test.category} • {order.orderNumber}</p>
                </div>

                {order.status === 'COMPLETED' && order.result && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        Final Result
                     </p>
                     <p className="text-sm font-bold text-slate-900 whitespace-pre-wrap">{order.result}</p>
                  </div>
                )}

                {editingResult?.id === order.id && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                     <textarea
                       className="w-full h-32 rounded-2xl border-2 border-slate-100 p-4 focus:border-blue-500 focus:ring-0 text-sm font-medium transition-all"
                       placeholder="Enter quantitative or qualitative results..."
                       value={editingResult.text}
                       onChange={(e) => setEditingResult({ ...editingResult, text: e.target.value })}
                     />
                     <div className="flex gap-2">
                        <Button 
                          onClick={() => updateStatus(order.id, 'COMPLETED', editingResult.text)}
                          disabled={!editingResult.text}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold h-10"
                        >
                           Submit & Release
                        </Button>
                        <Button 
                          variant="ghost"
                          onClick={() => setEditingResult(null)}
                          className="text-slate-400 font-bold"
                        >
                           Cancel
                        </Button>
                     </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{new Date(order.createdAt).toLocaleString()}</span>
                   </div>
                   
                   <Protected permission="manage_lab_results">
                      <div className="flex items-center gap-2">
                         {order.status === 'PENDING' && (
                           <Button 
                             size="sm" 
                             onClick={() => updateStatus(order.id, 'COLLECTED')}
                             className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-none rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                           >
                              <TestTube2 className="h-3 w-3 mr-1.5" />
                              Collect Sample
                           </Button>
                         )}
                         {order.status === 'COLLECTED' && (
                           <Button 
                             size="sm" 
                             onClick={() => updateStatus(order.id, 'PROCESSING')}
                             className="bg-purple-50 hover:bg-purple-100 text-purple-600 border-none rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                           >
                              <Dna className="h-3 w-3 mr-1.5" />
                              Run Test
                           </Button>
                         )}
                         {order.status === 'PROCESSING' && !editingResult && (
                           <Button 
                             size="sm" 
                             onClick={() => setEditingResult({ id: order.id, text: '' })}
                             className="bg-green-50 hover:bg-green-100 text-green-600 border-none rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest"
                           >
                              <FileEdit className="h-3 w-3 mr-1.5" />
                              Enter Result
                           </Button>
                         )}
                      </div>
                   </Protected>
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
