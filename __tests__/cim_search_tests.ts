import {findById, searchByName} from "@/lib/store/model-repository"
import {convertToCimObject} from "@/lib/services/transform-cim-service";
import {ACLineSegment} from "@/lib/cim";

jest.mock("fs/promises", () => ({
    readFile: jest.fn((filePath: string) => {
        const mockData: { [key: string]: string } = {
            "nordic44_cgm_37a_eq_by_name.json": JSON.stringify({
                "Oslo Trondheim": {
                    "rdfType": "cim:ACLineSegment",
                    "mRID": "f1769b90-9aeb-11e5-91da-b8763fd99c5f",
                },
                "Oslo Bergen": {
                    "rdfType": "cim:ACLineSegment",
                    "mRID": "f1769b90-9aeb-11e5-91da-b8763fd99c5f",
                },
                "Trondheim Bergen": {
                    "rdfType": "cim:ACLineSegment",
                    "mRID": "f1769b90-9aeb-11e5-91da-b8763fd99c5f",
                },
            }),
        };
        return Promise.resolve(mockData[filePath.split("/").pop() || ""]);
    }),
}));

describe("Repository Search by name", () => {

    it("Searching for Oslo", async () => {

        const result = await searchByName("oslo");

        expect(result).toBeDefined();
        expect(result.length).toEqual(2);


    });


    it("Searching for Trondheim ", async () => {

        const result = await searchByName("TrondHeim");

        expect(result).toBeDefined();
        expect(result.length).toEqual(1);


    });

    it("Searching for Bergen", async () => {

        const result = await searchByName("Bergen");

        expect(result).toBeDefined();
        expect(result.length).toEqual(0);


    });
})
