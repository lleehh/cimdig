import {findById} from "@/app/api/cim/route";
import {convertToCimObject} from "@/services/transform-cim-service";
import {ACLineSegment} from "@/models/cim";

jest.mock("fs/promises", () => ({
    readFile: jest.fn((filePath: string) => {
        const mockData: { [key: string]: string } = {
            "nordic44_cgm_37a_eq_by_id.json": JSON.stringify({
                "_f1769b90-9aeb-11e5-91da-b8763fd99c5f": {
                    rdfType: "cim:ACLineSegment",
                    "cim:ACLineSegment.bch": "0.0003333333",
                    "cim:ACLineSegment.description": "A Line Segment"
                },
            }),
        };
        return Promise.resolve(mockData[filePath.split("/").pop() || ""]);
    }),
}));

describe("Data API", () => {

    it("should find a component by ID", async () => {
        const id = "_f1769b90-9aeb-11e5-91da-b8763fd99c5f";

        const result = await findById(id);

        expect(result).toBeDefined();

        if (result != null) {
            const entity = convertToCimObject<ACLineSegment>(id, result)
            // Note that this is converted to a number
            expect(entity.bch).toEqual(0.0003333333);
        }

    });
})
