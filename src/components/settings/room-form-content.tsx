"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RoomFormContentProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RoomFormContent({ onSuccess, onCancel }: RoomFormContentProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const createRoomMutation = useMutation({
    mutationFn: async (newRoom: any) => {
      const res = await fetch("/api/rooms", {
        method: "POST",
        body: JSON.stringify(newRoom),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to create room");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room and beds created successfully.");
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create room");
    },
  });

  const handleCreateRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      roomNumber: formData.get("roomNumber"),
      type: formData.get("type"),
      floor: formData.get("floor"),
      bedsCount: parseInt(formData.get("bedsCount") as string),
    };

    createRoomMutation.mutate(data);
  };

  return (
    <form onSubmit={handleCreateRoom} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input id="roomNumber" name="roomNumber" placeholder="e.g. 101" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Floor</Label>
            <Input id="floor" name="floor" placeholder="e.g. 1st Floor" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="type">Room Type</Label>
          <Select name="type" defaultValue="PRIVATE">
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRIVATE">Private</SelectItem>
              <SelectItem value="SEMI-PRIVATE">Semi-Private</SelectItem>
              <SelectItem value="WARD">Ward</SelectItem>
              <SelectItem value="ICU">ICU</SelectItem>
              <SelectItem value="ER">Emergency Room</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedsCount">Number of Beds to Create</Label>
          <Input id="bedsCount" name="bedsCount" type="number" min="1" max="20" defaultValue="1" required />
          <p className="text-[10px] text-slate-400">Beds will be automatically named (e.g. 101-A, 101-B)</p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createRoomMutation.isPending} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          {createRoomMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Setup Room
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
