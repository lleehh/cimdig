import React, {
  FormEvent,
  ReactEventHandler,
  useEffect,
  useState,
} from "react";
import {
  findById,
  getComponentById,
  searchByName,
  SearchResult,
} from "@/lib/store/model-repository";
import useFlowStore from "@/lib/store/store-flow";
import { createNode, createNodesAndEdges } from "@/lib/flow-utils";
import { ComponentIcon } from "@/components/component-icon";
import {
  Factory,
  HousePlug,
  LandPlot,
  Shell,
  SquareTerminal,
  Triangle,
} from "lucide-react";
import { useDebounce } from "use-debounce";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Item } from "@radix-ui/react-dropdown-menu";

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

export default function SearchBar() {
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<SearchResult>([]);
  const [debouncedInput] = useDebounce(input, 200);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [animationParent] = useAutoAnimate({
    duration: 100,
    enabled: !prefersReducedMotion,
  });

  const { setNodes, setEdges } = useFlowStore();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const result = await searchByName(
          debouncedInput.toString().toLowerCase(),
        );
        setResponse(result || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResponse([]);
      }
    };
    fetchResults();
  }, [debouncedInput]);

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
  function iconLogic(item) {
    return (() => {
      switch (item.rdfType) {
        case "cim:ACLineSegment":
          return <ComponentIcon icon="ledningssegment" />;
        case "cim:ConnectivityNode":
          return <Shell />;
        case "cim:Terminal":
          return <SquareTerminal />;
        case "cim:NonConformLoad":
          return <Factory />;
        case "cim:Line":
          return <ComponentIcon icon="overforing" />;
        case "cim:Bay":
          return <LandPlot />;
        case "cim:Breaker":
          return <ComponentIcon icon="bryter" />;
        case "cim:BusbarSection":
          return <ComponentIcon icon="samleskinne" />;
        case "cim:ConformLoad":
          return <HousePlug />;
        case "cim:GeneratingUnit":
          return <ComponentIcon icon="generator" />;
        case "cim:PowerTransformer":
          return <ComponentIcon icon="transformator" />;
        case "cim:Substation":
          return <ComponentIcon icon="stasjon" />;
        default:
          return <Triangle />;
      }
    })();
  }
  return (
    <div ref={animationParent} className="shadow-2xl rounded-md bg-white">
      <input
        className="w-full h-12 p-4 focus:outline-none rounded-2xl"
        onChange={(e) => setInput(e.target.value)}
        value={input}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 250)}
        placeholder="Search for components by name…"
      />
      {isFocused && (
        <ul className="p-2 max-h-96 overflow-y-scroll rounded-b-md border-none shadow-2xl">
          {response.length === 0 ? (
            <li>no results found</li>
          ) : (
            response.map((item) => (
              <article
                className="w-full h-10 gap-3 bg-white flex flex-row hover:bg-neutral-100 hover:cursor-pointer hover: p-2 rounded-lg"
                key={item.id}
                onClick={() => fetchComponent(item.id)}
              >
                {iconLogic(item)}
                {item.name}
              </article>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
