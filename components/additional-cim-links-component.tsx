import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button"
import { List } from "lucide-react";

interface CimLinksProps {
    nameList: string[]
}

 export default function AdditionalCimLinks ({nameList}: CimLinksProps) {
     return (
         <DropdownMenu >
 
             <DropdownMenuTrigger asChild={true} className="border-solid">
                 <Button variant="ghost" size="icon"><List/></Button>
             </DropdownMenuTrigger>
 
             <DropdownMenuContent className="flex flex-col space-y-2">
                 <DropdownMenuLabel>Properties</DropdownMenuLabel>
                 <DropdownMenuSeparator/>
                 {nameList.map((item) => (
                     <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
                 ))}
             </DropdownMenuContent>
 
         </DropdownMenu>
     )
 }

