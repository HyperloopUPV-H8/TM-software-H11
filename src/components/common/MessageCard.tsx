import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

import type MetricMessage from "@/types/MetricMessage";

interface MessageCardProps {
  message: MetricMessage;
  sequenceNumber: number;
}

const MessageCard = ({ message, sequenceNumber }: MessageCardProps) => {
  return (
    <Card className="border rounded-xl bg-gray-50 flex-auto py-3 shadow-md max-w-full lg:max-w-xl">
      <CardHeader className="flex justify-between items-center px-3">
        <Badge variant={"secondary"} className="text-xs">
          {new Date(message.timestamp).toLocaleString()}
        </Badge>
        <Badge variant={"outline"} className="text-xs">
          #{sequenceNumber}
        </Badge>
      </CardHeader>
      <CardContent className="text-left px-3">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(message, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default MessageCard;
