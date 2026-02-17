import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewCardProps {
  title: string;
  value: number | string;
  loading?: boolean;
}

const OverviewCard = ({ title, value, loading = false }: OverviewCardProps) => {
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-2xl font-bold">{loading ? "…" : value}</span>
        </CardContent>
      </Card>
    </>
  );
};

export default OverviewCard;
