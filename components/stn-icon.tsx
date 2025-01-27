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

    return  `<svg xmlns="https://www.w3.org/2000/svg">${iconMeta.svg}</svg>`;
}