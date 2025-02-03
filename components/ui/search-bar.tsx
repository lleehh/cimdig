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
import {searchByName, SearchResult} from "@/services/model-repository";


export default function SearchBar() {
    const [isSelected, setIsSelected] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const [input, setInput] = useState("")
    const [response, setResponse] = useState<SearchResult>([])

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
    }, [input])

    return (
        <Command className={'shadow-2xl'}>
            <CommandInput
                value={input}
                onValueChange={(value) => setInput(value)}
                onFocus={() => (setIsFocused(true))}
                onBlur={() => (setIsFocused(false))}
                placeholder="Search for components by name…" />
            <CommandList>
                {isFocused ?
                    response.map((item) => (
                        <CommandItem key={item.id}>{item.name}</CommandItem>
                    ))
                    : <></>}
                <CommandGroup heading="Suggestions">
                    {/*Maybe add recent searches here later:*/}

                    {/*<CommandItem>{response[0].name}</CommandItem>*/}
                    {/*<CommandItem>{response[1].name}</CommandItem>*/}
                    {/*<CommandItem>{response[2].name}</CommandItem>*/}
                </CommandGroup>
            </CommandList>
        </Command>
        )
}
