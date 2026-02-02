import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import {Button} from "@/components/ui/button";
import { MessageSquareText } from "lucide-react";

export default function Description() {

    return(
        <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
                <Button variant="ghost" size="icon"><MessageSquareText/> </Button>
            </DropdownMenuTrigger>
        </DropdownMenu>
    )
}