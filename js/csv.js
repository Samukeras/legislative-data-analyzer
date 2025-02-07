/**
 * @enum {number}
 * @readonly
 * @description CSV format specifications and parsing patterns
 */
export const SPECS = Object.freeze({
    /** MIME type for CSV files */
    FILE_TYPE: 'text/csv;charset=utf-8;',
    /** Field delimiter character */
    DELIMITER: ',',
    /** Line separator for output */
    LINE_FEED: '\n',
    /** Regular expression for detecting line breaks */
    LINE_BREAK_REGEX: /\r\n|\n/,
    /** Pattern for detecting numeric values */
    NUMBER_REGEX: /^\d+$/
});

/**
 * @class Parser
 * @description A utility class that parses and stringifies CSV data.
 * Handles CSV format conversion between string content and JavaScript objects.
 */
export class Parser {

    /**
     * Parses CSV text content into an array of objects
     * @param {string} csvText - Raw CSV content to parse
     * @throws {Error} If CSV content is empty or invalid
     * @returns {Array<Object>} Array of objects where keys are CSV headers
     */
    static parse(csvText) {
        if (!csvText?.trim()) {
            throw new Error('CSV content cannot be empty');
        }
        const lines = csvText.split(SPECS.LINE_BREAK_REGEX).filter(line => line.trim());
        if (!lines.length) {
            throw new Error('CSV must contain at least a header row');
        }
        const headers = this.parseRow(lines.shift());
        return lines.map(line => this.parseLineToObject(line, headers));
    }

    /**
     * Converts a string value to number if applicable
     * @param {string} value - Value to be parsed
     * @returns {string|number} Parsed value as number if numeric, otherwise original string
     */
    static parseValue(value) {
        return SPECS.NUMBER_REGEX.test(value) ? parseInt(value) : value;
    }

    /**
     * Converts a CSV line into an object using provided headers
     * @param {string} line - CSV line to parse
     * @param {string[]} headers - Array of header names
     * @throws {Error} If number of columns doesn't match headers
     * @returns {Object} Object with header-value pairs
     */
    static parseLineToObject(line, headers) {
        const row = this.parseRow(line);
        if (row.length !== headers.length) {
            throw new Error(`Invalid number of columns. Expected ${headers.length}, got ${row.length}`);
        }
        return headers.reduce((obj, header, index) => {
            obj[header] = this.parseValue(row[index]);
            return obj;
        }, {});
    }

    /**
     * Splits a CSV row into individual values
     * @param {string} row - CSV row to split
     * @returns {string[]} Array of trimmed values
     */
    static parseRow(row) {
        return row.split(SPECS.DELIMITER).map(value => value.trim());
    }

    /**
     * Converts an array of objects back to CSV format
     * @param {Array<Object>} data - Array of objects to convert
     * @returns {string} CSV formatted string, empty string if input is invalid
     */
    static stringify(data) {
        if (!data || !data.length) return '';
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(SPECS.DELIMITER),
            ...data.map(row => headers.map(header => row[header]).join(SPECS.DELIMITER))
        ];
        return csvRows.join(SPECS.LINE_FEED);
    }

}