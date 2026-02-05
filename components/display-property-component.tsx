import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function DisplayProperty({
    data,
    open,
    onOpenChange,
}: {
    data: Record<string, String>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Info />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                <DropdownMenuLabel>Properties</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ul className="space-y-2">
                    {Object.entries(data)
                        .filter(([key]) => key !== "rdfId")
                        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                        .map(([key, value]) => (
                            <li key={key} className="flex">
                                <span className="text-gray-600 font-medium w-max pr-2 text-xs">
                                    {key}:
                                </span>
                                <span className="text-gray-800 flex-1 text-xs">{value}</span>
                            </li>
                        ))}
                </ul>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
