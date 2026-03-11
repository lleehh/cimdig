import React, { useEffect, useState } from "react";
import { getComponentById, searchByName, SearchResult } from "@/lib/store/model-repository";
import useFlowStore from "@/lib/store/store-flow";
import { createNodesAndEdges } from "@/lib/flow-utils";
import { useDebounce } from "use-debounce";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { cimPresentationMap } from "@/lib/cim-presentation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ALL_TYPES = "all";

const searchableTypes = Object.keys(cimPresentationMap).map((key) => ({
    value: key,
    label: key.replace("cim:", ""),
}));

export default function SearchBar() {
    const [isFocused, setIsFocused] = useState(false);
    const [input, setInput] = useState("");
    const [selectedType, setSelectedType] = useState<string>(ALL_TYPES);
    const [response, setResponse] = useState<SearchResult>([]);
    const [debouncedInput] = useDebounce(input, 200);
    const [animationParent] = useAutoAnimate({ duration: 100 });

    const { setNodes, setEdges } = useFlowStore();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const typeFilter = selectedType === ALL_TYPES ? undefined : selectedType;
                const result = await searchByName(
                    debouncedInput.toString().toLowerCase(),
                    typeFilter
                );
                setResponse(result || []);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setResponse([]);
            }
        };
        fetchResults();
    }, [debouncedInput, selectedType]);

    const fetchComponent = async (id: string) => {
        if (!id) {
            console.error("No id found");
        }
        let equipment = await getComponentById(id);
        setIsFocused(false);
        if (equipment) {
            const { nodes, edges } = createNodesAndEdges(equipment);
            setNodes(nodes);
            setEdges(edges);
        }
    };

    return (
        <div ref={animationParent} className="shadow-2xl rounded-md bg-white">
            <div className="flex items-center gap-2 p-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-[200px] h-10 shrink-0 border-none shadow-none bg-neutral-50">
                        <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_TYPES}>All types</SelectItem>
                        {searchableTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                <span className="flex items-center gap-2">
                                    {cimPresentationMap[type.value]?.icon}
                                    {type.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <input
                    className="flex-1 h-10 px-2 focus:outline-none rounded-md"
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                    placeholder="Search for components by name..."
                />
            </div>
            {isFocused && (
                <ul className="p-2 max-h-96 overflow-y-scroll rounded-b-md border-none shadow-2xl">
                    {response.length === 0 ? (
                        <li className="p-2 text-neutral-500">No results found</li>
                    ) : (
                        response.map((item) => (
                            <article
                                className="w-full h-10 gap-3 bg-white flex flex-row items-center hover:bg-neutral-100 hover:cursor-pointer p-2 rounded-lg"
                                key={item.id}
                                onClick={() => fetchComponent(item.id)}
                            >
                                {cimPresentationMap[item.rdfType]?.icon}
                                {item.name}
                            </article>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
