"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

interface AthkarProgressProps {
  completedCount: number;
  totalCount: number;
}

export function AthkarProgress({ completedCount, totalCount }: AthkarProgressProps) {
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <ListChecks size={24} className="mr-2 rtl:ml-2 rtl:mr-0 text-primary" />
            Daily Progress
          </CardTitle>
          <p className="text-sm font-medium text-primary">
            {completedCount} / {totalCount} Completed
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} aria-label={`${percentage.toFixed(0)}% completed`} className="w-full h-3" />
      </CardContent>
    </Card>
  );
}
