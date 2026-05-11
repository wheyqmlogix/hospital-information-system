"use client";

import { useEffect, useState } from "react";

export default function ApiTest() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function test() {
      try {
        const res = await fetch("/api/admin/debug");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        } else {
          setError(json);
        }
      } catch (e: any) {
        setError({ message: e.message });
      }
    }
    test();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test: /api/admin/staff</h1>
      {data && (
        <pre className="bg-slate-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
          <p className="font-bold">Error:</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
