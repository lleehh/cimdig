import xml.etree.ElementTree as ET
import json
import sys

# This script converts a CIM XML file into three JSON files based on different key structures.
# Usage: python script.py <input_file.xml> <output_prefix>
# - <input_file.xml>: The XML file containing CIM data to be processed.
# - <output_prefix>: A prefix for the output JSON files.
#
# Output files:
# 1. <output_prefix>_by_id.json: JSON file using `rdf:ID` as keys.
# 2. <output_prefix>_by_type.json: JSON file using `rdfType` (namespace-prefixed type) as keys.
# 3. <output_prefix>_by_name.json: JSON file using `IdentifiedObject.name` as keys.

def parse_cim_xml_to_json(xml_string):
    ns = {
        'rdf': "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        'cim': "http://iec.ch/TC57/2013/CIM-schema-cim16#",
	'entsoe2' : "http://entsoe.eu/CIM/SchemaExtension/3/2#",
	'entsoe' : "http://entsoe.eu/CIM/SchemaExtension/3/1#",
	'icim' : "http://iec.ch/TC57/2013/CIM-schema-cim16-info#",
	'md' : "http://iec.ch/TC57/61970-552/ModelDescription/1#",
	'pti' : "http://www.pti-us.com/PTI_CIM-schema-cim16#",
    }
    
    root = ET.fromstring(xml_string)
    result_by_id = {}
    result_by_type = {}
    result_by_name = {}

    def get_prefixed_tag(tag):
        # Extract namespace and local tag, adding the prefix from the ns dictionary
        if '}' in tag:
            uri, local = tag[1:].split('}')
            for prefix, namespace in ns.items():
                if namespace == uri:
                    return f"{prefix}:{local}"
        return tag

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

    try:
        with open(input_file, 'r') as file:
            xml_data = file.read()

        result_by_id, result_by_type, result_by_name = parse_cim_xml_to_json(xml_data)

        with open(output_file_by_id, 'w') as file:
            json.dump(result_by_id, file, indent=4)

        with open(output_file_by_type, 'w') as file:
            json.dump(result_by_type, file, indent=4)

        with open(output_file_by_name, 'w') as file:
            json.dump(result_by_name, file, indent=4)

        print(f"JSON files created:\n- {output_file_by_id}\n- {output_file_by_type}\n- {output_file_by_name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

