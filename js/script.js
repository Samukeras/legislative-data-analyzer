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

    form.addEventListener('submit', handleFormSubmit);
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

async function handleFormSubmit(event) {
    event.preventDefault();
    downloadLegislatorResults();
    downloadBillResults();
}

function analyzeLegislatorVotes() {
    const legislatorVotes = new Map();

    // Inicializa contadores para cada legislador
    data.legislators.forEach(legislator => {
        legislatorVotes.set(legislator.id, {
            id: legislator.id,
            name: legislator.name,
            num_supported_bills: 0,
            num_opposed_bills: 0
        });
    });

    // Cria um mapa de votos para bills para acesso mais rápido
    const voteToBill = new Map(data.votes.map(vote => [vote.id, vote.bill_id]));

    // Processa os resultados dos votos
    data.voteResults.forEach(result => {
        const legislator = legislatorVotes.get(result.legislator_id);
        if (!legislator) return;

        if (parseInt(result.vote_type) === VOTE_TYPE.SUPPORT) {
            legislator.num_supported_bills++;
        } else if (parseInt(result.vote_type) === VOTE_TYPE.OPPOSE) {
            legislator.num_opposed_bills++;
        }
    });

    return Array.from(legislatorVotes.values());
}

function analyzeBillVotes() {
    const billVotes = new Map();
    const legislatorMap = new Map(data.legislators.map(leg => [leg.id, leg.name]));

    // Inicializa contadores para cada bill
    data.bills.forEach(bill => {
        billVotes.set(bill.id, {
            id: bill.id,
            title: bill.title,
            supporter_count: 0,
            opposer_count: 0,
            primary_sponsor: legislatorMap.get(bill.sponsor_id) || 'Unknown'
        });
    });

    // Cria um mapa de votos para bills
    const voteToBill = new Map(data.votes.map(vote => [vote.id, vote.bill_id]));

    // Processa os resultados dos votos
    data.voteResults.forEach(result => {
        const billId = voteToBill.get(result.vote_id);
        const bill = billVotes.get(billId);
        if (!bill) return;

        if (result.vote_type === VOTE_TYPE.SUPPORT) {
            bill.supporter_count++;
        } else if (result.vote_type === VOTE_TYPE.OPPOSE) {
            bill.opposer_count++;
        }
    });

    return Array.from(billVotes.values());
}

function downloadLegislatorResults() {
    const results = analyzeLegislatorVotes();
    downloadCSV(results, 'legislators-support-oppose-count.csv');
}

function downloadBillResults() {
    const results = analyzeBillVotes();
    downloadCSV(results, 'bills-analysis.csv');
}

function downloadCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => row[header]).join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}