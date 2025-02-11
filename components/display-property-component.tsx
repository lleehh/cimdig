import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import { Info } from "lucide-react";

export default function DisplayProperty({ data }: { data: Record<string, String>}) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true} className="border-solid">
          <Button variant="ghost" size="icon"><Info/></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className="w-max h-max rounded-xl border bg-card text-card-foreground shadow p-5">
            <DropdownMenuLabel>Properties</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <ul className="space-y-2">
              {Object.entries(data)
              .filter(([key]) => key !== 'rdfId')
              .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
              .map(([key, value]) => (
                  <li key={key} className="flex">
                      <span className="text-gray-600 font-medium w-max pr-2 text-xs">{key}:</span>
                      <span className="text-gray-800 flex-1 text-xs">{value}</span>
                  </li>
              ))}
            </ul>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
} 