import {findById, findByType, findByName} from "@/services/model-repository"

jest.mock("fs/promises", () => ({
    readFile: jest.fn((filePath: string) => {
        const mockData: { [key: string]: string } = {
            "nordic44_cgm_37a_eq_by_id.json": JSON.stringify({
                "_f1769b90-9aeb-11e5-91da-b8763fd99c5f": {
                    rdfType: "cim:ACLineSegment",
                    "cim:ACLineSegment.bch": "0.0003333333",
                },
            }),
            "nordic44_cgm_37a_eq_by_type.json": JSON.stringify({
                "cim:ACLineSegment": [
                    {rdfType: "cim:ACLineSegment", "cim:ACLineSegment.bch": "0.0003333333"},
                ],
            }),
            "nordic44_cgm_37a_eq_by_name.json": JSON.stringify({
                "300AJAURE-MO": {
                    rdfType: "cim:ACLineSegment",
                    "cim:ACLineSegment.bch": "0.0003333333",
                },
            }),
        };
        return Promise.resolve(mockData[filePath.split("/").pop() || ""]);
    }),
}));

describe("Data API", () => {
    it("should find a component by ID", async () => {
        const result = await findById("_f1769b90-9aeb-11e5-91da-b8763fd99c5f");
        expect(result).toEqual({
            rdfType: "cim:ACLineSegment",
            "cim:ACLineSegment.bch": "0.0003333333",
        });
    });

    it("should return null for an unknown ID", async () => {
        const result = await findById("unknown_id");
        expect(result).toBeNull();
    });

    it("should find components by type", async () => {
        const result = await findByType("cim:ACLineSegment");
        expect(result).toEqual([
            {rdfType: "cim:ACLineSegment", "cim:ACLineSegment.bch": "0.0003333333"},
        ]);
    });

    it("should find a component by name", async () => {
        const result = await findByName("300AJAURE-MO");
        expect(result).toEqual({
            rdfType: "cim:ACLineSegment",
            "cim:ACLineSegment.bch": "0.0003333333",
        });
    });

    it("should return null for an unknown name", async () => {
        const result = await findByName("unknown_name");
        expect(result).toBeNull();
    });
});
