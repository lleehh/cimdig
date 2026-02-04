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
  description?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function Description({
  description,
  open,
  onOpenChange,
}: DescriptionProps) {
  const hasDescription = Boolean(description && description.trim().length > 0);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MessageSquareText />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <div className="w-[300px] rounded-xl border bg-card text-card-foreground shadow p-5">
          <DropdownMenuLabel>Description</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            {hasDescription
              ? description
              : "No description is available for this object."}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
