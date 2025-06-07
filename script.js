// FinanceApp - JavaScript com Dados de Exemplo e Funcionalidades

// Dados de exemplo mais robustos para demonstração
function initializeSampleData() {
    if (!localStorage.getItem('transactions')) {
        const sampleTransactions = [
            { id: 1, description: 'Salário Janeiro', amount: 5000, type: 'income', category: 'Salário', date: '2025-01-15' },
            { id: 2, description: 'Supermercado Extra', amount: 350, type: 'expense', category: 'Alimentação', date: '2025-01-20' },
            { id: 3, description: 'Conta de Luz CEMIG', amount: 180, type: 'expense', category: 'Contas', date: '2025-01-25' },
            { id: 4, description: 'Freelance Website', amount: 800, type: 'income', category: 'Extra', date: '2025-02-05' },
            { id: 5, description: 'Gasolina Posto', amount: 200, type: 'expense', category: 'Transporte', date: '2025-02-10' },
            { id: 6, description: 'Aluguel Apartamento', amount: 1200, type: 'expense', category: 'Moradia', date: '2025-02-01' },
            { id: 7, description: 'Academia Mensal', amount: 89, type: 'expense', category: 'Saúde', date: '2025-02-15' },
            { id: 8, description: 'Dividendos Ações', amount: 250, type: 'income', category: 'Investimentos', date: '2025-02-20' },
            { id: 9, description: 'Cinema Shopping', amount: 45, type: 'expense', category: 'Lazer', date: '2025-03-01' },
            { id: 10, description: 'Curso Online', amount: 150, type: 'expense', category: 'Educação', date: '2025-03-05' },
            { id: 11, description: 'Salário Fevereiro', amount: 5000, type: 'income', category: 'Salário', date: '2025-02-15' },
            { id: 12, description: 'Uber Trabalho', amount: 25, type: 'expense', category: 'Transporte', date: '2025-03-10' },
            { id: 13, description: 'Restaurante', amount: 80, type: 'expense', category: 'Alimentação', date: '2025-03-15' },
            { id: 14, description: 'Internet Fibra', amount: 99, type: 'expense', category: 'Contas', date: '2025-03-20' },
            { id: 15, description: 'Bonus Projeto', amount: 1500, type: 'income', category: 'Extra', date: '2025-03-25' }
        ];
        localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
    }
}

// Função para formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('loggedIn');
        window.location.href = 'index.html';
    }
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').prepend(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Função para mostrar erro
function showErrorMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').prepend(alert);
}

// Categorias disponíveis
const categories = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Extra'],
    expense: ['Alimentação', 'Transporte', 'Contas', 'Lazer', 'Saúde', 'Educação']
};

// === FUNÇÕES DE RELATÓRIOS ===

// Variáveis globais para charts
let categoryChart = null;
let comparisonChart = null;

function generateReport() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const selectedMonth = document.getElementById('reportMonth')?.value;
    
    let filteredTransactions = transactions;
    if (selectedMonth) {
        filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryData = {};

    filteredTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += parseFloat(transaction.amount);
        } else {
            totalExpenses += parseFloat(transaction.amount);
            categoryData[transaction.category] = (categoryData[transaction.category] || 0) + parseFloat(transaction.amount);
        }
    });

    // Atualizar resumo se os elementos existirem
    const incomeEl = document.getElementById('reportIncome');
    const expensesEl = document.getElementById('reportExpenses');
    const balanceEl = document.getElementById('reportBalance');
    const countEl = document.getElementById('reportCount');

    if (incomeEl) incomeEl.textContent = formatCurrency(totalIncome);
    if (expensesEl) expensesEl.textContent = formatCurrency(totalExpenses);
    if (balanceEl) balanceEl.textContent = formatCurrency(totalIncome - totalExpenses);
    if (countEl) countEl.textContent = filteredTransactions.length;

    // Gerar gráficos se Chart.js estiver disponível
    if (typeof Chart !== 'undefined') {
        updateCategoryChart(categoryData);
        updateComparisonChart(totalIncome, totalExpenses);
    }
    
    generateInsights(totalIncome, totalExpenses, filteredTransactions);
}

function updateCategoryChart(categoryData) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Adicionar narração acessível do gráfico
    generateChartNarration('categoryChart', 'category', categoryData);
}

function updateComparisonChart(income, expenses) {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [income, expenses],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });

    // Adicionar narração acessível do gráfico
    generateChartNarration('comparisonChart', 'comparison', { income, expenses });
}

// === FUNÇÃO DE NARRAÇÃO PARA GRÁFICOS ===

function generateChartNarration(chartId, chartType, data) {
    const chartContainer = document.getElementById(chartId)?.parentElement;
    if (!chartContainer) return;

    // Remover narração anterior se existir
    const existingNarration = chartContainer.querySelector('.chart-narration');
    if (existingNarration) {
        existingNarration.remove();
    }

    let narrationText = '';
    let narrationHTML = '';

    if (chartType === 'category') {
        const total = Object.values(data).reduce((sum, value) => sum + value, 0);
        const categories = Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => {
                const percentage = ((amount / total) * 100).toFixed(1);
                return { category, amount, percentage };
            });

        narrationText = `Gráfico de gastos por categoria. Total de ${formatCurrency(total)} distribuído em ${categories.length} categorias. `;
        
        narrationHTML = `
            <div class="chart-narration mt-3" role="img" aria-label="${narrationText}">
                <h6><i class="fas fa-audio-description me-2"></i>Descrição do Gráfico</h6>
                <div class="alert alert-info">
                    <p><strong>Distribuição de Gastos por Categoria:</strong></p>
                    <ul class="mb-0">
        `;

        categories.forEach(({ category, amount, percentage }) => {
            narrationHTML += `
                <li>${category}: ${formatCurrency(amount)} (${percentage}% do total)</li>
            `;
            narrationText += `${category}: ${formatCurrency(amount)} representando ${percentage}% do total. `;
        });        narrationHTML += `
                    </ul>
                </div>
                <button class="btn btn-sm btn-outline-secondary" onclick="speakChartNarration(this, '${narrationText.replace(/'/g, '\\\'')}')" 
                        aria-label="Ouvir descrição do gráfico">
                    <i class="fas fa-volume-up me-1"></i>Ouvir Descrição
                </button>
            </div>
        `;

    } else if (chartType === 'comparison') {
        const { income, expenses } = data;
        const balance = income - expenses;
        const balanceType = balance >= 0 ? 'positivo' : 'negativo';
        
        narrationText = `Gráfico de comparação financeira. Receitas: ${formatCurrency(income)}. Despesas: ${formatCurrency(expenses)}. Saldo ${balanceType}: ${formatCurrency(Math.abs(balance))}.`;
        
        narrationHTML = `
            <div class="chart-narration mt-3" role="img" aria-label="${narrationText}">
                <h6><i class="fas fa-audio-description me-2"></i>Descrição do Gráfico</h6>
                <div class="alert alert-info">
                    <p><strong>Comparação Receitas vs Despesas:</strong></p>
                    <ul class="mb-0">
                        <li>Receitas: ${formatCurrency(income)}</li>
                        <li>Despesas: ${formatCurrency(expenses)}</li>
                        <li>Saldo ${balanceType}: ${formatCurrency(Math.abs(balance))}</li>
                        <li>Porcentagem de economia: ${income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0}%</li>                    </ul>
                </div>
                <button class="btn btn-sm btn-outline-secondary" onclick="speakChartNarration(this, '${narrationText.replace(/'/g, '\\\'')}')" 
                        aria-label="Ouvir descrição do gráfico">
                    <i class="fas fa-volume-up me-1"></i>Ouvir Descrição
                </button>
            </div>
        `;
    }

    chartContainer.insertAdjacentHTML('beforeend', narrationHTML);
}

// Função para sintetizar voz (quando disponível)
function speakChartNarration(buttonElement, text) {
    if ('speechSynthesis' in window) {
        // Parar qualquer narração anterior
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        // Tentar encontrar voz em português
        const voices = speechSynthesis.getVoices();
        const portugueseVoice = voices.find(voice => 
            voice.lang.includes('pt') || voice.lang.includes('BR')
        );
        
        if (portugueseVoice) {
            utterance.voice = portugueseVoice;
        }
        
        speechSynthesis.speak(utterance);
        
        // Feedback visual
        const button = buttonElement;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-stop me-1"></i>Parando...';
        button.disabled = true;
        
        utterance.onend = () => {
            button.innerHTML = originalText;
            button.disabled = false;
        };
        
        utterance.onerror = () => {
            button.innerHTML = originalText;
            button.disabled = false;
            alert('Erro ao reproduzir áudio. Verifique se o seu navegador suporta síntese de voz.');
        };
    } else {
        alert('Seu navegador não suporta síntese de voz. A descrição textual está disponível acima do gráfico.');
    }
}

function generateInsights(income, expenses, transactions) {
    const insightsContainer = document.getElementById('insights');
    if (!insightsContainer) return;

    const insights = [];

    if (transactions.length === 0) {
        insightsContainer.innerHTML = '<p class="text-muted">Adicione transações para visualizar insights personalizados.</p>';
        return;
    }

    const balance = income - expenses;
    
    if (balance > 0) {
        insights.push(`<div class="alert alert-success"><i class="fas fa-thumbs-up me-2"></i>Parabéns! Você teve um saldo positivo de ${formatCurrency(balance)} neste período.</div>`);
    } else if (balance < 0) {
        insights.push(`<div class="alert alert-warning"><i class="fas fa-exclamation-triangle me-2"></i>Atenção! Você gastou ${formatCurrency(Math.abs(balance))} a mais do que recebeu.</div>`);
    }

    if (expenses > 0) {
        const savingsRate = (income - expenses) / income * 100;
        if (savingsRate >= 20) {
            insights.push(`<div class="alert alert-info"><i class="fas fa-piggy-bank me-2"></i>Excelente! Você conseguiu economizar ${savingsRate.toFixed(1)}% da sua renda.</div>`);
        }
    }

    insightsContainer.innerHTML = insights.join('') || '<p class="text-muted">Continue adicionando transações para mais insights.</p>';
}

// === FUNÇÕES DE DASHBOARD ===

function loadDashboard() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += parseFloat(transaction.amount);
        } else {
            totalExpenses += parseFloat(transaction.amount);
        }
    });

    // Atualizar elementos se existirem
    const incomeEl = document.getElementById('totalIncome');
    const expensesEl = document.getElementById('totalExpenses');
    const balanceEl = document.getElementById('balance');

    if (incomeEl) incomeEl.textContent = formatCurrency(totalIncome);
    if (expensesEl) expensesEl.textContent = formatCurrency(totalExpenses);
    if (balanceEl) balanceEl.textContent = formatCurrency(totalIncome - totalExpenses);

    // Mostrar últimas 5 transações
    const recentContainer = document.getElementById('recentTransactions');
    if (recentContainer) {
        const recent = transactions.slice(-5).reverse();
        
        if (recent.length > 0) {
            recentContainer.innerHTML = recent.map(t => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <h6 class="mb-0">${t.description}</h6>
                        <small class="text-muted">${new Date(t.date).toLocaleDateString('pt-BR')}</small>
                    </div>
                    <span class="badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}">
                        ${formatCurrency(t.amount)}
                    </span>
                </div>
            `).join('');
        } else {
            recentContainer.innerHTML = '<p class="text-muted text-center">Nenhuma transação encontrada.</p>';
        }
    }
}

// === FUNÇÕES DE TRANSAÇÕES ===

function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const tableBody = document.getElementById('transactionsBody');
    
    if (!tableBody) return;

    if (transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma transação encontrada.</td></tr>';
        return;
    }

    tableBody.innerHTML = transactions.map((t, index) => `
        <tr>
            <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>
                <span class="badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}">
                    ${formatCurrency(t.amount)}
                </span>
            </td>            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteTransaction(${t.id})" 
                        aria-label="Excluir transação ${t.description}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// === FUNÇÕES DE TRANSAÇÕES ===

let currentTransactionId = null;

function loadTransactionsPage() {
    loadTransactionsWithFilters();
    updateTransactionCount();
}

function showAddTransactionModal(type = '') {
    currentTransactionId = null;
    
    // Limpar formulário
    document.getElementById('transactionForm').reset();
    
    // Configurar modal para nova transação
    document.getElementById('transactionModalLabel').innerHTML = 
        '<i class="bi bi-plus-circle text-primary"></i> Nova Transação';
    
    // Pré-selecionar tipo se fornecido
    if (type) {
        document.getElementById('type').value = type;
        updateCategoryOptions(type);
    }
    
    // Definir data padrão como hoje
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    
    // Mostrar modal
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
}

function setupTransactionModal() {
    // Event listener para mudança de tipo
    document.getElementById('type').addEventListener('change', function() {
        updateCategoryOptions(this.value);
    });
    
    // Event listener para o formulário
    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTransaction();
    });
}

function updateCategoryOptions(type) {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Selecione a categoria</option>';
    
    let categories = [];
    
    if (type === 'expense') {
        categories = [
            'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 
            'Lazer', 'Compras', 'Serviços', 'Outros'
        ];
    } else if (type === 'income') {
        categories = [
            'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Outros'
        ];
    }
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function saveTransaction() {
    const formData = {
        id: currentTransactionId || Date.now(),
        description: document.getElementById('description').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    if (currentTransactionId) {
        // Editar transação existente
        const index = transactions.findIndex(t => t.id === currentTransactionId);
        if (index !== -1) {
            transactions[index] = formData;
        }
    } else {
        // Adicionar nova transação
        transactions.push(formData);
    }
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    // Fechar modal e atualizar lista
    bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
    loadTransactionsWithFilters();
    updateTransactionCount();
    
    showSuccessMessage(`Transação ${currentTransactionId ? 'atualizada' : 'adicionada'} com sucesso!`);
}

function editTransaction(id) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = transactions.find(t => t.id === id);
    
    if (!transaction) return;
    
    currentTransactionId = id;
    
    // Preencher formulário com dados da transação
    document.getElementById('description').value = transaction.description;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.type;
    document.getElementById('date').value = transaction.date;
    
    // Atualizar categorias e selecionar a categoria da transação
    updateCategoryOptions(transaction.type);
    document.getElementById('category').value = transaction.category;
    
    // Atualizar título do modal
    document.getElementById('transactionModalLabel').innerHTML = 
        '<i class="bi bi-pencil text-primary"></i> Editar Transação';
    
    // Mostrar modal
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
}

// === FUNÇÕES DE FILTROS ===

function applyFilters() {
    const filterType = document.getElementById('filterType')?.value;
    const filterCategory = document.getElementById('filterCategory')?.value;
    const filterMonth = document.getElementById('filterMonth')?.value;
    
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    let filtered = [...transactions];

    if (filterType) {
        filtered = filtered.filter(t => t.type === filterType);
    }
    if (filterCategory) {
        filtered = filtered.filter(t => t.category === filterCategory);
    }
    if (filterMonth) {
        filtered = filtered.filter(t => t.date.startsWith(filterMonth));
    }

    // Atualizar tabela com dados filtrados
    const tableBody = document.getElementById('transactionsBody');
    if (tableBody) {
        if (filtered.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma transação encontrada com os filtros aplicados.</td></tr>';
        } else {
            tableBody.innerHTML = filtered.map((t, index) => `
                <tr>
                    <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                    <td>${t.description}</td>
                    <td>${t.category}</td>
                    <td>
                        <span class="badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}">
                            ${formatCurrency(t.amount)}
                        </span>
                    </td>                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteTransaction(${t.id})" 
                                aria-label="Excluir transação ${t.description}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }
}

function clearFilters() {
    const filterType = document.getElementById('filterType');
    const filterCategory = document.getElementById('filterCategory');
    const filterMonth = document.getElementById('filterMonth');
    
    if (filterType) filterType.value = '';
    if (filterCategory) filterCategory.value = '';
    if (filterMonth) filterMonth.value = '';
    
    loadTransactions();
}

// === FUNÇÕES DE PREENCHIMENTO DE FORMULÁRIOS ===

function prefillSampleData() {
    // Preencher dados de exemplo no formulário de transação
    const descInput = document.getElementById('description');
    const amountInput = document.getElementById('amount');
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const dateInput = document.getElementById('date');
    
    if (descInput) descInput.value = 'Almoço no Restaurante';
    if (amountInput) amountInput.value = '45.50';
    if (typeSelect) typeSelect.value = 'expense';
    if (categorySelect) categorySelect.value = 'Alimentação';
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
}

// === INICIALIZAÇÃO ===

// Inicializar dados quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
    
    // Definir mês atual como padrão nos relatórios
    const reportMonth = document.getElementById('reportMonth');
    if (reportMonth) {
        const now = new Date();
        reportMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // Carregar dados específicos da página
    if (window.location.pathname.includes('dashboard')) {
        loadDashboard();
    } else if (window.location.pathname.includes('transactions') || window.location.pathname.includes('history')) {
        loadTransactions();
    } else if (window.location.pathname.includes('reports')) {
        generateReport();
    }
});

// Funções específicas para a página de histórico
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { column: null, direction: 'asc' };

function loadHistoryPage() {
    initializeSampleData();
    loadTransactionsWithFilters();
    updateTransactionCount();
}

function loadTransactionsWithFilters() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const filterType = document.getElementById('filterType')?.value || '';
    const filterCategory = document.getElementById('filterCategory')?.value || '';
    const filterMonth = document.getElementById('filterMonth')?.value || '';
    
    let filteredTransactions = transactions.filter(transaction => {
        const matchesType = !filterType || transaction.type === filterType;
        const matchesCategory = !filterCategory || transaction.category.toLowerCase().includes(filterCategory.toLowerCase());
        const matchesMonth = !filterMonth || transaction.date.startsWith(filterMonth);
        
        return matchesType && matchesCategory && matchesMonth;
    });
    
    // Aplicar ordenação se existir
    if (currentSort.column !== null) {
        filteredTransactions = sortTransactionsByColumn(filteredTransactions, currentSort.column, currentSort.direction);
    }
    
    displayTransactionsWithPagination(filteredTransactions);
    updatePaginationInfo(filteredTransactions.length);
}

function displayTransactionsWithPagination(transactions) {
    const tbody = document.getElementById('transactionsBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    if (paginatedTransactions.length === 0) {
        tbody.innerHTML = `
            <tr id="noTransactionsRow">
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox display-4 d-block mb-2" aria-hidden="true"></i>
                    <p class="mb-0">Nenhuma transação encontrada com os filtros aplicados.</p>
                    <small class="text-muted">Tente ajustar os filtros ou adicionar novas transações.</small>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedTransactions.map(transaction => `
        <tr data-transaction-id="${transaction.id}">
            <td>
                <i class="bi bi-calendar-event text-primary me-1" aria-hidden="true"></i>
                ${formatDate(transaction.date)}
            </td>
            <td>
                <strong>${transaction.description}</strong>
            </td>
            <td>
                <span class="badge bg-secondary">
                    ${getCategoryIcon(transaction.category)} ${transaction.category}
                </span>
            </td>
            <td>
                <span class="badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}">
                    <i class="bi ${transaction.type === 'income' ? 'bi-arrow-up' : 'bi-arrow-down'}" aria-hidden="true"></i>
                    ${transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
            </td>
            <td>
                <span class="fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount)}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group" aria-label="Ações da transação">
                    <button class="btn btn-outline-primary btn-sm" onclick="editTransaction(${transaction.id})" 
                            aria-label="Editar transação ${transaction.description}">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="confirmDeleteTransaction(${transaction.id})" 
                            aria-label="Excluir transação ${transaction.description}">
                        <i class="bi bi-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    generatePagination(transactions.length);
}

function sortTable(columnIndex) {
    const columns = ['date', 'description', 'category', 'type', 'amount'];
    const column = columns[columnIndex];
    
    if (currentSort.column === columnIndex) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = columnIndex;
        currentSort.direction = 'asc';
    }
    
    // Atualizar indicadores visuais de ordenação
    updateSortIndicators(columnIndex);
    
    loadTransactionsWithFilters();
}

function sortTransactionsByColumn(transactions, columnIndex, direction) {
    const columns = ['date', 'description', 'category', 'type', 'amount'];
    const sortBy = columns[columnIndex];
    
    return transactions.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Tratamento especial para datas e valores
        if (sortBy === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortBy === 'amount') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        } else {
            aValue = aValue.toString().toLowerCase();
            bValue = bValue.toString().toLowerCase();
        }
        
        if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}

function updateSortIndicators(activeColumn) {
    // Remover indicadores existentes
    document.querySelectorAll('th[aria-sort]').forEach(th => {
        th.setAttribute('aria-sort', 'none');
        const icon = th.querySelector('.bi-arrow-down-up');
        if (icon) {
            icon.className = 'bi bi-arrow-down-up ms-1';
        }
    });
    
    // Adicionar indicador na coluna ativa
    const headers = document.querySelectorAll('th[onclick]');
    if (headers[activeColumn]) {
        const direction = currentSort.direction;
        headers[activeColumn].setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
        
        const icon = headers[activeColumn].querySelector('.bi-arrow-down-up');
        if (icon) {
            icon.className = `bi ${direction === 'asc' ? 'bi-sort-up' : 'bi-sort-down'} ms-1`;
        }
    }
}

function generatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botão Anterior
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" 
               aria-label="Página anterior" ${currentPage === 1 ? 'tabindex="-1"' : ''}>
                <i class="bi bi-chevron-left" aria-hidden="true"></i>
            </a>
        </li>
    `;
    
    // Páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += '<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">1</a></li>';
        if (startPage > 2) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})" 
                   ${i === currentPage ? 'aria-current="page"' : ''}>${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">${totalPages}</a></li>`;
    }
    
    // Botão Próximo
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" 
               aria-label="Próxima página" ${currentPage === totalPages ? 'tabindex="-1"' : ''}>
                <i class="bi bi-chevron-right" aria-hidden="true"></i>
            </a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(getTotalFilteredTransactions() / itemsPerPage)) {
        return;
    }
    currentPage = page;
    loadTransactionsWithFilters();
}

function getTotalFilteredTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const filterType = document.getElementById('filterType')?.value || '';
    const filterCategory = document.getElementById('filterCategory')?.value || '';
    const filterMonth = document.getElementById('filterMonth')?.value || '';
    
    return transactions.filter(transaction => {
        const matchesType = !filterType || transaction.type === filterType;
        const matchesCategory = !filterCategory || transaction.category.toLowerCase().includes(filterCategory.toLowerCase());
        const matchesMonth = !filterMonth || transaction.date.startsWith(filterMonth);
        
        return matchesType && matchesCategory && matchesMonth;
    }).length;
}

function updatePaginationInfo(totalItems) {
    const paginationInfo = document.getElementById('paginationInfo');
    const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    if (paginationInfo) {
        paginationInfo.textContent = `Mostrando ${startItem} - ${endItem} de ${totalItems} transações`;
    }
}

function updateTransactionCount() {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const transactionCount = document.getElementById('transactionCount');
    
    if (transactionCount) {
        transactionCount.textContent = `Total: ${transactions.length} transações`;
    }
}

function applyFilters() {
    currentPage = 1; // Reset para primeira página
    loadTransactionsWithFilters();
    
    // Anunciar para leitores de tela
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = 'Filtros aplicados. Resultados atualizados.';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterMonth').value = '';
    
    currentPage = 1;
    currentSort = { column: null, direction: 'asc' };
    
    loadTransactionsWithFilters();
    
    // Anunciar para leitores de tela
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'visually-hidden';
    announcement.textContent = 'Filtros removidos. Todas as transações são exibidas.';
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

function confirmDeleteTransaction(id) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    confirmBtn.onclick = () => {
        deleteTransaction(id);
        modal.hide();
    };
    
    modal.show();
}

function deleteTransaction(id) {
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    const updatedTransactions = transactions.filter(t => t.id !== id);
    
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    loadTransactionsWithFilters();
    updateTransactionCount();
      showSuccessMessage('Transação excluída com sucesso!');
}

function getCategoryIcon(category) {
    const icons = {
        'Alimentação': '<i class="bi bi-basket" aria-hidden="true"></i>',
        'Transporte': '<i class="bi bi-car-front" aria-hidden="true"></i>',
        'Moradia': '<i class="bi bi-house" aria-hidden="true"></i>',
        'Saúde': '<i class="bi bi-heart-pulse" aria-hidden="true"></i>',
        'Educação': '<i class="bi bi-book" aria-hidden="true"></i>',
        'Lazer': '<i class="bi bi-controller" aria-hidden="true"></i>',
        'Compras': '<i class="bi bi-bag-check" aria-hidden="true"></i>',
        'Serviços': '<i class="bi bi-tools" aria-hidden="true"></i>',
        'Salário': '<i class="bi bi-currency-dollar" aria-hidden="true"></i>',
        'Freelance': '<i class="bi bi-laptop" aria-hidden="true"></i>',
        'Investimentos': '<i class="bi bi-graph-up-arrow" aria-hidden="true"></i>',
        'Contas': '<i class="bi bi-receipt" aria-hidden="true"></i>',
        'Extra': '<i class="bi bi-plus-circle" aria-hidden="true"></i>',
        'Outros': '<i class="bi bi-three-dots" aria-hidden="true"></i>'
    };
    
    return icons[category] || '<i class="bi bi-tag" aria-hidden="true"></i>';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}