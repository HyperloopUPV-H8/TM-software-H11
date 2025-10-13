import { useCallback, useEffect, useRef, useState } from "react";
import {
  cn,
  formatLastUpdatedLive,
  formatMetricValue,
  formatSnakeCaseToTitle,
} from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  valueChangedAnimation,
  valueDecreaseAnimation,
  valueIncreaseAnimation,
} from "@/constants/animations";
import React from "react";

interface MetricBoxProps extends React.ComponentProps<"div"> {
  metricLabel: string;
  metricData: { value: number; lastUpdated: Date };
  currentTime: Date;
}

const MetricBox = ({
  metricLabel,
  metricData,
  currentTime,
  ...props
}: MetricBoxProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  const [previousValue, setPreviousValue] = useState<number | null>(null);

  const runFlashAnimation = useCallback(() => {
    cardRef.current?.animate(valueChangedAnimation, {
      duration: 1000,
      easing: "ease-out",
    });
  }, []);

  const runValueChangeAnimation = useCallback(() => {
    if (previousValue === null) {
      return;
    }

    if (metricData.value > previousValue) {
      valueRef.current?.animate(valueIncreaseAnimation, {
        duration: 1200,
        easing: "ease-out",
      });
    } else if (metricData.value < previousValue) {
      valueRef.current?.animate(valueDecreaseAnimation, {
        duration: 1200,
        easing: "ease-out",
      });
    }
  }, [metricData.value, previousValue]);

  useEffect(() => {
    // Execute flash animation
    runFlashAnimation();

    // Green and red color animation for increasing and decreasing value changes
    runValueChangeAnimation();

    // Update previous value
    setPreviousValue(metricData.value);

    return () => {
      setPreviousValue(null);
    };
  }, [metricData.value, runFlashAnimation, runValueChangeAnimation]);

  return (
    <Card
      ref={cardRef}
      aria-labelledby={`metric-title-${metricLabel}`}
      role="region"
      className={cn(
        "bg-gradient-to-br from-primary/5 ",
        "hover:shadow-lg transition-all duration-300",
        "h-full flex flex-col",
        props.className
      )}
      {...props}
    >
      <CardHeader className="pb-3">
        <CardTitle
          id={`metric-title-${metricLabel}`}
          className="text-sm text-muted-foreground uppercase tracking-wide"
        >
          {formatSnakeCaseToTitle(metricLabel)}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-center pb-3">
        <span
          className={cn(
            "text-4xl font-bold text-foreground",
            "transition-colors duration-300"
          )}
          ref={valueRef}
        >
          {formatMetricValue(metricLabel, metricData.value)}
        </span>
      </CardContent>

      <CardFooter className="pt-0 justify-end">
        <Badge variant="secondary" className="text-xs">
          {formatLastUpdatedLive(metricData.lastUpdated, currentTime)}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default MetricBox;
