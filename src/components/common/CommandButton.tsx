import { useState, useCallback, memo } from "react";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Settings2 } from "lucide-react";
import type { Action } from "@/types/Action";
import type { CommandParam } from "@/constants/commands";
import type Command from "@/types/Command";

interface CommandButtonProps {
  label: string;
  action: Action;
  params?: CommandParam[];
  fixedParams?: Record<string, string | number>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null;
  classname?: string;
  onSendCommand: (command: Command) => void;
}

const CommandButton = memo(
  ({
    label,
    action,
    params,
    fixedParams,
    variant,
    classname,
    onSendCommand,
  }: CommandButtonProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [paramValues, setParamValues] = useState<
      Record<string, string | number>
    >(() => {
      // Initialize with default values
      const initial: Record<string, string | number> = {};
      params?.forEach((param) => {
        if (param.defaultValue !== undefined) {
          initial[param.name] = param.defaultValue;
        }
      });
      return initial;
    });

    const hasParams = params && params.length > 0;

    const handleParamChange = useCallback(
      (paramName: string, value: string | number) => {
        setParamValues((prev) => ({
          ...prev,
          [paramName]: value,
        }));
      },
      []
    );

    const buildCommand = useCallback((): Command => {
      // Start with an empty object to accumulate all params
      let allParams: Record<string, string | number> = {};

      // Add fixed params first (if any)
      if (fixedParams) {
        allParams = { ...fixedParams };
      }

      // Add configurable params from user input (if any)
      if (params && params.length > 0) {
        params.forEach((param) => {
          const value =
            paramValues[param.name] ??
            param.defaultValue ??
            (param.type === "number" ? 0 : "");
          allParams[param.name] =
            param.type === "number" ? Number(value) : String(value);
        });
      }

      // Determine how to return params based on what we have
      const totalParamCount = Object.keys(allParams).length;

      if (totalParamCount === 0) {
        // No params at all
        return { action, params: null };
      } else if (totalParamCount === 1) {
        // Single param - return just the value (not an object)
        const singleValue = allParams[Object.keys(allParams)[0]];
        return { action, params: singleValue };
      } else {
        // Multiple params - return as object
        return { action, params: allParams };
      }
    }, [action, params, fixedParams, paramValues]);

    const handleClick = useCallback(() => {
      onSendCommand(buildCommand());
    }, [buildCommand, onSendCommand]);

    // Simple button for commands without params
    if (!hasParams) {
      return (
        <Button
          variant={variant}
          onClick={handleClick}
          aria-label={`Send ${action} command`}
          className={`w-full transition-all ${classname ?? ""}`}
        >
          {label}
        </Button>
      );
    }

    // Expandable command with params using Collapsible
    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="w-full"
      >
        <div>
          {/* Main button row with integrated expand trigger */}
          <div className="flex gap-2">
            <Button
              variant={variant}
              onClick={handleClick}
              aria-label={`Send ${action} command`}
              className={`flex-1 transition-all ${classname ?? ""}`}
            >
              {label}
            </Button>

            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={`${
                  isExpanded ? "Hide" : "Show"
                } ${label} parameters`}
                className={`shrink-0 transition-all ${
                  isExpanded
                    ? "bg-accent/50 border-accent"
                    : "hover:bg-accent/30"
                }`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Parameters section */}
          <CollapsibleContent>
            <div className="rounded-lg border border-border/50 bg-accent/20 backdrop-blur-sm p-3 space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium border-b border-border/30 pb-2">
                <Settings2 className="h-3.5 w-3.5" />
                <span>Parameters</span>
              </div>

              {params.map((param) => (
                <div key={param.name} className="space-y-1.5">
                  <label
                    htmlFor={`${action}-${label}-${param.name}`}
                    className="text-xs font-semibold text-foreground/90 flex items-center gap-1"
                  >
                    {param.label}
                    {param.defaultValue !== undefined && (
                      <span className="text-[10px] font-normal text-muted-foreground">
                        (default: {param.defaultValue})
                      </span>
                    )}
                  </label>
                  <input
                    id={`${action}-${label}-${param.name}`}
                    type={param.type}
                    value={paramValues[param.name] ?? param.defaultValue ?? ""}
                    onChange={(e) =>
                      handleParamChange(
                        param.name,
                        param.type === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                    className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all shadow-sm hover:shadow-md"
                    placeholder={`Enter ${param.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }
);

export default CommandButton;
