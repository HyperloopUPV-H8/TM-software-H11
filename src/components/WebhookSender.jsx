import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useToast } from "./ui/use-toast";

export default function WebhookSender(){
  const [command, setCommand] = useState("");
  const { toast } = useToast();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error("Error in the request");
      }

      const data = await response.json();

      toast({
        title: "Command sent successfully",
        description: `Backend response: ${data.status}`,
        variant: "default",
      });

      setCommand("");

    } catch (error) {
      console.error("Error sending command:", error);
      toast({
        title: "Error sending command",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[350px] mx-auto mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">Send Command</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="e.g. launch"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};


