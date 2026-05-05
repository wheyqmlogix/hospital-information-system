import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <ShieldAlert className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 max-w-md mb-8">
        Your account does not have the required permissions to access this clinical module. 
        Please contact your Department Head or IT Administrator if you believe this is an error.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Button className="bg-blue-600 hover:bg-blue-700">Request Access</Button>
      </div>
    </div>
  );
}
