import {outlineMediumIcons} from './icon-list';
import {TriangleAlert} from "lucide-react";


interface DigIconProps {
    name: string;

}


// icons should come from a constant file.
export default function DigIcon({name}: DigIconProps) {

    const iconMeta = outlineMediumIcons.find(x => x.name === name);

    if (!iconMeta) {
        return <TriangleAlert/>;
    }

    return `<svg xmlns="https://www.w3.org/2000/svg">${iconMeta.svg}</svg>`;
}

interface IconComponentProps {
    icon: string;
    size?: number; // Optional: Control the size of the icon
    color?: string; // Optional: Control the color of the icon
    className?: string; // Optional: Additional styling classes
}

export function ComponentIcon({
                                  icon,
                                  size,
                                  color,
                                  className
                              }: IconComponentProps) {

    const iconMeta = outlineMediumIcons.find(iconMeta => iconMeta.name === icon);

    if (!iconMeta) {
        return <TriangleAlert/>;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width={size || 24}
            height={size || 24}
            fill={iconMeta.svgType === "fill" ? (color || "currentColor") : "none"}
            stroke={iconMeta.svgType === "stroke" ? (color || "currentColor") : "none"}
            strokeWidth={iconMeta.svgType === "stroke" ? 2 : ""}
            className={className ? className : ""}
            dangerouslySetInnerHTML={{"__html": iconMeta.svg}} // Render the SVG path
        />
    );
};