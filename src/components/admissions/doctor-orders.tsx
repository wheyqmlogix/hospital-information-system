"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Stethoscope,
  Pill,
  Microscope,
  Send,
  Check,
  Zap
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

interface Order {
  id: string;
  type: "MEDICATION" | "LABORATORY" | "DIAGNOSTIC" | "PROCEDURE" | "DIET" | "ACTIVITY" | "DISPOSITION" | "OTHER";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DISCONTINUED";
  description: string;
  instructions?: string;
  createdAt: string;
  orderedBy: {
    firstName: string;
    lastName: string;
  };
  executedBy?: {
    firstName: string;
    lastName: string;
  } | null;
  executedAt?: string | null;
}

interface DoctorOrdersProps {
  admissionId: string;
}

export function DoctorOrders({ admissionId }: DoctorOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [newOrder, setNewOrder] = useState({
    type: "MEDICATION" as const,
    description: "",
    instructions: ""
  });
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/admissions/${admissionId}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [admissionId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.description.trim()) return;

    setIsOrdering(true);
    try {
      const res = await fetch(`/api/admissions/${admissionId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (res.ok) {
        setNewOrder({
          type: "MEDICATION",
          description: "",
          instructions: ""
        });
        fetchOrders();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsOrdering(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const getOrderIcon = (type: string) => {
    switch (type) {
      case "MEDICATION": return <Pill className="h-5 w-5" />;
      case "LABORATORY": return <Microscope className="h-5 w-5" />;
      case "DIAGNOSTIC": return <Zap className="h-5 w-5" />;
      default: return <Stethoscope className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <Protected permission="create_admissions">
        <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="w-full md:w-64 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Type</label>
                  <Select 
                    onValueChange={(val) => setNewOrder({ ...newOrder, type: val as any })} 
                    value={newOrder.type}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:border-blue-500 transition-all">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="MEDICATION">Medication</SelectItem>
                      <SelectItem value="LABORATORY">Laboratory</SelectItem>
                      <SelectItem value="DIAGNOSTIC">Diagnostic</SelectItem>
                      <SelectItem value="PROCEDURE">Procedure</SelectItem>
                      <SelectItem value="DIET">Diet</SelectItem>
                      <SelectItem value="ACTIVITY">Activity</SelectItem>
                      <SelectItem value="DISPOSITION">Disposition</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directive / Order Content</label>
                  <input
                    type="text"
                    value={newOrder.description}
                    onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg IV q4h PRN for fever > 38.5"
                    className="w-full h-14 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:border-blue-500 focus:ring-0 transition-all text-slate-900 font-bold"
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isOrdering || !newOrder.description.trim()}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 px-10 font-bold shadow-lg shadow-slate-200"
                >
                  Issue Order
                  <Send className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Protected>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-slate-100 before:rounded-full">
            <Card className={cn(
              "border-none shadow-sm rounded-3xl overflow-hidden bg-white transition-all",
              order.status === 'COMPLETED' ? "opacity-60" : "hover:border-blue-100 border border-transparent"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                      order.status === 'COMPLETED' ? "bg-slate-50 text-slate-400" : "bg-blue-50 text-blue-600"
                    )}>
                      {getOrderIcon(order.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest",
                          order.status === 'COMPLETED' ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700"
                        )}>
                          {order.status}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.type}</span>
                      </div>
                      <h4 className={cn(
                        "text-lg font-bold text-slate-900 leading-tight",
                        order.status === 'COMPLETED' && "line-through"
                      )}>
                        {order.description}
                      </h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Stethoscope className="h-3 w-3" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">
                            Dr. {order.orderedBy.lastName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status !== 'COMPLETED' && (
                      <Protected permission="add_clinical_notes">
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-9 px-4 font-bold shadow-md shadow-green-100"
                        >
                          <Check className="h-4 w-4 mr-1.5" />
                          Mark Executed
                        </Button>
                      </Protected>
                    )}
                    {order.status === 'COMPLETED' && (
                       <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 text-green-600">
                             <CheckCircle2 className="h-4 w-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Executed</span>
                          </div>
                          {order.executedBy && (
                            <p className="text-[8px] font-bold text-slate-400 uppercase">
                               By RN {order.executedBy.lastName} at {new Date(order.executedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                       </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {orders.length === 0 && !loading && (
          <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <div className="max-w-xs mx-auto opacity-20">
              <ClipboardList className="h-12 w-12 mx-auto mb-4" />
              <p className="font-bold text-slate-900 uppercase tracking-widest text-xs">No physician orders recorded.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
