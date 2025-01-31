import {findById} from "@/services/model-repository"
import {convertToCimObject} from "@/services/transform-cim-service";
import {ACLineSegment} from "@/models/cim";

jest.mock("fs/promises", () => ({
    readFile: jest.fn((filePath: string) => {
        const mockData: { [key: string]: string } = {
            "nordic44_cgm_37a_eq_by_id.json": JSON.stringify({
                "f1769b90-9aeb-11e5-91da-b8763fd99c5f": {
                    "rdfType": "cim:ACLineSegment",
                    "mRID": "f1769b90-9aeb-11e5-91da-b8763fd99c5f",
                    "cim:ACLineSegment.bch": "0.0003333333",
                    "cim:ACLineSegment.r": "22.5",
                    "cim:ACLineSegment.x": "180",
                    "cim:Conductor.length": "0",
                    "cim:ConductingEquipment.BaseVoltage": {
                        "rdfType": "cim:BaseVoltage",
                        "mRID": "2dd90169-bdfb-11e5-94fa-c8f73332c8f4",
                        "cim:BaseVoltage.nominalVoltage": "300",
                        "cim:IdentifiedObject.name": "300kV"
                    },
                    "cim:Equipment.aggregate": "false",
                    "cim:Equipment.normallyInService": "true",
                    "cim:IdentifiedObject.description": "3701 6700 '1 '",
                    "cim:IdentifiedObject.name": "300AJAURE-MO",
                    "cim:Equipment.EquipmentContainer": {
                        "rdfType": "cim:Line",
                        "mRID": "5e7d0b4c-fa65-1d40-aef6-779298018c7e",
                        "cim:Line.Region": {
                            "mRID": "f17695c3-9aeb-11e5-91da-b8763fd99c5f"
                        },
                        "cim:IdentifiedObject.name": "LC 300AJAURE-MO"
                    },
                    "items": [
                        {
                            "rdfType": "cim:OperatingShare",
                            "mRID": "2dd903ad-bdfb-11e5-94fa-c8f73332c8f4",
                            "cim:OperatingShare.OperatingParticipant": {
                                "mRID": "f17696de-9aeb-11e5-91da-b8763fd99c5f"
                            },
                            "cim:OperatingShare.PowerSystemResource": {
                                "mRID": "f1769b90-9aeb-11e5-91da-b8763fd99c5f"
                            },
                            "cim:OperatingShare.percentage": "100"
                        }
                    ],
                    "cim:ConductingEquipment.Terminals": [
                        {
                            "rdfType": "cim:Terminal",
                            "mRID": "2dd903ab-bdfb-11e5-94fa-c8f73332c8f4",
                            "cim:Terminal.ConductingEquipment": {
                                "mRID": "f1769b90-9aeb-11e5-91da-b8763fd99c5f"
                            },
                            "cim:Terminal.ConnectivityNode": {
                                "mRID": "f17695fd-9aeb-11e5-91da-b8763fd99c5f"
                            },
                            "cim:IdentifiedObject.name": "T1",
                            "cim:IdentifiedObject.description": "3701 6700 '1 '",
                            "cim:ACDCTerminal.sequenceNumber": "1"
                        },
                        {
                            "rdfType": "cim:Terminal",
                            "mRID": "2dd903ac-bdfb-11e5-94fa-c8f73332c8f4",
                            "cim:Terminal.ConductingEquipment": {
                                "mRID": "f1769b90-9aeb-11e5-91da-b8763fd99c5f"
                            },
                            "cim:Terminal.ConnectivityNode": {
                                "mRID": "f176969d-9aeb-11e5-91da-b8763fd99c5f"
                            },
                            "cim:IdentifiedObject.name": "T2",
                            "cim:IdentifiedObject.description": "3701 6700 '1 '",
                            "cim:ACDCTerminal.sequenceNumber": "2"
                        }
                    ]
                },
            }),
        };
        return Promise.resolve(mockData[filePath.split("/").pop() || ""]);
    }),
}));

describe("Data API", () => {

    it("should find a component by ID", async () => {
        const id = "f1769b90-9aeb-11e5-91da-b8763fd99c5f";

        const result = await findById(id);

        expect(result).toBeDefined();

        if (result != null) {
            const entity = convertToCimObject<ACLineSegment>(id, result)

            // Note that this is converted to a number
            expect(entity.bch).toEqual(0.0003333333);
            expect(entity.baseVoltage?.nominalVoltage).toEqual(300);
            expect(entity.terminals.length).toEqual(2);
            const terminal1 = entity.terminals.find(t => t.sequenceNumber === 1);
            const terminal2 = entity.terminals.find(t => t.sequenceNumber === 2);
            expect(terminal1).toBeDefined();
            expect(terminal2).toBeDefined();
        }

    });
})
