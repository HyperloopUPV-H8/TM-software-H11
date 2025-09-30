import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";

export default function WebhookViewer() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000/api/stream");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers((prev) => [data, ...prev]);
        }
      } catch (e) {
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-8">
      {users.length === 0 ? (
        <div className="text-gray-500">No users yet.</div>
      ) : (
        users.map((user, idx) => (
          <Card key={idx} className="p-4 w-64 shadow-md">
            <div className="font-bold text-lg mb-2">{user.name}</div>
            <div className="text-sm text-gray-700">{user.email}</div>
          </Card>
        ))
      )}
    </div>
  );
}
