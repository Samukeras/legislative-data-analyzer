/**
 * @enum {string}
 * @readonly
 * @description ID from the DOM Elements
 */
export const DOM_ELEMENTS = Object.freeze({
    UPLOAD_FORM: 'uploadForm',
    ANALYZE_BTN: 'analyzeBtn',
    DOWNLOAD_LEGISLATORS: 'downloadLegislators',
    DOWNLOAD_BILLS: 'downloadBills',
    LEGISLATOR_RESULTS: 'legislatorResults',
    BILL_RESULTS: 'billResults',
    LEGISLATOR_SECTION: 'legislatorSection',
    BILL_SECTION: 'billSection'
});

/**
 * @readonly
 * @enum {number}
 */
const NOTIFICATION_TYPE = Object.freeze({
    SUCCESS: 1,
    ERROR: 2
});

/**
 * @readonly
 * @enum {Object}
 */
const COLORS = Object.freeze({
    [NOTIFICATION_TYPE.SUCCESS]: {
        bg: 'bg-green-100',
        border: 'border-green-400',
        text: 'text-green-700'
    },
    [NOTIFICATION_TYPE.ERROR]: {
        bg: 'bg-red-100',
        border: 'border-red-400',
        text: 'text-red-700'
    }
});

/**
 * @readonly
 * @enum {Object}
 */
const CSS_CLASSES = Object.freeze({
    TABLE_CELL: 'px-4 py-2',
    TABLE_ROW: 'hover:bg-gray-50',
    NOTIFICATION: 'px-4 py-3 rounded relative mb-4',
    NOTIFICATION_MESSAGE: 'block sm:inline'
});

/**
 * UI Class for handling all user interface interactions
 */
export class UI {

    /**
     * Creates a table cell with the given content
     * @param {string|number} content - Content to be displayed in the cell
     * @returns {HTMLTableCellElement} The created table cell
     */
    static createTableCell(content) {
        const td = document.createElement('td');
        td.className = CSS_CLASSES.TABLE_CELL;
        td.textContent = String(content);
        return td;
    }

    /**
     * Creates a table row with the given data
     * @param {Object} data - Data object containing row information
     * @param {string[]} columns - Array of column names to display
     * @returns {HTMLTableRowElement} The created table row
     */
    static createTableRow(data, columns) {
        const tr = document.createElement('tr');
        tr.className = CSS_CLASSES.TABLE_ROW;
        columns.forEach(column => {
            tr.appendChild(this.createTableCell(data[column]));
        });
        return tr;
    }

    /**
     * Gets and cleans the table body element
     * @param {string} tableId - ID of the table element
     * @returns {HTMLTableSectionElement} The cleaned table body
     * @throws {Error} If table element is not found
     */
    static getCleanTable(tableId) {
        const tbody = document.getElementById(tableId);
        if (!tbody) {
            throw new Error(`Table with id "${tableId}" not found`);
        }
        tbody.innerHTML = ''; // Clear existing content
        return tbody
    }

    /**
     * Displays results in the specified table
     * @param {string} tableId - ID of the table element
     * @param {Array<Object>} results - Array of data objects to display
     */
    static displayResults(tableId, results) {
        try {
            const tbody = this.getCleanTable(tableId);
            const columns = results.length > 0 ? Object.keys(results[0]) : [];
            const fragment = document.createDocumentFragment();
            results.forEach(result => {
                fragment.appendChild(this.createTableRow(result, columns));
            });
            tbody.appendChild(fragment);
            document.getElementById(tableId).closest('section').classList.remove('hidden');
        } catch (error) {
            console.error('Error displaying results:', error);
            this.showError(`Failed to display results: ${error.message}`);
        }
    }

    /**
     * Displays legislator results
     * @param {Array<Object>} results - Array of legislator data
     */
    static displayLegislatorResults(results) {
        this.displayResults(DOM_ELEMENTS.LEGISLATOR_RESULTS, results);
    }

    /**
     * Displays bill results
     * @param {Array<Object>} results - Array of bill data
     */
    static displayBillResults(results) {
        this.displayResults(DOM_ELEMENTS.BILL_RESULTS, results);
    }

    /**
     * Shows a notification message
     * @param {string} message - Message to display
     * @param {NOTIFICATION_TYPE|number} type - Type of notification
     */
    static showNotification(message, type) {
        const colorSet = COLORS[type];
        if (!colorSet) {
            throw new Error('Invalid notification type');
        }
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `${colorSet.bg} border ${colorSet.border} ${colorSet.text} px-4 py-3 rounded relative mb-4`;
        notificationDiv.setAttribute('role', 'alert');
        const messageSpan = document.createElement('span');
        messageSpan.className = 'block sm:inline';
        messageSpan.textContent = message;
        notificationDiv.appendChild(messageSpan);
        setTimeout(() => notificationDiv.remove(), 5000);
        const mainContent = document.querySelector('main');
        mainContent.insertBefore(notificationDiv, mainContent.firstChild);
    }

    /**
     * Shows an error notification
     * @param {string} message - Error message to display
     */
    static showError(message) {
        this.showNotification(message, NOTIFICATION_TYPE.ERROR);
    }

    /**
     * Shows a success notification
     * @param {string} message - Success message to display
     */
    static showSuccess(message) {
        this.showNotification(message, NOTIFICATION_TYPE.SUCCESS);
    }

}