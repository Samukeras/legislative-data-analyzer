import { Parser } from '../js/csv.js';

describe('Parser', () => {

    test('should parse CSV text to array of objects', () => {
        const csvText = 'id,name\n1,John\n2,Jane';
        const expected = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' }
        ];

        const result = Parser.parse(csvText);
        expect(result).toEqual(expected);
    });

    test('should handle empty lines', () => {
        const csvText = 'id,name\n1,John\n\n2,Jane\n';
        const expected = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' }
        ];

        const result = Parser.parse(csvText);
        expect(result).toEqual(expected);
    });

    test('should stringify array of objects to CSV', () => {
        const data = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' }
        ];
        const expected = 'id,name\n1,John\n2,Jane';

        const result = Parser.stringify(data);
        expect(result).toBe(expected);
    });

    test('should throw error for empty CSV content', () => {
        expect(() => Parser.parse('')).toThrow('CSV content cannot be empty');
        expect(() => Parser.parse('   ')).toThrow('CSV content cannot be empty');
    });

    test('should return empty string when stringifying empty array', () => {
        expect(Parser.stringify([])).toBe('');
    });

});