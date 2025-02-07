/**
 * @enum {string}
 * @readonly
 * @description Input file types used in the data analysis
 */
export const INPUT_FILES = Object.freeze({
    /** Bills data file identifier */
    BILLS: 'bills',
    /** Legislators data file identifier */
    LEGISLATORS: 'legislators',
    /** Votes data file identifier */
    VOTES: 'votes',
    /** Vote results data file identifier */
    VOTE_RESULTS: 'voteResults'
});

/**
 * @enum {number}
 * @readonly
 * @description Enum for vote types used in the analysis
 */
export const VOTE_TYPE = Object.freeze({
    /** Represents a supporting vote (Yea) */
    SUPPORT: 1,
    /** Represents an opposing vote (Nay) */
    OPPOSE: 2
});

/**
 * @constant {string}
 * @description Default text used when a bill's primary sponsor cannot be found
 */
export const UNKNOWN_SPONSOR = 'Unknown';

/**
 * @class Schema
 * @description Validates the structure and format of legislative data, ensuring that bills,
 * legislators, votes, and vote results follow the required specifications.
 */
class Schema {

    /**
     * Validates the provided data map containing all required datasets
     * @param {Map<string, Array>} data - Map containing all input datasets
     * @throws {Error} If data is invalid or missing required fields
     */
    static validateData(data) {
        if (!(data instanceof Map)) {
            throw new Error('Data must be a Map instance');
        }
        const requiredTypes = Object.values(INPUT_FILES);
        for (const type of requiredTypes) {
            const typeData = data.get(type);
            if (!Array.isArray(typeData)) {
                throw new Error(`Invalid or missing data for: ${type}`);
            }
            if (typeData.length === 0) {
                throw new Error(`Empty data for: ${type}`);
            }
            this.validateFileData(type, typeData)
        }
    }

    /**
     * Routes validation to the appropriate validation method based on file type
     * @param {string} fileType - Type of file being validated
     * @param {Array} data - Data to validate
     * @throws {Error} If file type is invalid or validation fails
     */
    static validateFileData(fileType, data) {
        switch (fileType) {
            case INPUT_FILES.BILLS:
                this.validateBillsData(data)
                break;
            case INPUT_FILES.LEGISLATORS:
                this.validateLegislatorsData(data)
                break;
            case INPUT_FILES.VOTES:
                this.validateVotesData(data)
                break;
            case INPUT_FILES.VOTE_RESULTS:
                this.validateVoteResultsData(data)
                break;
            default:
                throw new Error(`Invalid file type: ${fileType}`);
        }
    }

    /**
     * Validates bill data structure
     * @param {Array<Object>} bills - Array of bill objects
     * @throws {Error} If any bill is missing required fields
     */
    static validateBillsData(bills) {
        bills.forEach(bill => {
            if (!bill.id || !bill.title) {
                throw new Error(`Invalid bill data: missing id or title`);
            }
        });
    }

    /**
     * Validates legislator data structure
     * @param {Array<Object>} legislators - Array of legislator objects
     * @throws {Error} If any legislator is missing required fields
     */
    static validateLegislatorsData(legislators) {
        legislators.forEach(legislator => {
            if (!legislator.id || !legislator.name) {
                throw new Error(`Invalid legislator data: missing id or name`);
            }
        });
    }

    /**
     * Validates vote data structure
     * @param {Array<Object>} votes - Array of vote objects
     * @throws {Error} If any vote is missing required fields
     */
    static validateVotesData(votes) {
        votes.forEach(vote => {
            if (!vote.id || !vote.bill_id) {
                throw new Error(`Invalid vote data: missing id or bill_id`);
            }
        });
    }

    /**
     * Validates vote results data structure
     * @param {Array<Object>} voteResults - Array of vote result objects
     * @throws {Error} If any vote result is missing required fields or has invalid vote type
     */
    static validateVoteResultsData(voteResults) {
        voteResults.forEach(result => {
            if (!result.legislator_id || !result.vote_id || !result.vote_type) {
                throw new Error(`Invalid vote result: missing legislator_id, vote_id, or vote_type`);
            }
            if (![VOTE_TYPE.SUPPORT, VOTE_TYPE.OPPOSE].includes(result.vote_type)) {
                throw new Error(`Invalid vote type: ${result.vote_type}`);
            }
        });
    }
}

/**
 * @class Metrics
 * @description Static class for analyzing legislative voting data
 */
export class Metrics {

    /**
     * Creates a map of vote IDs to their corresponding bill IDs for O(1) access
     * @param {Map<string, Array>} data - Map containing all input datasets
     * @returns {Map<number, number>} Map where key is vote ID and value is bill ID
     */
    static voteLookup(data) {
        return new Map(
            data.get(INPUT_FILES.VOTES).map(vote => [vote.id, vote.bill_id])
        );
    }

    /**
     * Analyzes voting patterns for each legislator
     * @param {Map<string, Array>} data - Map containing all input datasets
     * @returns {Array<Object>} Array of legislator voting records
     */
    static legislatorVotes(data) {
        Schema.validateData(data);
        const voteLookup = this.voteLookup(data)
        const legislatorVotes = new Map(
            data.get(INPUT_FILES.LEGISLATORS).map(legislator => [
                legislator.id,
                {
                    id: legislator.id,
                    name: legislator.name,
                    num_supported_bills: 0,
                    num_opposed_bills: 0
                }
            ])
        );
        data.get(INPUT_FILES.VOTE_RESULTS).forEach(result => {
            const legislator = legislatorVotes.get(result.legislator_id);
            if (!legislator) {
                console.warn(`Skipping vote result for invalid legislator ID: ${result.legislator_id}`);
                return;
            }
            if (!voteLookup.has(result.vote_id)) {
                console.warn(`Skipping vote result for invalid vote ID: ${result.vote_id}`);
                return;
            }
            result.vote_type === VOTE_TYPE.SUPPORT ? legislator.num_supported_bills++
                : legislator.num_opposed_bills++;
        });
        return Array.from(legislatorVotes.values());
    }

    /**
     * Analyzes voting patterns for each bill
     * @param {Map<string, Array>} data - Map containing all input datasets
     * @returns {Array<Object>} Array of bill voting records
     */
    static billVotes(data) {
        Schema.validateData(data);
        const voteLookup = this.voteLookup(data)
        const legislatorLookup = new Map(
            data.get(INPUT_FILES.LEGISLATORS).map(leg => [leg.id, leg.name])
        );
        const billVotes = new Map(
            data.get(INPUT_FILES.BILLS).map(bill => [
                bill.id,
                {
                    id: bill.id,
                    title: bill.title,
                    supporter_count: 0,
                    opposer_count: 0,
                    primary_sponsor: legislatorLookup.get(bill.sponsor_id) || UNKNOWN_SPONSOR
                }
            ])
        );
        data.get(INPUT_FILES.VOTE_RESULTS).forEach(result => {
            const billId = voteLookup.get(result.vote_id);
            if (!billId || !billVotes.has(billId)) {
                console.warn(`Skipping vote result for invalid bill ID: ${billId}`);
                return;
            }
            const bill = billVotes.get(billId);
            result.vote_type === VOTE_TYPE.SUPPORT ? bill.supporter_count++
                : bill.opposer_count++;
        });
        return Array.from(billVotes.values());
    }

}