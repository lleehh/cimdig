import { getCIMDescription, hasCIMDescription, CIM_DESCRIPTIONS } from '@/lib/cim-descriptions';

describe('CIM Descriptions', () => {
    test('should return description for valid CIM type', () => {
        const description = getCIMDescription('cim:Substation');
        expect(description).not.toBeNull();
        expect(description?.title).toBe('Substation');
        expect(description?.description).toContain('collection of equipment');
    });

    test('should return null for invalid CIM type', () => {
        const description = getCIMDescription('cim:NonExistent');
        expect(description).toBeNull();
    });

    test('should correctly check if CIM type has description', () => {
        expect(hasCIMDescription('cim:Substation')).toBe(true);
        expect(hasCIMDescription('cim:Terminal')).toBe(true);
        expect(hasCIMDescription('cim:NonExistent')).toBe(false);
    });

    test('should have descriptions for all major CIM types', () => {
        const expectedTypes = [
            'cim:Substation',
            'cim:Terminal',
            'cim:PowerTransformer',
            'cim:ACLineSegment',
            'cim:Breaker',
            'cim:BusbarSection',
            'cim:ConnectivityNode',
            'cim:ConformLoad',
            'cim:NonConformLoad',
            'cim:GeneratingUnit',
            'cim:Line',
            'cim:Bay',
            'cim:PowerTransformerEnd'
        ];

        expectedTypes.forEach(type => {
            expect(hasCIMDescription(type)).toBe(true);
        });
    });

    test('all descriptions should have title and description', () => {
        Object.entries(CIM_DESCRIPTIONS).forEach(([key, value]) => {
            expect(value.title).toBeDefined();
            expect(value.title.length).toBeGreaterThan(0);
            expect(value.description).toBeDefined();
            expect(value.description.length).toBeGreaterThan(0);
        });
    });
});
