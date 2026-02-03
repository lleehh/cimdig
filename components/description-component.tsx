import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";

interface DescriptionProps {
  data?: Record<string, string>;
}

export default function Description({ data }: DescriptionProps) {
  const entries = Object.entries(data ?? {})
    .filter(([key, value]) => key !== "rdfId" && value != null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MessageSquareText />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <div className="w-[340px] rounded-xl border bg-card text-card-foreground shadow p-5">
          <DropdownMenuLabel>Description</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {entries.length === 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              No description available.
            </p>
          ) : (
            <dl className="mt-3 space-y-2 text-xs">
              {entries.map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="min-w-[110px] font-medium text-muted-foreground">
                    {key.replace(/([A-Z])/g, " $1")}
                  </dt>
                  <dd className="flex-1 break-words text-foreground">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}