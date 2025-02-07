// __tests__/legislativeAnalytics.test.js
import { Metrics, INPUT_FILES, VOTE_TYPE, UNKNOWN_SPONSOR } from '../js/analytics.js';

describe('Legislative Analytics', () => {
    // Mock data setup
    const mockData = new Map();

    beforeEach(() => {
        // Reset mock data before each test
        mockData.set(INPUT_FILES.BILLS, [
            { id: 1, title: 'A Bill 1', sponsor_id: 1 },
            { id: 2, title: 'B Bill 2', sponsor_id: 2 }
        ]);

        mockData.set(INPUT_FILES.LEGISLATORS, [
            { id: 1, name: 'Ada AAA' },
            { id: 2, name: 'Bob BBB' },
            { id: 3, name: 'Cap CCC' }
        ]);

        mockData.set(INPUT_FILES.VOTES, [
            { id: 1, bill_id: 1 },
            { id: 2, bill_id: 2 }
        ]);

        mockData.set(INPUT_FILES.VOTE_RESULTS, [
            { id: 1, legislator_id: 1, vote_id: 1, vote_type: VOTE_TYPE.SUPPORT },
            { id: 2, legislator_id: 2, vote_id: 1, vote_type: VOTE_TYPE.OPPOSE },
            { id: 3, legislator_id: 3, vote_id: 1, vote_type: VOTE_TYPE.SUPPORT },
            { id: 4, legislator_id: 1, vote_id: 2, vote_type: VOTE_TYPE.OPPOSE },
            { id: 5, legislator_id: 2, vote_id: 2, vote_type: VOTE_TYPE.SUPPORT }
        ]);
    });

    describe('Data Validation', () => {
        test('should throw error for invalid data map', () => {
            expect(() => Metrics.legislatorVotes({})).toThrow('Data must be a Map instance');
            expect(() => Metrics.billVotes({})).toThrow('Data must be a Map instance');
        });

        test('should throw error for missing required data', () => {
            const incompleteData = new Map();
            incompleteData.set(INPUT_FILES.BILLS, []);
            expect(() => Metrics.legislatorVotes(incompleteData)).toThrow('Empty data for: bills');
        });

        test('should throw error for invalid bill data', () => {
            mockData.set(INPUT_FILES.BILLS, [{ id: 1 }]); // Missing title
            expect(() => Metrics.legislatorVotes(mockData)).toThrow('Invalid bill data');
        });

        test('should throw error for invalid legislator data', () => {
            mockData.set(INPUT_FILES.LEGISLATORS, [{ name: 'John' }]); // Missing id
            expect(() => Metrics.legislatorVotes(mockData)).toThrow('Invalid legislator data');
        });

        test('should throw error for invalid vote data', () => {
            mockData.set(INPUT_FILES.VOTES, [{ id: 1 }]); // Missing bill_id
            expect(() => Metrics.legislatorVotes(mockData)).toThrow('Invalid vote data');
        });

        test('should throw error for invalid vote result data', () => {
            mockData.set(INPUT_FILES.VOTE_RESULTS, [{ id: 1, vote_type: 3 }]); // Invalid vote_type
            expect(() => Metrics.legislatorVotes(mockData)).toThrow('Invalid vote result');
        });

    });

    describe('Legislator Votes Analysis', () => {
        test('should calculate correct support/oppose counts for legislators', () => {
            const results = Metrics.legislatorVotes(mockData);

            // Find Ada's results (id: 1)
            const adaResults = results.find(r => r.id === 1);
            expect(adaResults.num_supported_bills).toBe(1); // Supported Bill 1
            expect(adaResults.num_opposed_bills).toBe(1);   // Opposed Bill 2

            // Find Bob's results (id: 2)
            const bobResults = results.find(r => r.id === 2);
            expect(bobResults.num_supported_bills).toBe(1); // Supported Bill 2
            expect(bobResults.num_opposed_bills).toBe(1);   // Opposed Bill 1
        });

        test('should handle legislators with no votes', () => {
            // Remove all vote results for legislator 3
            mockData.set(INPUT_FILES.VOTE_RESULTS,
                mockData.get(INPUT_FILES.VOTE_RESULTS)
                    .filter(vr => vr.legislator_id !== 3)
            );

            const results = Metrics.legislatorVotes(mockData);
            const bobResults = results.find(r => r.id === 3);
            expect(bobResults.num_supported_bills).toBe(0);
            expect(bobResults.num_opposed_bills).toBe(0);
        });
    });

    describe('Bill Votes Analysis', () => {
        test('should calculate correct supporter/opposer counts for bills', () => {
            const results = Metrics.billVotes(mockData);

            // Check Bill 1
            const bill1Results = results.find(r => r.id === 1);
            expect(bill1Results.supporter_count).toBe(2); // Ada and Cap supported
            expect(bill1Results.opposer_count).toBe(1);   // Bob opposed

            // Check Bill 2
            const bill2Results = results.find(r => r.id === 2);
            expect(bill2Results.supporter_count).toBe(1); // Bob supported
            expect(bill2Results.opposer_count).toBe(1);   // Ada opposed
        });

        test('should handle unknown bill sponsors', () => {
            // Modify bill 2 to have an unknown sponsor
            mockData.set(INPUT_FILES.BILLS, [
                { id: 1, title: 'Bill 1', sponsor_id: 1 },
                { id: 2, title: 'Bill 2', sponsor_id: null } // Unknown sponsor
            ]);

            const results = Metrics.billVotes(mockData);
            const bill2Results = results.find(r => r.id === 2);
            expect(bill2Results.primary_sponsor).toBe(UNKNOWN_SPONSOR);
        });

        test('should handle bills with no votes', () => {
            // Remove all vote results for bill 2
            mockData.set(INPUT_FILES.VOTE_RESULTS,
                mockData.get(INPUT_FILES.VOTE_RESULTS)
                    .filter(vr => vr.vote_id !== 2)
            );

            const results = Metrics.billVotes(mockData);
            const bill2Results = results.find(r => r.id === 2);
            expect(bill2Results.supporter_count).toBe(0);
            expect(bill2Results.opposer_count).toBe(0);
        });
    });

    describe('Edge Cases', () => {
        test('should ignore invalid vote results', () => {
            // Add some invalid vote results
            mockData.get(INPUT_FILES.VOTE_RESULTS).push(
                { id: 6, legislator_id: 999, vote_id: 1, vote_type: VOTE_TYPE.SUPPORT }, // Invalid legislator
                { id: 7, legislator_id: 1, vote_id: 999, vote_type: VOTE_TYPE.SUPPORT }  // Invalid vote
            );

            const legislatorResults = Metrics.legislatorVotes(mockData);
            const billResults = Metrics.billVotes(mockData);

            // Results should be the same as if invalid votes were not present
            const johnResults = legislatorResults.find(r => r.id === 1);
            expect(johnResults.num_supported_bills).toBe(1);
            expect(johnResults.num_opposed_bills).toBe(1);
        });

    });

});