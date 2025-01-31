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

const dropdownList = [
    {id: 1, name: "BaseVoltage"},
    {id: 2, name: "EquipmentContainer"},
    {id: 3, name: "ConductingEquipment"},
    {id: 4, name: "OperatingShare"},
    
]

 export default function AdditionalCimLinks () {
     return (
         <DropdownMenu >
 
             <DropdownMenuTrigger asChild={true} className="border-solid">
                 <Button variant="ghost" size="icon"><List/></Button>
             </DropdownMenuTrigger>
 
             <DropdownMenuContent className="flex flex-col space-y-2">
                 <DropdownMenuLabel>Properties</DropdownMenuLabel>
                 <DropdownMenuSeparator/>
                 {dropdownList.map((item) => (
                     <DropdownMenuItem key={item.id}>{item.name}</DropdownMenuItem>
                 ))}
             </DropdownMenuContent>
 
         </DropdownMenu>
     )
 }

