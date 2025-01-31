import xml.etree.ElementTree as ET
import json
import sys
import re

# This script converts a CIM XML file into three JSON files based on different key structures.
# Usage: python script.py <input_file.xml> <output_prefix>
# - <input_file.xml>: The XML file containing CIM data to be processed.
# - <output_prefix>: A prefix for the output JSON files.
#
# Output files:
# 1. <output_prefix>_by_id.json: JSON file using `rdf:ID` as keys.
# 2. <output_prefix>_by_name.json: JSON file using `IdentifiedObject.name` as keys.

ns = {
    'rdf': "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    'cim': "http://iec.ch/TC57/2013/CIM-schema-cim16#",
    'entsoe2': "http://entsoe.eu/CIM/SchemaExtension/3/2#",
    'entsoe': "http://entsoe.eu/CIM/SchemaExtension/3/1#",
    'icim': "http://iec.ch/TC57/2013/CIM-schema-cim16-info#",
    'md': "http://iec.ch/TC57/61970-552/ModelDescription/1#",
    'pti': "http://www.pti-us.com/PTI_CIM-schema-cim16#",
}

uuid_pattern = r"#_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"


def convert_sets_to_lists(obj):
    if isinstance(obj, set):
        return list(obj)
    elif isinstance(obj, dict):
        return {k: convert_sets_to_lists(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_sets_to_lists(i) for i in obj]
    else:
        return obj


def get_prefixed_tag(tag):
    # Extract namespace and local tag, adding the prefix from the ns dictionary
    if '}' in tag:
        uri, local = tag[1:].split('}')
        for prefix, namespace in ns.items():
            if namespace == uri:
                return f"{prefix}:{local}"
    return tag


def read_inverse_json(file):
    with open(file, 'r') as file:
        inverse_data = json.load(file)
        reverse_map = {}
        for (key, value) in inverse_data.items():
            key = key.replace("http://iec.ch/TC57/2013/CIM-schema-cim16#", "cim:")
            value = value.replace("http://iec.ch/TC57/2013/CIM-schema-cim16#", "cim:")
            reverse_map[key] = value
        return reverse_map


def get_name_from_element(element):
    for child in element:
        tag = get_prefixed_tag(child.tag)  # Use namespace prefix
        value = child.text
        if tag == "cim:IdentifiedObject.name":
            return child.text
    return None


def get_id_from_element(element):
    id = element.attrib.get(f"{{{ns['rdf']}}}ID") or element.attrib.get(f"{{{ns['rdf']}}}about") or element.attrib.get(f"{{{ns['rdf']}}}resource")
    if id:
        return id.lstrip("#_").lstrip("_")

def find_element_by_id(rdf_id, root):
    elements = []
    for element in root:
        for child in element:
            refId = child.attrib.get(f"{{{ns['rdf']}}}resource", None)
            if refId and refId.lstrip("#_") == rdf_id:
                elements.append(element)
    return elements


def resolve_revese_parameter(rdf_id, element, reverse_map):
    for child in element:
        tag = get_prefixed_tag(child.tag)
        ref = get_id_from_element(child)
        if ref == rdf_id and reverse_map.get(tag):
            reverse = reverse_map.get(tag)
            return reverse

def get_entity(top_rdf_id, element, root, reverse_map, stop):
    rdf_id = get_id_from_element(element)
    rdf_type = get_prefixed_tag(element.tag)  # Keep the namespace prefix
    properties = {"rdfType": rdf_type, "mRID": rdf_id}  # Add rdfType to properties

    for child in element:
        tag = get_prefixed_tag(child.tag)  # Use namespace prefix
        value = child.text or child.attrib.get(f"{{{ns['rdf']}}}resource", None)
        properties[tag] = value
        # We have a UUID, let's find the corresponding element
        if re.fullmatch(uuid_pattern, value):
            for other in root:
                if other.attrib.get(f"{{{ns['rdf']}}}ID") == value.lstrip("#"):
                    if stop:
                        properties[tag] = {"mRID": value.lstrip("#_")}
                    else:
                        properties[tag] = get_entity(top_rdf_id, other, root, reverse_map, True)
    # We have other elements that reference this one. We need to find them
    if not stop:
        items = find_element_by_id(rdf_id, root)
        if len(items):

            for item in items:
                reverse = resolve_revese_parameter(top_rdf_id, item, reverse_map)
                if reverse:
                    if reverse not in properties:
                        properties[reverse] = []
                    properties[reverse].append(get_entity(top_rdf_id, item, root, reverse_map, True))
                else:
                    if "items" not in properties:
                        properties["items"] = []
                    properties["items"].append(get_entity(top_rdf_id, item, root, reverse_map, True))
    return properties


def parse_cim_xml_to_json(xml_string, reverse_map: dict):
    root = ET.fromstring(xml_string)
    result_by_id = {}
    result_by_name = {}

    count = 0
    for element in root:
        count += 1
        if count % 100 == 0:
            print(f"Processed {count} elements...")
        rdf_id = get_id_from_element(element)
        name = get_name_from_element(element)
        result_by_id[rdf_id] = get_entity(rdf_id, element, root, reverse_map, False)
        result_by_name[name] = get_entity(rdf_id, element, root, reverse_map, True)
    return result_by_id, result_by_name


def parse_cim_xml_to_json_old(xml_string, reverse_map: dict):
    root = ET.fromstring(xml_string)
    result_by_id = {}
    result_by_type = {}
    result_by_name = {}

    for element in root:
        rdf_id = element.attrib.get(f"{{{ns['rdf']}}}ID")
        rdf_type = get_prefixed_tag(element.tag)  # Keep the namespace prefix
        properties = {"rdfType": rdf_type}  # Add rdfType to properties
        name = None

        for child in element:
            tag = get_prefixed_tag(child.tag)  # Use namespace prefix
            value = child.text or child.attrib.get(f"{{{ns['rdf']}}}resource", None)
            properties[tag] = value
            if tag == "cim:IdentifiedObject.name":
                name = value
            if re.fullmatch(uuid_pattern, value):
                for other in root:
                    if other.attrib.get(f"{{{ns['rdf']}}}ID") == value.lstrip("#"):
                        # properties[tag] = element.attrib.get(f"{{{ns['rdf']}}}ID")
                        print("Valid UUID format! ", tag, value)
                        properties[tag] = other.attrib.get(f"{{{ns['rdf']}}}ID")

        # Loops through root again, in order to find other element with matching rdf_id on field
        for item in root:
            rdf_id_item = item.attrib.get(f"{{{ns['rdf']}}}ID")
            tag_item = get_prefixed_tag(item.tag)
            propertiesChildren = {}
            for child in item:
                # If resource id matches the current element's rdf_id
                attribute = child.attrib.get(f"{{{ns['rdf']}}}resource")
                cleanAttribute = ""
                if attribute:
                    cleanAttribute = attribute.lstrip("#")
                if cleanAttribute == rdf_id:
                    propertiesChildren[rdf_id_item] = {}
                    propertiesChildren[rdf_id_item].update({"rdfType": tag_item})
                    for newBorn in item:
                        attributeTag = get_prefixed_tag(newBorn.tag)
                        value = newBorn.text or newBorn.attrib.get(f"{{{ns['rdf']}}}resource", None)
                        propertiesChildren[rdf_id_item][attributeTag] = value
                        if reverse_map.get(attributeTag):
                            if "rdfReverse" not in propertiesChildren[rdf_id_item]:
                                propertiesChildren[rdf_id_item]["rdfReverse"] = {}
                            reverse = reverse_map.get(attributeTag)
                            if value.replace("#", "") == rdf_id:
                                propertiesChildren[rdf_id_item]["rdfReverse"][reverse] = value
                        propertiesChildren[rdf_id_item][attributeTag] = value

                    if "items" not in properties:
                        properties["items"] = []
                    properties["items"].append(propertiesChildren)
            # Adds all the element information into properties, under "item" field

        if rdf_id:
            result_by_id[rdf_id] = properties
        if rdf_type:
            result_by_type.setdefault(rdf_type, []).append(properties)
        if name:
            result_by_name[name] = properties

    return result_by_id, result_by_type, result_by_name


def main():
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_file.xml> <output_prefix>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_prefix = sys.argv[2]

    output_file_by_id = f"{output_prefix}_by_id.json"
    output_file_by_type = f"{output_prefix}_by_type.json"
    output_file_by_name = f"{output_prefix}_by_name.json"

    reverse_map = read_inverse_json("inverse.json")

    try:
        with open(input_file, 'r') as file:
            xml_data = file.read()

        result_by_id, result_by_name = parse_cim_xml_to_json(xml_data, reverse_map)

        with open(output_file_by_id, 'w') as file:
            json.dump(result_by_id, file, indent=4)

        with open(output_file_by_name, 'w') as file:
            json.dump(result_by_name, file, indent=4)

        print(f"JSON files created:\n- {output_file_by_id}\n- {output_file_by_name}")
    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
