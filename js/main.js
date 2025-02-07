import { SPECS as CSV_SPECS, Parser as CSVParser } from './csv.js';
import { Metrics, INPUT_FILES } from './analytics.js';
import { UI, DOM_ELEMENTS } from './ui.js';

/**
 * @enum {string}
 * @description Defines the filenames for output CSV files
 * @readonly
 */
export const OUTPUT_FILES = Object.freeze({
    LEGISLATORS: 'legislators-support-oppose-count.csv',
    BILLS: 'bills-analysis.csv'
});

/**
 * @class LegislativeAnalyzer
 * @description Main class that orchestrates the legislative data analysis process.
 * Handles file uploads, data processing, and result generation.
 */
class LegislativeAnalyzer {

    /**
     * @constructor
     * Initializes the analyzer with empty data storage and sets up event listeners
     */
    constructor() {

        /**
         * @private
         * @type {Map<string, Array>}
         * @description Stores the uploaded CSV data for each file type
         */
        this.data = new Map([
            [INPUT_FILES.BILLS, null],
            [INPUT_FILES.LEGISLATORS, null],
            [INPUT_FILES.VOTES, null],
            [INPUT_FILES.VOTE_RESULTS, null]
        ]);
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for form submission and file uploads
     */
    setupEventListeners() {
        window.addEventListener('beforeunload', () => this.cleanup());
        document.getElementById(DOM_ELEMENTS.UPLOAD_FORM)
            .addEventListener('submit', (e) => {
                e.preventDefault();
                this.analyzeData();
            });
        document.getElementById(DOM_ELEMENTS.DOWNLOAD_LEGISLATORS)
            .addEventListener('click', () => this.downloadLegislatorResults());
        document.getElementById(DOM_ELEMENTS.DOWNLOAD_BILLS)
            .addEventListener('click', () => this.downloadBillResults());
        Array.from(this.data.keys()).forEach(type => {
            document.getElementById(`${type}File`)
                .addEventListener('change', (e) => this.handleFileUpload(e, type));
        });
    }

    /**
     * Cleans up stored data when the page is unloaded
     */
    cleanup() {
        this.data.clear();
        this.legislatorResults = null;
        this.billResults = null;
    }

    /**
     * Handles file upload events
     * @param {Event} event - File input change event
     * @param {string} type - Type of file being uploaded (from INPUT_FILES enum)
     * @returns {Promise<void>}
     */
    async handleFileUpload(event, type) {
        const inputElement = event.target
        try {
            this.data.set(type, await this.getData(this.getFile(event)));
            inputElement.classList.remove('error');
            inputElement.classList.add('success');
        } catch (error) {
            console.error(`Error processing ${type}:`, error);
            inputElement.classList.remove('success');
            inputElement.classList.add('error');
            UI.showError(error.message)
        }
    }

    /**
     * Retrieves and validates the uploaded file
     * @param {Event} event - File input change event
     * @throws {Error} If no file is selected or if file is not a CSV
     * @returns {File} The uploaded file
     */
    getFile(event) {
        const file = event.target.files[0];
        if (!file) {
            throw new Error('No file selected');
        }
        if (!file.name.toLowerCase().endsWith('.csv')) {
            throw new Error('File must be a CSV');
        }
        return file
    }

    /**
     * Parses CSV file data
     * @param {File} file - CSV file to parse
     * @throws {Error} If CSV data is invalid or empty
     * @returns {Promise<Array>} Parsed CSV data
     */
    async getData(file) {
        const parsedData = CSVParser.parse(await file.text());
        if (!parsedData || parsedData.length === 0) {
            throw new Error('CSV file is empty or invalid');
        }
        return parsedData
    }

    /**
     * Checks if all required data files have been uploaded
     * @returns {boolean} True if all required data is present
     */
    isDataComplete() {
        return Array.from(this.data.values()).every(data =>
            Array.isArray(data) && data.length > 0
        );
    }

    /**
     * Processes the uploaded data and generates analysis results
     * @throws {Error} If any required files are missing or if analysis fails
     */
    analyzeData() {
        try {
            if (!this.isDataComplete()) {
                throw new Error('Please upload all required files first');
            }
            this.legislatorResults = Metrics.legislatorVotes(this.data);
            this.billResults = Metrics.billVotes(this.data);
            UI.displayLegislatorResults(this.legislatorResults);
            UI.displayBillResults(this.billResults);
            UI.showSuccess('Analysis completed successfully');
        } catch (error) {
            UI.showError(`Error analyzing data: ${error.message}`);
        }
    }

    /**
     * Downloads analysis results as a CSV file
     * @param {Array<Object>} data - Data to be downloaded
     * @param {string} filename - Name of the output file
     * @throws {Error} If no data is available for download
     */
    downloadCSV(data, filename) {
        try {
            if (!data || data.length === 0) {
                throw new Error('No data available for download');
            }
            const link = document.createElement('a');
            link.href = URL.createObjectURL(new Blob(
                [CSVParser.stringify(data)],
                { type: CSV_SPECS.FILE_TYPE }
            ));
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Download error:', error);
            UI.showError(error.message);
        }
    }

    /**
     * Downloads legislator analysis results
     */
    downloadLegislatorResults() {
        this.downloadCSV(this.legislatorResults, OUTPUT_FILES.LEGISLATORS);
    }

    /**
     * Downloads bill analysis results
     */
    downloadBillResults() {
        this.downloadCSV(this.billResults, OUTPUT_FILES.BILLS);
    }
}

// Initialize the analyzer when the script loads
new LegislativeAnalyzer();