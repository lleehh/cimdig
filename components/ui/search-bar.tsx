import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import React, {FormEvent, ReactEventHandler, useEffect, useState} from "react";
import {findById, getComponentById, searchByName, SearchResult} from "@/lib/store/model-repository";
import useFlowStore from "@/lib/store/store-flow";
import {createNode, createNodesAndEdges} from "@/lib/flow-utils";
import {ComponentIcon} from "@/components/component-icon";
import {Shell, Triangle} from "lucide-react";


export default function SearchBar() {
    const [isFocused, setIsFocused] = useState(false)
    const [input, setInput] = useState("")
    const [response, setResponse] = useState<SearchResult>([])

    const {setNodes, setEdges} = useFlowStore()

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const result = await searchByName(input);
                setResponse(result || []);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setResponse([]);
            }
        };
        fetchResults()
    }, [])

    const fetchComponent = async (id: string)=> {
        let equipment = await getComponentById(id)
        setIsFocused(false)
        if (equipment) {
            const {nodes, edges} = createNodesAndEdges(equipment)
            setNodes(nodes)
            setEdges(edges)
        }
    }

    return (
        <Command className="shadow-2xl">
            <CommandInput
                value={input}
                onValueChange={(value) => setInput(value)}
                onFocus={() => (setIsFocused(true))}
                onBlur={() => (setIsFocused(false))}
                placeholder="Search for components by name…" />
            <CommandList>
                {isFocused ?
                    response.map((item) => (
                        <CommandItem
                            key={item.id}
                            onSelect={() => fetchComponent(item.id)}
                            value={item.name}>
                            {(() => {
                                switch (item.rdfType) {
                                    case "cim:ACLineSegment":
                                        return <ComponentIcon icon="overforing" />
                                    case "cim:ConnectivityNode":
                                        return <Shell />
                                    default:
                                        return <Triangle />
                                }
                            })()}
                            {item.name}
                        </CommandItem>
                    ))
                    : <></>}
                {/*<CommandGroup heading="Suggestions">*/}
                {/*    /!*Maybe add recent searches here later:*!/*/}
                {/*    /!*<CommandItem>{response[0].name}</CommandItem>*!/*/}
                {/*    /!*<CommandItem>{response[1].name}</CommandItem>*!/*/}
                {/*    /!*<CommandItem>{response[2].name}</CommandItem>*!/*/}
                {/*</CommandGroup>*/}
            </CommandList>
        </Command>
        )
}
