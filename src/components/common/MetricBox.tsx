import {
  cn,
  formatLastUpdatedLive,
  formatMetricValue,
  formatSnakeCaseToTitle,
} from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
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

interface MetricBoxProps {
  metricLabel: string;
  metricData: { value: number; lastUpdated: Date };
  currentTime: Date;
}

const MetricBox = ({
  metricLabel,
  metricData,
  currentTime,
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
      className={cn(
        "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 rounded-lg flex-1 min-w-[200px]"
        // flashAnimationName
      )}
    >
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {formatSnakeCaseToTitle(metricLabel)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline gap-1 justify-center">
          <span
            className={cn(
              "text-4xl font-bold",
              "transition-colors",
              "duration-300"
            )}
            ref={valueRef}
          >
            {formatMetricValue(metricLabel, metricData.value)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end items-center p-0 pt-2">
        <Badge
          variant="secondary"
          className="text-xs bg-primary/10 text-primary border-primary/20 transition-colors"
        >
          {formatLastUpdatedLive(metricData.lastUpdated, currentTime)}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default MetricBox;
