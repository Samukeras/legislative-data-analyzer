const data = {
    bills: null,
    legislators: null,
    votes: null,
    voteResults: null
};

const VOTE_TYPE = {
    SUPPORT: 1,
    OPPOSE: 2
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');

    // Adiciona listeners para os uploads de arquivo
    document.getElementById('billsFile').addEventListener('change', (e) => handleFileUpload(e, 'bills'));
    document.getElementById('legislatorsFile').addEventListener('change', (e) => handleFileUpload(e, 'legislators'));
    document.getElementById('votesFile').addEventListener('change', (e) => handleFileUpload(e, 'votes'));
    document.getElementById('voteResultsFile').addEventListener('change', (e) => handleFileUpload(e, 'voteResults'));
});

// Funções de manipulação de arquivos
async function handleFileUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        data[type] = parseCSV(text);
        event.target.classList.add('success');
    } catch (error) {
        console.error(`Error processing ${type}:`, error);
        event.target.classList.add('error');
    }
}

function parseCSV(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const headers = lines[0].split(',').map(header => header.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
}