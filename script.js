// Inicializa o jsPDF
const { jsPDF } = window.jspdf;

// Classe principal do aplicativo
class DiariaControlPro {
  constructor() {
    this.funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    this.diarias = JSON.parse(localStorage.getItem('diarias')) || [];
    this.despesas = JSON.parse(localStorage.getItem('despesas')) || [];
    this.currentDate = new Date(); // Usado para navegação do calendário
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.reportChart = null; // Instância do Chart.js
    this.selectedDiariaId = null; // Para editar diária específica

    this.initElements();
    this.initEventListeners();
    this.initApp();
  }

  // Inicializa elementos DOM
  initElements() {
    this.elements = {
      // Formulários
      employeeForm: document.getElementById('employeeForm'),
      funcNome: document.getElementById('funcNome'),
      funcCpf: document.getElementById('funcCpf'),
      funcCargo: document.getElementById('funcCargo'),
      funcDiaria: document.getElementById('funcDiaria'),
      feedbackFuncNome: document.getElementById('feedbackFuncNome'),
      feedbackFuncCpf: document.getElementById('feedbackFuncCpf'),
      feedbackFuncCargo: document.getElementById('feedbackFuncCargo'),
      feedbackFuncDiaria: document.getElementById('feedbackFuncDiaria'),

      expenseForm: document.getElementById('expenseForm'),
      despesaFuncionarioSelect: document.getElementById('despesaFuncionario'),
      despesaDesc: document.getElementById('despesaDesc'),
      despesaValor: document.getElementById('despesaValor'),
      despesaData: document.getElementById('despesaData'),
      despesaCategoria: document.getElementById('despesaCategoria'),
      feedbackDespesaFuncionario: document.getElementById('feedbackDespesaFuncionario'),
      feedbackDespesaDesc: document.getElementById('feedbackDespesaDesc'),
      feedbackDespesaValor: document.getElementById('feedbackDespesaValor'),
      feedbackDespesaData: document.getElementById('feedbackDespesaData'),
      feedbackDespesaCategoria: document.getElementById('feedbackDespesaCategoria'),


      reportForm: document.getElementById('reportForm'),
      reportPeriodo: document.getElementById('reportPeriodo'),
      reportStartGroup: document.getElementById('reportStartGroup'),
      reportEndGroup: document.getElementById('reportEndGroup'),
      reportStart: document.getElementById('reportStart'),
      reportEnd: document.getElementById('reportEnd'),
      reportFuncionario: document.getElementById('reportFuncionario'),
      feedbackReportStart: document.getElementById('feedbackReportStart'),
      feedbackReportEnd: document.getElementById('feedbackReportEnd'),
      

      diariaFormModal: document.getElementById('diariaFormModal'),
      modalDiariaFuncionario: document.getElementById('modalDiariaFuncionario'),
      modalDiariaData: document.getElementById('modalDiariaData'),
      modalDiariaValor: document.getElementById('modalDiariaValor'),
      modalDiariaDescricao: document.getElementById('modalDiariaDescricao'),
      feedbackModalDiariaFuncionario: document.getElementById('feedbackModalDiariaFuncionario'),
      feedbackModalDiariaData: document.getElementById('feedbackModalDiariaData'),
      feedbackModalDiariaValor: document.getElementById('feedbackModalDiariaValor'),
      feedbackModalDiariaDescricao: document.getElementById('feedbackModalDiariaDescricao'),


      // Tabelas
      funcionariosTable: document.querySelector('#funcionariosTable tbody'),
      diariasTable: document.querySelector('#diariasTable tbody'),
      despesasTable: document.querySelector('#despesasTable tbody'),
      reportTable: document.querySelector('#reportTable tbody'),

      // Elementos do dashboard
      daysWorked: document.getElementById('daysWorked'),
      totalDiarias: document.getElementById('totalDiarias'),
      totalDespesas: document.getElementById('totalDespesas'),
      valorLiquido: document.getElementById('valorLiquido'),
      currentMonthDisplay: document.getElementById('currentMonth'),
      mainCalendar: document.getElementById('mainCalendar'),

      // Elementos do relatório
      reportChartCanvas: document.getElementById('reportChart'),
      
      // Elementos do holerite
      holeriteContent: document.getElementById('holeriteContent'),
      holeritePeriodo: document.getElementById('holeritePeriodo'),
      holeriteFuncionario: document.getElementById('holeriteFuncionario'),
      holeriteCargo: document.getElementById('holeriteCargo'),
      holeriteCpf: document.getElementById('holeriteCpf'),
      holeriteValorDiaria: document.getElementById('holeriteValorDiaria'),
      holeriteDataEmissao: document.getElementById('holeriteDataEmissao'),
      holeriteDetalhes: document.getElementById('holeriteDetalhes'),
      holeriteTotal: document.getElementById('holeriteTotal'),
      
      // Modal de Diária
      diariaModal: document.getElementById('diariaModal'),
      modalTitle: document.getElementById('modalTitle'),
      closeModalButton: document.querySelector('#diariaModal .close-button'),
      deleteDiariaModalButton: document.getElementById('deleteDiariaModal'),

      // Alertas - Nomes alterados para serem específicos de cada aba
      alertDashboardSuccess: document.getElementById('alertDashboardSuccess'),
      alertDashboardError: document.getElementById('alertDashboardError'),
      alertFuncionariosSuccess: document.getElementById('alertFuncionariosSuccess'),
      alertFuncionariosError: document.getElementById('alertFuncionariosError'),
      alertDiariasSuccess: document.getElementById('alertDiariasSuccess'),
      alertDiariasError: document.getElementById('alertDiariasError'),
      alertDespesasSuccess: document.getElementById('alertDespesasSuccess'),
      alertDespesasError: document.getElementById('alertDespesasError')
    };
  }

  // Inicializa event listeners
  initEventListeners() {
    // Navegação por abas
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });

    // Formulários
    this.elements.employeeForm.addEventListener('submit', (e) => this.handleEmployeeSubmit(e));
    this.elements.expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
    this.elements.reportForm.addEventListener('submit', (e) => this.handleReportSubmit(e));
    this.elements.diariaFormModal.addEventListener('submit', (e) => this.handleDiariaModalSubmit(e));

    // Botões
    document.getElementById('btnPrint').addEventListener('click', () => this.handlePrintHolerite());
    this.elements.deleteDiariaModalButton.addEventListener('click', () => this.deleteDiaria(this.selectedDiariaId, true)); 

    // Controles de Período do Relatório
    this.elements.reportPeriodo.addEventListener('change', () => this.toggleCustomDateInputs());

    // Navegação do Calendário
    document.getElementById('prevMonth').addEventListener('click', () => this.navigateCalendar(-1));
    document.getElementById('nextMonth').addEventListener('click', () => this.navigateCalendar(1));

    // Fechar Modal
    this.elements.closeModalButton.addEventListener('click', () => this.closeDiariaModal());
    window.addEventListener('click', (event) => {
        if (event.target === this.elements.diariaModal) {
            this.closeDiariaModal();
        }
    });

    // Adicionar eventos de input/change para validação em tempo real (opcional)
    this.elements.funcNome.addEventListener('input', () => this.validateInput(this.elements.funcNome, this.elements.feedbackFuncNome, this.elements.funcNome.value.trim() !== '', 'Nome é obrigatório.'));
    this.elements.funcCpf.addEventListener('input', () => this.validateInput(this.elements.funcCpf, this.elements.feedbackFuncCpf, this.validateCpf(this.elements.funcCpf.value), 'CPF inválido ou já cadastrado.'));
    this.elements.funcCargo.addEventListener('input', () => this.validateInput(this.elements.funcCargo, this.elements.feedbackFuncCargo, this.elements.funcCargo.value.trim() !== '', 'Cargo é obrigatório.'));
    this.elements.funcDiaria.addEventListener('input', () => this.validateInput(this.elements.funcDiaria, this.elements.feedbackFuncDiaria, parseFloat(this.elements.funcDiaria.value) > 0, 'Valor da diária deve ser maior que zero.'));

    this.elements.despesaFuncionarioSelect.addEventListener('change', () => this.validateInput(this.elements.despesaFuncionarioSelect, this.elements.feedbackDespesaFuncionario, this.elements.despesaFuncionarioSelect.value !== '', 'Selecione um funcionário.'));
    this.elements.despesaDesc.addEventListener('input', () => this.validateInput(this.elements.despesaDesc, this.elements.feedbackDespesaDesc, this.elements.despesaDesc.value.trim() !== '', 'Descrição é obrigatória.'));
    this.elements.despesaValor.addEventListener('input', () => this.validateInput(this.elements.despesaValor, this.elements.feedbackDespesaValor, parseFloat(this.elements.despesaValor.value) > 0, 'Valor deve ser maior que zero.'));
    this.elements.despesaData.addEventListener('change', () => this.validateInput(this.elements.despesaData, this.elements.feedbackDespesaData, this.elements.despesaData.value !== '', 'Data é obrigatória.'));
    this.elements.despesaCategoria.addEventListener('change', () => this.validateInput(this.elements.despesaCategoria, this.elements.feedbackDespesaCategoria, this.elements.despesaCategoria.value !== '', 'Categoria é obrigatória.'));

    this.elements.modalDiariaFuncionario.addEventListener('change', () => this.validateInput(this.elements.modalDiariaFuncionario, this.elements.feedbackModalDiariaFuncionario, this.elements.modalDiariaFuncionario.value !== '', 'Selecione um funcionário.'));
    this.elements.modalDiariaValor.addEventListener('input', () => this.validateInput(this.elements.modalDiariaValor, this.elements.feedbackModalDiariaValor, parseFloat(this.elements.modalDiariaValor.value) > 0, 'Valor da diária deve ser maior que zero.'));
  }

  // Inicializa o aplicativo
  initApp() {
    // Configurar data atual nos formulários
    const today = new Date().toISOString().split('T')[0];
    this.elements.despesaData.value = today;
    this.elements.reportStart.value = today;
    this.elements.reportEnd.value = today;

    // Atualizar exibições iniciais
    this.updateFuncionariosTable();
    this.updateFuncionariosSelects(); 
    this.updateDiariasTable();
    this.updateDespesasTable();
    this.updateDashboard();
    this.updateCalendarDisplay();
  }

  // Salva dados no localStorage
  saveData() {
    localStorage.setItem('funcionarios', JSON.stringify(this.funcionarios));
    localStorage.setItem('diarias', JSON.stringify(this.diarias));
    localStorage.setItem('despesas', JSON.stringify(this.despesas));
    this.updateDashboard(); 
  }

  // Funções de Utilitário
  showAlert(type, message, tabId = '') {
    const alertElement = this.elements[`alert${tabId}Success`] || this.elements[`alert${tabId}Error`];
    if (alertElement) { 
        alertElement.className = `alert alert-${type.toLowerCase()}`;
        alertElement.textContent = message;
        alertElement.style.display = 'block';
        
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    } else {
        console.warn(`Alerta para aba '${tabId}' e tipo '${type}' não encontrado.`);
    }
  }

  formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }
  
  formatDateForInput(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Função de validação genérica para campos de formulário
  validateInput(inputElement, feedbackElement, condition, message) {
    if (condition) {
        inputElement.classList.remove('is-invalid');
        feedbackElement.style.display = 'none';
        feedbackElement.textContent = '';
        return true;
    } else {
        inputElement.classList.add('is-invalid');
        feedbackElement.style.display = 'block';
        feedbackElement.textContent = message;
        return false;
    }
  }

  // Validação de CPF (formato e dígitos verificadores)
  validateCpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) { // Verifica tamanho e sequência de dígitos iguais
        return false;
    }

    let sum = 0;
    let remainder;

    // Validação do primeiro dígito
    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(9, 10))) {
        return false;
    }

    sum = 0;
    // Validação do segundo dígito
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) {
        remainder = 0;
    }
    if (remainder !== parseInt(cpf.substring(10, 11))) {
        return false;
    }

    // Verifica se o CPF já está cadastrado (ignora o próprio CPF se estiver editando)
    const currentCpfInput = this.elements.funcCpf; // Obtém o campo de CPF atual
    const isEditing = currentCpfInput.dataset.editingId; // Se houver um ID, está editando

    const cpfExists = this.funcionarios.some(f => {
        if (isEditing && f.id == isEditing) { // Se estiver editando, não compare com o próprio CPF
            return false;
        }
        return f.cpf === cpf;
    });

    return !cpfExists; // Retorna true se o CPF for válido E não existir (ou for o mesmo que está sendo editado)
  }

  // Atualiza selects de funcionários em todos os lugares
  updateFuncionariosSelects() {
    const selects = [
      this.elements.reportFuncionario,
      this.elements.despesaFuncionarioSelect,
      this.elements.modalDiariaFuncionario 
    ];
    
    selects.forEach(select => {
      const selectedValue = select.value; 
      const defaultOptionText = select.id === 'reportFuncionario' ? 'Todos' : 'Selecione um funcionário...';
      
      // Limpar todas as options e adicionar a opção padrão
      select.innerHTML = `<option value="">${defaultOptionText}</option>`;
      
      this.funcionarios.forEach(func => {
        const option = document.createElement('option');
        option.value = func.id;
        option.textContent = `${func.nome} (${func.cargo})`;
        select.appendChild(option);
      });
      
      if (selectedValue && this.funcionarios.some(f => f.id == selectedValue)) {
        select.value = selectedValue;
      } else if (this.funcionarios.length > 0 && select.id !== 'reportFuncionario') {
        // Pré-seleciona o primeiro funcionário se não houver um selecionado e não for o relatório
        select.value = this.funcionarios[0].id;
      }
    });
  }

  // Atualiza a tabela de funcionários
  updateFuncionariosTable() {
    const tbody = this.elements.funcionariosTable;
    tbody.innerHTML = '';
    
    this.funcionarios.forEach(func => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${func.nome}</td>
        <td>${func.cpf}</td>
        <td>${func.cargo}</td>
        <td>${this.formatCurrency(func.diaria)}</td>
        <td>
          <button onclick="app.deleteFuncionario(${func.id})" class="btn btn-sm btn-danger">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Deleta funcionário
  deleteFuncionario(id) {
    if (confirm('Tem certeza que deseja remover este funcionário? Todas as diárias e despesas relacionadas a ele também serão removidas.')) {
      this.funcionarios = this.funcionarios.filter(f => f.id !== id);
      this.diarias = this.diarias.filter(d => d.funcionarioId !== id);
      this.despesas = this.despesas.filter(d => d.funcionarioId !== id); 
      this.saveData();
      this.showAlert('Success', 'Funcionário removido com sucesso!', 'Funcionarios');
      this.updateFuncionariosTable();
      this.updateFuncionariosSelects();
      this.updateDiariasTable();
      this.updateDespesasTable();
      this.generateCalendar(this.currentYear, this.currentMonth); 
    }
  }

  // Atualiza a tabela de diárias
  updateDiariasTable() {
    const tbody = this.elements.diariasTable;
    tbody.innerHTML = '';
    
    const diariasOrdenadas = [...this.diarias].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    diariasOrdenadas.forEach(diaria => {
      const func = this.funcionarios.find(f => f.id === diaria.funcionarioId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${this.formatDate(diaria.data)}</td>
        <td>${func ? func.nome : 'N/A'}</td>
        <td>${this.formatCurrency(diaria.valor)}</td>
        <td>${diaria.descricao || '-'}</td>
        <td><span class="badge badge-success">${diaria.status || 'Pago'}</span></td>
        <td>
          <button onclick="app.editDiaria(${diaria.id})" class="btn btn-sm btn-primary">Editar</button>
          <button onclick="app.deleteDiaria(${diaria.id})" class="btn btn-sm btn-danger">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Abre o modal para editar uma diária existente
  editDiaria(id) {
    const diaria = this.diarias.find(d => d.id === id);
    if (!diaria) {
      this.showAlert('Error', 'Diária não encontrada!', 'Diarias');
      return;
    }

    this.selectedDiariaId = id;
    this.elements.modalTitle.textContent = 'Editar Diária';
    this.elements.modalDiariaFuncionario.value = diaria.funcionarioId;
    this.elements.modalDiariaData.value = diaria.data;
    this.elements.modalDiariaValor.value = diaria.valor;
    this.elements.modalDiariaDescricao.value = diaria.descricao || '';
    this.elements.deleteDiariaModalButton.style.display = 'inline-flex'; 
    this.openDiariaModal();
  }

  // Deleta diária (pode ser chamada do calendário ou da tabela)
  deleteDiaria(id, fromModal = false) {
    if (confirm('Tem certeza que deseja excluir esta diária?')) {
      this.diarias = this.diarias.filter(d => d.id !== id);
      this.saveData();
      this.showAlert('Success', 'Diária excluída com sucesso!', fromModal ? 'Dashboard' : 'Diarias'); 
      this.updateDiariasTable();
      this.updateDashboard();
      this.generateCalendar(this.currentYear, this.currentMonth);
      if (fromModal) {
        this.closeDiariaModal();
      }
    }
  }

  // Atualiza a tabela de despesas
  updateDespesasTable() {
    const tbody = this.elements.despesasTable;
    tbody.innerHTML = '';
    
    const despesasOrdenadas = [...this.despesas].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    despesasOrdenadas.forEach(despesa => {
      const func = this.funcionarios.find(f => f.id === despesa.funcionarioId);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${this.formatDate(despesa.data)}</td>
        <td>${func ? func.nome : 'N/A'}</td>
        <td>${despesa.descricao}</td>
        <td>${despesa.categoria}</td>
        <td>${this.formatCurrency(despesa.valor)}</td>
        <td>
          <button onclick="app.deleteDespesa(${despesa.id})" class="btn btn-sm btn-danger">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Deleta despesa
  deleteDespesa(id) {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      this.despesas = this.despesas.filter(d => d.id !== id);
      this.saveData();
      this.showAlert('Success', 'Despesa excluída com sucesso!', 'Despesas');
      this.updateDespesasTable();
      this.updateDashboard();
    }
  }

  // Atualiza o dashboard
  updateDashboard() {
    const diariasMes = this.diarias.filter(d => {
      const date = new Date(d.data);
      return date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear;
    });

    const despesasMes = this.despesas.filter(d => {
      const date = new Date(d.data);
      return date.getMonth() === this.currentMonth && date.getFullYear() === this.currentYear;
    });

    const totalDiarias = diariasMes.reduce((sum, d) => sum + d.valor, 0);
    const totalDespesas = despesasMes.reduce((sum, d) => sum + d.valor, 0);
    const totalLiquido = totalDiarias - totalDespesas;

    this.elements.daysWorked.textContent = diariasMes.length;
    this.elements.totalDiarias.textContent = this.formatCurrency(totalDiarias);
    this.elements.totalDespesas.textContent = this.formatCurrency(totalDespesas);
    this.elements.valorLiquido.textContent = this.formatCurrency(totalLiquido);
  }

  // Gera o calendário
  generateCalendar(year, month) {
    const calendarEl = this.elements.mainCalendar;
    calendarEl.innerHTML = '';
    
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    daysOfWeek.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarEl.appendChild(dayHeader);
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); 

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarEl.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = this.formatDateForInput(date); 
      
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayEl.classList.add('current');
      }
      
      const hasDiaria = this.diarias.some(d => d.data === dateStr);
      if (hasDiaria) {
          dayEl.classList.add('worked');
      }
      
      dayEl.innerHTML = `<div class="calendar-day-number">${day}</div>`;
      
      dayEl.addEventListener('click', () => this.openDiariaModalForDay(date));
      
      calendarEl.appendChild(dayEl);
    }
  }

  // Abre o modal de diária preenchendo com os dados do dia ou padrão
  openDiariaModalForDay(date) {
    if (this.funcionarios.length === 0) {
        this.showAlert('Error', 'Para registrar uma diária, você precisa cadastrar pelo menos um funcionário primeiro!', 'Dashboard');
        return; 
    }

    // Limpa feedbacks de validação anteriores do modal
    this.validateInput(this.elements.modalDiariaFuncionario, this.elements.feedbackModalDiariaFuncionario, true, '');
    this.validateInput(this.elements.modalDiariaValor, this.elements.feedbackModalDiariaValor, true, '');
    this.validateInput(this.elements.modalDiariaDescricao, this.elements.feedbackModalDiariaDescricao, true, '');


    const dateStr = this.formatDateForInput(date);
    const existingDiaria = this.diarias.find(d => d.data === dateStr);

    this.selectedDiariaId = null; 
    this.elements.modalDiariaData.value = dateStr;
    this.elements.deleteDiariaModalButton.style.display = 'none'; 

    if (existingDiaria) {
        this.selectedDiariaId = existingDiaria.id;
        this.elements.modalTitle.textContent = 'Editar Diária';
        this.elements.modalDiariaFuncionario.value = existingDiaria.funcionarioId;
        this.elements.modalDiariaValor.value = existingDiaria.valor;
        this.elements.modalDiariaDescricao.value = existingDiaria.descricao || '';
        this.elements.deleteDiariaModalButton.style.display = 'inline-flex';
    } else {
        this.elements.modalTitle.textContent = 'Registrar Diária';
        this.elements.modalDiariaFuncionario.value = this.funcionarios[0]?.id || ''; 
        this.elements.modalDiariaValor.value = this.funcionarios[0]?.diaria || 0; 
        this.elements.modalDiariaDescricao.value = '';
    }
    this.openDiariaModal();
  }

  // Abre o modal
  openDiariaModal() {
    this.elements.diariaModal.style.display = 'flex'; 
  }

  // Fecha o modal
  closeDiariaModal() {
    this.elements.diariaModal.style.display = 'none';
    this.elements.diariaFormModal.reset(); 
    this.selectedDiariaId = null; 

    // Oculta feedbacks de validação ao fechar o modal
    this.validateInput(this.elements.modalDiariaFuncionario, this.elements.feedbackModalDiariaFuncionario, true, '');
    this.validateInput(this.elements.modalDiariaValor, this.elements.feedbackModalDiariaValor, true, '');
    this.validateInput(this.elements.modalDiariaDescricao, this.elements.feedbackModalDiariaDescricao, true, '');
  }

  // Lida com o envio do formulário do modal de diária
  handleDiariaModalSubmit(e) {
    e.preventDefault();

    const funcionarioId = parseInt(this.elements.modalDiariaFuncionario.value);
    const data = this.elements.modalDiariaData.value;
    const valor = parseFloat(this.elements.modalDiariaValor.value);
    const descricao = this.elements.modalDiariaDescricao.value.trim();

    // Validação
    const isFuncionarioValid = this.validateInput(this.elements.modalDiariaFuncionario, this.elements.feedbackModalDiariaFuncionario, funcionarioId > 0, 'Selecione um funcionário.');
    const isValorValid = this.validateInput(this.elements.modalDiariaValor, this.elements.feedbackModalDiariaValor, valor > 0, 'Valor da diária deve ser maior que zero.');
    
    if (!isFuncionarioValid || !isValorValid) {
        this.showAlert('Error', 'Preencha todos os campos obrigatórios do modal corretamente.', 'Dashboard');
        return;
    }

    if (this.selectedDiariaId) {
        const index = this.diarias.findIndex(d => d.id === this.selectedDiariaId);
        if (index !== -1) {
            this.diarias[index] = {
                ...this.diarias[index],
                funcionarioId: funcionarioId,
                data: data,
                valor: valor,
                descricao: descricao,
                status: 'Pago' 
            };
            this.showAlert('Success', 'Diária atualizada com sucesso!', 'Dashboard');
        }
    } else {
        const novaDiaria = {
            id: Date.now(),
            funcionarioId: funcionarioId,
            data: data,
            valor: valor,
            descricao: descricao,
            status: 'Pago'
        };
        this.diarias.push(novaDiaria);
        this.showAlert('Success', 'Diária registrada com sucesso!', 'Dashboard');
    }

    this.saveData();
    this.closeDiariaModal();
    this.generateCalendar(this.currentYear, this.currentMonth);
    this.updateDiariasTable();
  }

  // Atualiza o gráfico de pizza
  updateChart(data) {
    const ctx = this.elements.reportChartCanvas.getContext('2d');
    
    if (this.reportChart) {
      this.reportChart.destroy();
    }
    
    this.reportChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Total Diárias', 'Total Despesas'],
        datasets: [{
          data: [data.totalDiarias, data.totalDespesas],
          backgroundColor: [
            'var(--success)', 
            'var(--danger)'   
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${app.formatCurrency(value)}`; 
              }
            }
          }
        }
      }
    });
  }

  // Gera o holerite
  generateHolerite(funcionarioId, periodo) {
    const funcionario = this.funcionarios.find(f => f.id == funcionarioId);
    if (!funcionario) {
      this.showAlert('Error', 'Selecione um funcionário válido para gerar o holerite!', 'Dashboard');
      return;
    }

    let startDate, endDate;
    const today = new Date();
    
    switch(periodo) {
      case 'this_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'semester':
        const semester = Math.floor(today.getMonth() / 6);
        startDate = new Date(today.getFullYear(), semester * 6, 1);
        endDate = new Date(today.getFullYear(), semester * 6 + 6, 0);
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      case 'custom':
        startDate = new Date(this.elements.reportStart.value);
        endDate = new Date(this.elements.reportEnd.value);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            this.showAlert('Error', 'Selecione um período personalizado válido.', 'Relatorios');
            return;
        }
        break;
    }
    
    // Normalizar datas para comparação correta (ignora hora)
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const diariasFunc = this.diarias.filter(d => {
      if (d.funcionarioId !== funcionario.id) return false;
      const date = new Date(d.data);
      const dOnlyDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return dOnlyDate >= startDate && dOnlyDate <= endDate;
    });
    
    const despesasFunc = this.despesas.filter(d => {
      if (d.funcionarioId !== funcionario.id) return false;
      const date = new Date(d.data);
      const dOnlyDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return dOnlyDate >= startDate && dOnlyDate <= endDate;
    });

    const totalDiarias = diariasFunc.reduce((sum, d) => sum + d.valor, 0);
    const totalDespesas = despesasFunc.reduce((sum, d) => sum + d.valor, 0);
    const totalLiquido = totalDiarias - totalDespesas;

    this.elements.holeriteFuncionario.textContent = funcionario.nome;
    this.elements.holeriteCargo.textContent = funcionario.cargo;
    this.elements.holeriteCpf.textContent = funcionario.cpf;
    this.elements.holeriteValorDiaria.textContent = this.formatCurrency(funcionario.diaria);
    this.elements.holeriteDataEmissao.textContent = `Data de emissão: ${this.formatDate(new Date())}`;
    
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                     "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    let periodoText;
    if (periodo === 'this_month') {
        periodoText = `Período: ${monthNames[today.getMonth()]} de ${today.getFullYear()}`;
    } else if (periodo === 'last_month') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        periodoText = `Período: ${monthNames[lastMonth.getMonth()]} de ${lastMonth.getFullYear()}`;
    } else {
        periodoText = `Período: ${this.formatDate(startDate)} a ${this.formatDate(endDate)}`;
    }
    this.elements.holeritePeriodo.textContent = periodoText;
    
    const detalhesBody = this.elements.holeriteDetalhes;
    detalhesBody.innerHTML = '';
    
    const todosLancamentos = [
        ...diariasFunc.map(d => ({ ...d, tipo: 'diaria', displayValor: this.formatCurrency(d.valor) })),
        ...despesasFunc.map(d => ({ ...d, tipo: 'despesa', displayValor: `- ${this.formatCurrency(d.valor)}` }))
    ].sort((a, b) => new Date(a.data) - new Date(b.data));

    todosLancamentos.forEach(item => {
        const tr = document.createElement('tr');
        let descricaoDisplay = item.tipo === 'diaria' ? 
                               'Diária trabalhada' + (item.descricao ? ` (${item.descricao})` : '') :
                               `${item.descricao} (${item.categoria})`;

        tr.innerHTML = `
            <td>${this.formatDate(item.data)}</td>
            <td>${descricaoDisplay}</td>
            <td>${item.displayValor}</td>
        `;
        detalhesBody.appendChild(tr);
    });
    
    this.elements.holeriteTotal.textContent = this.formatCurrency(totalLiquido);

    this.generatePDF();
  }

  // Gera PDF do holerite
  generatePDF() {
    const holeriteElement = this.elements.holeriteContent;
    
    holeriteElement.style.display = 'block';
    
    html2canvas(holeriteElement, {
      scale: 2, 
      logging: false,
      useCORS: true,
      allowTaint: true 
    }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; 
      const pageHeight = 295; 
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - pageHeight; 
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`holerite-${Date.now()}.pdf`);
      
      holeriteElement.style.display = 'none';
    });
  }

  // Handlers de formulários
  handleEmployeeSubmit(e) {
    e.preventDefault();
    
    const nome = this.elements.funcNome.value.trim();
    const cpf = this.elements.funcCpf.value.trim();
    const cargo = this.elements.funcCargo.value.trim();
    const diaria = parseFloat(this.elements.funcDiaria.value);

    // Resetar validações anteriores
    this.validateInput(this.elements.funcNome, this.elements.feedbackFuncNome, true, '');
    this.validateInput(this.elements.funcCpf, this.elements.feedbackFuncCpf, true, '');
    this.validateInput(this.elements.funcCargo, this.elements.feedbackFuncCargo, true, '');
    this.validateInput(this.elements.funcDiaria, this.elements.feedbackFuncDiaria, true, '');

    // Validações
    let isValid = true;
    if (!this.validateInput(this.elements.funcNome, this.elements.feedbackFuncNome, nome !== '', 'Nome é obrigatório.')) isValid = false;
    if (!this.validateInput(this.elements.funcCpf, this.elements.feedbackFuncCpf, this.validateCpf(cpf), 'CPF inválido ou já cadastrado.')) isValid = false;
    if (!this.validateInput(this.elements.funcCargo, this.elements.feedbackFuncCargo, cargo !== '', 'Cargo é obrigatório.')) isValid = false;
    if (!this.validateInput(this.elements.funcDiaria, this.elements.feedbackFuncDiaria, diaria > 0, 'Valor da diária deve ser maior que zero.')) isValid = false;

    if (!isValid) {
        this.showAlert('Error', 'Por favor, corrija os erros no formulário de funcionário.', 'Funcionarios');
        return;
    }

    const novoFuncionario = {
      id: Date.now(),
      nome,
      cpf,
      cargo,
      diaria
    };
    
    this.funcionarios.push(novoFuncionario);
    this.saveData();
    
    this.elements.employeeForm.reset();
    
    this.showAlert('Success', 'Funcionário cadastrado com sucesso!', 'Funcionarios');
    this.updateFuncionariosTable();
    this.updateFuncionariosSelects();
  }

  handleExpenseSubmit(e) {
    e.preventDefault();
    
    if (this.funcionarios.length === 0) {
      this.showAlert('Error', 'Cadastre um funcionário primeiro para registrar despesas!', 'Despesas');
      return;
    }

    const funcionarioId = parseInt(this.elements.despesaFuncionarioSelect.value);
    const descricao = this.elements.despesaDesc.value.trim();
    const valor = parseFloat(this.elements.despesaValor.value);
    const data = this.elements.despesaData.value;
    const categoria = this.elements.despesaCategoria.value;

    // Resetar validações anteriores
    this.validateInput(this.elements.despesaFuncionarioSelect, this.elements.feedbackDespesaFuncionario, true, '');
    this.validateInput(this.elements.despesaDesc, this.elements.feedbackDespesaDesc, true, '');
    this.validateInput(this.elements.despesaValor, this.elements.feedbackDespesaValor, true, '');
    this.validateInput(this.elements.despesaData, this.elements.feedbackDespesaData, true, '');
    this.validateInput(this.elements.despesaCategoria, this.elements.feedbackDespesaCategoria, true, '');

    // Validações
    let isValid = true;
    if (!this.validateInput(this.elements.despesaFuncionarioSelect, this.elements.feedbackDespesaFuncionario, funcionarioId > 0, 'Selecione um funcionário.')) isValid = false;
    if (!this.validateInput(this.elements.despesaDesc, this.elements.feedbackDespesaDesc, descricao !== '', 'Descrição é obrigatória.')) isValid = false;
    if (!this.validateInput(this.elements.despesaValor, this.elements.feedbackDespesaValor, valor > 0, 'Valor deve ser maior que zero.')) isValid = false;
    if (!this.validateInput(this.elements.despesaData, this.elements.feedbackDespesaData, data !== '', 'Data é obrigatória.')) isValid = false;
    if (!this.validateInput(this.elements.despesaCategoria, this.elements.feedbackDespesaCategoria, categoria !== '', 'Categoria é obrigatória.')) isValid = false;

    if (!isValid) {
        this.showAlert('Error', 'Por favor, corrija os erros no formulário de despesa.', 'Despesas');
        return;
    }
            
    const novaDespesa = {
      id: Date.now(),
      funcionarioId, 
      descricao,
      valor,
      data,
      categoria
    };
    
    this.despesas.push(novaDespesa);
    this.saveData();
    
    this.elements.expenseForm.reset();
    this.elements.despesaData.value = this.formatDateForInput(new Date()); 
    this.elements.despesaFuncionarioSelect.value = this.funcionarios[0]?.id || ''; // Reseta para o primeiro func ou vazio
    
    this.showAlert('Success', 'Despesa registrada com sucesso!', 'Despesas');
    this.updateDespesasTable();
  }

  handleReportSubmit(e) {
    e.preventDefault();
    
    const periodo = this.elements.reportPeriodo.value;
    const funcionarioId = this.elements.reportFuncionario.value;
    let startDate, endDate;

    // Resetar validações de relatório
    this.validateInput(this.elements.reportStart, this.elements.feedbackReportStart, true, '');
    this.validateInput(this.elements.reportEnd, this.elements.feedbackReportEnd, true, '');
    
    let isValid = true;
    if (periodo === 'custom') {
        startDate = new Date(this.elements.reportStart.value);
        endDate = new Date(this.elements.reportEnd.value);

        if (!this.validateInput(this.elements.reportStart, this.elements.feedbackReportStart, !isNaN(startDate.getTime()), 'Data inicial inválida.')) isValid = false;
        if (!this.validateInput(this.elements.reportEnd, this.elements.feedbackReportEnd, !isNaN(endDate.getTime()), 'Data final inválida.')) isValid = false;
        if (isValid && startDate > endDate) {
            this.validateInput(this.elements.reportStart, this.elements.feedbackReportStart, false, 'Data inicial não pode ser maior que a final.');
            this.validateInput(this.elements.reportEnd, this.elements.feedbackReportEnd, false, 'Data final não pode ser menor que a inicial.');
            isValid = false;
        }
    } else {
        const today = new Date();
        switch(periodo) {
            case 'this_month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'last_month':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                startDate = new Date(today.getFullYear(), quarter * 3, 1);
                endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
                break;
            case 'semester':
                const semester = Math.floor(today.getMonth() / 6);
                startDate = new Date(today.getFullYear(), semester * 6, 1);
                endDate = new Date(today.getFullYear(), semester * 6 + 6, 0);
                break;
            case 'year':
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
        }
    }

    if (!isValid) {
        this.showAlert('Error', 'Por favor, corrija os erros no formulário de relatório.', 'Relatorios');
        return;
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const funcsToReport = funcionarioId ? 
      this.funcionarios.filter(f => f.id == funcionarioId) : 
      this.funcionarios;
    
    const resultados = [];
    let totalGeralDiarias = 0;
    let totalGeralDespesas = 0;
    let totalGeralDias = 0;
    
    funcsToReport.forEach(func => {
      const diariasFunc = this.diarias.filter(d => {
        if (d.funcionarioId !== func.id) return false;
        const date = new Date(d.data);
        const dOnlyDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return dOnlyDate >= startDate && dOnlyDate <= endDate;
      });
      
      const despesasFunc = this.despesas.filter(d => {
        if (d.funcionarioId !== func.id) return false;
        const date = new Date(d.data);
        const dOnlyDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return dOnlyDate >= startDate && dOnlyDate <= endDate;
      });
      
      const totDiarias = diariasFunc.reduce((sum, d) => sum + d.valor, 0);
      const totDespesas = despesasFunc.reduce((sum, d) => sum + d.valor, 0);
      const totLiquido = totDiarias - totDespesas;
      
      totalGeralDiarias += totDiarias;
      totalGeralDespesas += totDespesas;
      totalGeralDias += diariasFunc.length;
      
      if (diariasFunc.length > 0 || despesasFunc.length > 0) {
        resultados.push({
          funcionario: func.nome,
          dias: diariasFunc.length,
          diarias: totDiarias,
          despesas: totDespesas,
          liquido: totLiquido
        });
      }
    });
    
    const tbody = this.elements.reportTable;
    tbody.innerHTML = '';
    
    if (resultados.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="text-align: center; color: var(--gray);">Nenhum dado encontrado para o período/funcionário selecionado.</td>`;
        tbody.appendChild(tr);
        if (this.reportChart) {
            this.reportChart.destroy();
            this.reportChart = null;
        }
        return;
    }

    resultados.forEach(resultado => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${resultado.funcionario}</td>
        <td>${resultado.dias}</td>
        <td>${this.formatCurrency(resultado.diarias)}</td>
        <td>${this.formatCurrency(resultado.despesas)}</td>
        <td>${this.formatCurrency(resultado.liquido)}</td>
      `;
      tbody.appendChild(tr);
    });
    
    const trTotal = document.createElement('tr');
    trTotal.innerHTML = `
        <td><strong>Total Geral</strong></td>
        <td><strong>${totalGeralDias}</strong></td>
        <td><strong>${this.formatCurrency(totalGeralDiarias)}</strong></td>
        <td><strong>${this.formatCurrency(totalGeralDespesas)}</strong></td>
        <td><strong>${this.formatCurrency(totalGeralDiarias - totalGeralDespesas)}</strong></td>
    `;
    tbody.appendChild(trTotal);
            
    this.updateChart({
        totalDiarias: totalGeralDiarias,
        totalDespesas: totalGeralDespesas
    });
  }

  // Handlers de ações
  handlePrintHolerite() {
    if (this.funcionarios.length === 0) {
      this.showAlert('Error', 'Cadastre um funcionário primeiro para imprimir o holerite!', 'Dashboard');
      return;
    }
    
    const funcionarioId = this.funcionarios[0].id;
    this.generateHolerite(funcionarioId, 'this_month');
  }

  // Navegação por abas
  switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    tab.classList.add('active');
    
    const tabId = tab.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'funcionarios') this.updateFuncionariosTable();
    if (tabId === 'diarias') this.updateDiariasTable();
    if (tabId === 'despesas') this.updateDespesasTable();
  }

  // Alterna visibilidade dos campos de data personalizados no relatório
  toggleCustomDateInputs() {
    const isCustom = this.elements.reportPeriodo.value === 'custom';
    this.elements.reportStartGroup.style.display = isCustom ? 'block' : 'none';
    this.elements.reportEndGroup.style.display = isCustom ? 'block' : 'none';
    
    if (!isCustom) {
        this.elements.reportStart.value = '';
        this.elements.reportEnd.value = '';
        // Limpa feedback de validação ao mudar de personalizado
        this.validateInput(this.elements.reportStart, this.elements.feedbackReportStart, true, '');
        this.validateInput(this.elements.reportEnd, this.elements.feedbackReportEnd, true, '');
    }
  }

  // Navega o calendário por mês
  navigateCalendar(direction) {
    this.currentMonth += direction;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.updateCalendarDisplay();
  }

  // Atualiza a exibição do calendário e dashboard
  updateCalendarDisplay() {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                     "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    this.elements.currentMonthDisplay.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
    this.generateCalendar(this.currentYear, this.currentMonth);
    this.updateDashboard();
  }
}

// Inicializa o aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new DiariaControlPro(); 
});