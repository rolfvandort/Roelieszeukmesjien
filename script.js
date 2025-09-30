// De Zeukmesjien JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // PROXY-URL & API Limits
  const PROXY_URL = 'https://corsproxy.io/?';
  const MAX_JURISPRUDENCE_RESULTS = 10000;

  // DATA (rechtsgebieden, procedures, instanties) — vul je lijsten aan indien nodig
  const rechtsgebieden = [
    { name: 'Bestuursrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#bestuursrecht' },
    { name: 'Civiel recht', id: 'http://psi.rechtspraak.nl/rechtsgebied#civielRecht' },
    { name: 'Internationaal publiekrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#internationaalPubliekrecht' },
    { name: 'Strafrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#strafrecht' }
  ];
  const proceduresoorten = [
    { name: 'Artikel 81 RO-zaken', id: 'http://psi.rechtspraak.nl/procedure#artikel81ROzaken' },
    { name: 'Bodemzaak', id: 'http://psi.rechtspraak.nl/procedure#bodemzaak' },
    { name: 'Beslissing RC', id: 'http://psi.rechtspraak.nl/procedure#beslissingRC' }
  ];
  const instanties = [
    { name: "Hoge Raad", id: "http://standaarden.overheid.nl/owms/terms/Hoge_Raad_der_Nederlanden" },
    { name: "Raad van State", id: "http://standaarden.overheid.nl/owms/terms/Raad_van_State" },
    { name: "Gerechtshof 's-Hertogenbosch", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_'s-Hertogenbosch" }
  ];

  // DOM ELEMENTEN
  const elements = {
    mainContainer: document.getElementById('mainContainer'),
    jurisprudenceCard: document.getElementById('jurisprudenceCard'),
    apiFilters: document.getElementById('apiFilters'),
    showFiltersButton: document.getElementById('showFiltersButton'),
    resetFiltersButton: document.getElementById('resetFiltersButton'),
    quickSearchInput: document.getElementById('quickSearchInput'),
    quickSearchButton: document.getElementById('quickSearchButton'),
    periodPreset: document.getElementById('periodPreset'),
    customDateRange: document.getElementById('customDateRange'),
    dateFilterType: document.getElementById('dateFilterType'),
    dateFrom: document.getElementById('dateFrom'),
    dateTo: document.getElementById('dateTo'),
    subject: document.getElementById('subject'),
    procedure: document.getElementById('procedure'),
    sortOrder: document.getElementById('sortOrder'),
    creator: document.getElementById('creator'),
    clearCreator: document.getElementById('clearCreator'),
    creatorSuggestions: document.getElementById('creatorSuggestions'),
    apiSearchButton: document.getElementById('apiSearchButton'),
    smartFilterButton: document.getElementById('smartFilterButton'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    resultsHeader: document.getElementById('resultsHeader'),
    totalResultsText: document.getElementById('totalResultsText'),
    activeFilters: document.getElementById('activeFilters'),
    smartSearchSection: document.getElementById('smartSearchSection'),
    smartSearchInput: document.getElementById('smartSearchInput'),
    backgroundLoader: document.getElementById('backgroundLoader'),
    searchInCheckboxes: document.querySelectorAll('input[name="searchIn"]'),
    jurisprudenceStatus: document.getElementById('jurisprudenceStatus'),
    jurisprudenceResults: document.getElementById('jurisprudenceResults'),
    jurisprudencePagination: document.getElementById('jurisprudencePagination'),
    wettenbankSearchButton: document.getElementById('wettenbankSearchButton'),
    wettenbankKeyword: document.getElementById('wettenbankKeyword'),
    wettenbankStatus: document.getElementById('wettenbankStatus'),
    wettenbankResults: document.getElementById('wettenbankResults'),
    toggleWettenbankFiltersButton: document.getElementById('toggleWettenbankFiltersButton'),
    wettenbankFacets: document.getElementById('wettenbankFacets'),
    wettenbankPagination: document.getElementById('wettenbankPagination'),
    documentViewer: document.getElementById('documentViewer'),
    keywordModal: document.getElementById('keywordModal'),
    closeKeywordModal: document.getElementById('closeKeywordModal'),
    keywordOptions: document.getElementById('keywordOptions'),
    searchWithKeywordsButton: document.getElementById('searchWithKeywordsButton')
  };

  // GLOBALE STATE
  let jurisprudenceMasterResults = [];
  let jurisprudenceCurrentResults = [];
  let totalJurisprudenceResults = 0;
  let currentJurisprudenceParams = null;
  let jurisprudenceCurrentPage = 1;
  const jurisprudenceResultsPerPage = 10;
  let isJurisprudenceLoadingInBackground = false;

  // INITIALISATIE (vul dropdowns en events)
  function initializeApp() {
    populateSelect(elements.subject, rechtsgebieden, 'Alle rechtsgebieden');
    populateSelect(elements.procedure, proceduresoorten, 'Alle procedures');
    setupEventListeners();
  }
  function populateSelect(selectElement, items, defaultOptionText) {
    selectElement.innerHTML = `-- ${defaultOptionText} --`;
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      selectElement.appendChild(opt);
    });
  }
  function setupEventListeners() {
    elements.showFiltersButton.addEventListener('click', toggleFilters);
    elements.resetFiltersButton.addEventListener('click', resetAllFilters);
    elements.quickSearchButton.addEventListener('click', () => handleJurisprudenceSearch(true));
    elements.quickSearchInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleJurisprudenceSearch(true); });
    elements.periodPreset.addEventListener('change', handlePeriodPresetChange);
    elements.creator.addEventListener('input', () => handleAutocompleteDebounced(elements.creator, elements.creatorSuggestions, instanties));
    elements.clearCreator.addEventListener('click', clearCreatorInput);
    elements.apiSearchButton.addEventListener('click', () => handleJurisprudenceSearch(true));
    elements.smartSearchInput.addEventListener('input', handleSmartSearch);
    elements.smartFilterButton.addEventListener('click', handleSmartSearch);
    elements.sortOrder.addEventListener('change', handleSortChange);
    elements.jurisprudenceResults.addEventListener('click', handleResultsClick);

    // Chat assistant
    window.askLegalAI = async function() {
      const vraag = document.getElementById('chatInput').value;
      const outputDiv = document.getElementById('chatOutput');
      outputDiv.innerHTML = 'Laden...';
      const antwoord = await fetchAISummary(vraag);
      outputDiv.innerHTML = antwoord;
    };
  }
  function toggleFilters() {
    const isVisible = elements.apiFilters.style.display === 'block';
    elements.apiFilters.style.display = isVisible ? 'none' : 'block';
    elements.showFiltersButton.innerHTML = isVisible ? '▼ Geavanceerd zoeken' : '▲ Verberg filters';
    elements.showFiltersButton.setAttribute('aria-expanded', (!isVisible).toString());
    elements.resetFiltersButton.style.display = isVisible ? 'none' : 'inline-flex';
  }
  function resetAllFilters() {
    elements.apiFilters.querySelectorAll('input, select').forEach(el => {
      if (el.type === 'radio' || el.type === 'checkbox') {
        el.checked = el.type === 'radio' && el.value === '' ? true : false;
      } else {
        el.value = '';
      }
    });
    document.querySelector('input[name="documentType"][value=""]').checked = true;
    elements.sortOrder.value = 'DESC';
    elements.dateFilterType.value = 'uitspraakdatum';
    elements.quickSearchInput.value = '';
    elements.creator.removeAttribute('data-id');
    elements.customDateRange.style.display = 'none';
    elements.clearCreator.style.display = 'none';
    jurisprudenceMasterResults = [];
    jurisprudenceCurrentResults = [];
    totalJurisprudenceResults = 0;
    jurisprudenceCurrentPage = 1;
    currentJurisprudenceParams = null;
    isJurisprudenceLoadingInBackground = false;
    elements.jurisprudenceResults.innerHTML = '';
    elements.jurisprudencePagination.innerHTML = '';
    elements.jurisprudenceStatus.style.display = 'none';
    elements.resultsHeader.style.display = 'none';
    elements.activeFilters.innerHTML = '';
    elements.smartSearchSection.classList.add('hidden');
    showNotification('Alle filters zijn gewist', 'success');
  }
  function handlePeriodPresetChange() {
    const preset = elements.periodPreset.value;
    const today = new Date();
    elements.customDateRange.style.display = preset === 'custom' ? 'flex' : 'none';
    if (preset === 'custom') { elements.dateFrom.value = ''; elements.dateTo.value = ''; return; }
    let fromDate = new Date();
    let toDate = new Date();
    switch (preset) {
      case 'last-month': fromDate.setMonth(today.getMonth() - 1); break;
      case 'last-3-months': fromDate.setMonth(today.getMonth() - 3); break;
      case 'last-6-months': fromDate.setMonth(today.getMonth() - 6); break;
      case 'this-year': fromDate = new Date(today.getFullYear(), 0, 1); break;
      case 'last-year':
        fromDate = new Date(today.getFullYear() - 1, 0, 1);
        toDate = new Date(today.getFullYear() - 1, 11, 31);
        break;
      default: elements.dateFrom.value = ''; elements.dateTo.value = ''; return;
    }
    elements.dateFrom.value = fromDate.toISOString().split('T')[0];
    elements.dateTo.value = toDate.toISOString().split('T')[0];
  }
  function handleAutocompleteDebounced(input, suggestions, items) {
    clearTimeout(window.debounceTimer);
    window.debounceTimer = setTimeout(() => handleAutocomplete(input, suggestions, items), 250);
  }
  function handleAutocomplete(input, suggestions, items) {
    const query = input.value.toLowerCase().trim();
    suggestions.innerHTML = '';
    elements.clearCreator.style.display = query.length > 0 ? 'inline-block' : 'none';
    if (query.length < 2) return;
    const matches = items.filter(item => item.name.toLowerCase().includes(query)).slice(0, 8);
    if (matches.length === 0) { suggestions.innerHTML = 'Geen instanties gevonden'; return; }
    matches.forEach(item => {
      const div = document.createElement('div');
      div.textContent = item.name;
      div.addEventListener('click', () => {
        input.value = item.name;
        input.dataset.id = item.id;
        suggestions.innerHTML = '';
      });
      suggestions.appendChild(div);
    });
  }
  function clearCreatorInput() {
    elements.creator.value = '';
    elements.creator.removeAttribute('data-id');
    elements.creatorSuggestions.innerHTML = '';
    elements.clearCreator.style.display = 'none';
  }

  // Jurisprudentie zoeken: filters → API → resultaten
  function buildJurisprudenceParams(from = 0, includeSort = false) {
    const params = new URLSearchParams();
    const dateType = elements.dateFilterType.value;
    if (dateType === 'uitspraakdatum') {
      if (elements.dateFrom.value) params.append('date', elements.dateFrom.value);
      if (elements.dateTo.value) params.append('date', elements.dateTo.value);
    } else if (dateType === 'wijzigingsdatum') {
      if (elements.dateFrom.value) params.append('modified', `${elements.dateFrom.value}T00:00:00`);
      if (elements.dateTo.value) params.append('modified', `${elements.dateTo.value}T23:59:59`);
    }
    if (elements.subject.value) params.append('subject', elements.subject.value);
    if (elements.procedure.value) params.append('procedure', elements.procedure.value);
    if (elements.creator.dataset.id) params.append('creator', elements.creator.dataset.id);
    const selectedType = document.querySelector('input[name="documentType"]:checked')?.value;
    if (typeof selectedType !== 'undefined' && selectedType !== '') params.append('type', selectedType);
    params.append('return', 'DOC');
    if (includeSort) {
      const sortValue = elements.sortOrder.value;
      if (sortValue === 'ASC' || sortValue === 'DESC') {
        params.append('sort', sortValue);
      }
    }
    params.append('max', '1000');
    params.set('from', from);
    return params;
  }

  async function handleJurisprudenceSearch(isNewSearch = false) {
    if (isNewSearch) {
      jurisprudenceMasterResults = [];
      totalJurisprudenceResults = 0;
      jurisprudenceCurrentPage = 1;
      currentJurisprudenceParams = null;
      isJurisprudenceLoadingInBackground = false;
    }
    elements.jurisprudenceResults.innerHTML = '';
    elements.jurisprudencePagination.innerHTML = '';
    elements.smartSearchSection.classList.add('hidden');
    elements.resultsHeader.style.display = 'none';
    showLoading(true, true);
    displayActiveFilters();
    const includeSort = (elements.sortOrder.value === 'ASC' || elements.sortOrder.value === 'DESC');
    const params = buildJurisprudenceParams(1, includeSort);
    const requestUrl = `${PROXY_URL}${encodeURIComponent(`https://data.rechtspraak.nl/uitspraken/zoeken?${params.toString()}`)}`;
    try {
      const response = await fetch(requestUrl);
      if (!response.ok) throw new Error(`API-verzoek mislukt: ${response.status}`);
      const xmlString = await response.text();
      const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
      if (xmlDoc.getElementsByTagName("parsererror").length) {
        throw new Error("Fout bij het verwerken van de XML-data.");
      }
      const subtitle = xmlDoc.querySelector('subtitle')?.textContent || '';
      totalJurisprudenceResults = parseInt(subtitle.match(/\d+/)?.[0] || '0', 10);
      if (totalJurisprudenceResults > 0) {
        elements.totalResultsText.textContent = `${totalJurisprudenceResults} resultaten gevonden`;
        elements.resultsHeader.style.display = 'block';
        elements.smartSearchSection.classList.remove('hidden');
        const entries = Array.from(xmlDoc.getElementsByTagName('entry'));
        const newResults = entries.map(entry => parseJurisprudenceEntry(entry));
        jurisprudenceMasterResults.push(...newResults);
        await addAISummariesToResults(jurisprudenceMasterResults);
        sortAndRenderJurisprudence();
        if(totalJurisprudenceResults > 1000) {
          showNotification('Let op: slechts de eerste 1000 van mogelijk meer resultaten zijn geladen. Verfijn uw zoekopdracht voor volledigheid.', 'warning');
        }
      } else {
        showStatus(elements.jurisprudenceStatus, 'Geen resultaten gevonden voor deze criteria.', 'warning');
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
      }
    } catch (error) {
      showStatus(elements.jurisprudenceStatus, `Fout: ${error.message}.`, 'error');
      elements.resultsHeader.style.display = 'none';
      elements.smartSearchSection.classList.add('hidden');
      console.error(error);
    } finally {
      showLoading(false, true);
    }
  }
  function parseJurisprudenceEntry(entry) {
    const fullTitle = entry.querySelector('title')?.textContent || 'Geen titel beschikbaar';
    const ecli = entry.querySelector('id')?.textContent || 'Geen ECLI';
    const lastUpdatedDateRaw = entry.querySelector('updated')?.textContent;
    const lastUpdatedDate = lastUpdatedDateRaw ? new Date(lastUpdatedDateRaw) : null;
    const issuedDateRaw = entry.querySelector('issued')?.textContent;
    const issuedDate = issuedDateRaw ? new Date(issuedDateRaw) : null;
    const decisionDateRaw = entry.querySelector('date')?.textContent;
    let decisionDateObject = decisionDateRaw ? new Date(decisionDateRaw) : null;
    let uitspraakdatum = decisionDateObject ? decisionDateObject.toLocaleDateString('nl-NL') : 'Niet beschikbaar';
    let instantie = 'N/A';
    let zaaknummer = 'N/A';
    const parts = fullTitle.split(',').map(p => p.trim());
    if (parts.length >= 2) instantie = parts[1];
    if (parts.length >= 3) {
      const dateZaakPart = parts[2];
      if (!decisionDateObject) {
        const dateMatch = dateZaakPart.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const parsedDate = new Date(dateMatch[1]);
          if (!isNaN(parsedDate)) {
            decisionDateObject = parsedDate;
            uitspraakdatum = parsedDate.toLocaleDateString('nl-NL');
          }
        }
      }
      const zaakSplit = dateZaakPart.split('/');
      if (zaakSplit.length > 1) {
        zaaknummer = zaakSplit.slice(1).join('/').replace(/^\s*|\s*$/g, '');
      } else {
        zaaknummer = dateZaakPart.replace(/(\d{4}-\d{2}-\d{2})/, '').replace(/^\s*|\s*$/g, '');
      }
      if (!zaaknummer || zaaknummer === '') zaaknummer = 'Niet beschikbaar';
    }
    if (!decisionDateObject) decisionDateObject = issuedDate || lastUpdatedDate;
    if (decisionDateObject && !(decisionDateObject instanceof Date && !isNaN(decisionDateObject))) decisionDateObject = null;
    return {
      title: fullTitle,
      ecli,
      instantie,
      uitspraakdatum,
      zaaknummer,
      summary: entry.querySelector('summary')?.textContent || 'Geen samenvatting beschikbaar.',
      link: entry.querySelector('link')?.getAttribute('href') || '#',
      dateObject: decisionDateObject,
      publicatiedatum: issuedDate ? issuedDate.toLocaleDateString('nl-NL') : 'Niet beschikbaar',
      gewijzigd: lastUpdatedDate ? lastUpdatedDate.toLocaleDateString('nl-NL') : 'Niet beschikbaar'
    };
  }
  function sortAndRenderJurisprudence() {
    handleSmartSearch();
    const sortValue = elements.sortOrder.value;
    if (sortValue === 'date-desc' || sortValue === 'date-asc') {
      jurisprudenceCurrentResults.sort((a, b) => {
        const dateA = a.dateObject;
        const dateB = b.dateObject;
        if (!dateA || !dateB || isNaN(dateA) || isNaN(dateB)) return 0;
        if (sortValue === 'date-desc') return dateB - dateA;
        if (sortValue === 'date-asc') return dateA - dateB;
        return 0;
      });
    }
    renderJurisprudenceResults();
  }

  function handleSortChange() {
    const sortValue = elements.sortOrder.value;
    if (sortValue === 'ASC' || sortValue === 'DESC') {
      handleJurisprudenceSearch(true);
      return;
    }
    if (jurisprudenceMasterResults.length > 0) {
      sortAndRenderJurisprudence();
    } else {
      showNotification("Voer eerst een zoekopdracht uit voordat u sorteert.", "info");
    }
  }
  function handleSmartSearch() {
    jurisprudenceCurrentPage = 1;
    const keyword = elements.smartSearchInput.value.toLowerCase().trim() || elements.quickSearchInput.value.toLowerCase().trim();
    const searchIn = Array.from(elements.searchInCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
    if (elements.smartSearchInput.value.trim() && searchIn.length === 0) {
      jurisprudenceCurrentResults = jurisprudenceMasterResults;
    } else {
      jurisprudenceCurrentResults = jurisprudenceMasterResults.filter(item => {
        if (!keyword) return true;
        const useQuickSearchLogic = !elements.smartSearchInput.value.trim();
        if (useQuickSearchLogic) {
          return item.title.toLowerCase().includes(keyword) ||
                 item.summary.toLowerCase().includes(keyword) ||
                 item.ecli.toLowerCase().includes(keyword);
        } else {
          const inTitle = searchIn.includes('title') && item.title.toLowerCase().includes(keyword);
          const inSummary = searchIn.includes('summary') && item.summary.toLowerCase().includes(keyword);
          const inEcli = searchIn.includes('ecli') && item.ecli.toLowerCase().includes(keyword);
          return inTitle || inSummary || inEcli;
        }
      });
    }
  }

  // PAGINERING
  function renderPagination(container, currentPage, totalPages, type) {
    container.innerHTML = '';
    if (totalPages <= 1) return;
    const totalResults = type === 'jurisprudence' ? jurisprudenceCurrentResults.length : 0;
    const resultsPerPage = type === 'jurisprudence' ? jurisprudenceResultsPerPage : 0;
    let html = `Pagina ${currentPage} van ${totalPages}<br>`;
    const startResult = (currentPage - 1) * resultsPerPage + 1;
    const endResult = Math.min(currentPage * resultsPerPage, totalResults);
    html += `Resultaten ${startResult}-${endResult} van ${totalResults}`;
    container.innerHTML = html;
  }

  // RESULTAAT BUILDER (+ AI SAMENVATTING/TAGS)
  function renderJurisprudenceResults() {
    elements.jurisprudenceResults.innerHTML = '';
    const keyword = elements.smartSearchInput.value.trim().toLowerCase() || elements.quickSearchInput.value.trim().toLowerCase();
    const startIndex = (jurisprudenceCurrentPage - 1) * jurisprudenceResultsPerPage;
    const endIndex = startIndex + jurisprudenceResultsPerPage;
    const paginatedResults = jurisprudenceCurrentResults.slice(startIndex, endIndex);
    paginatedResults.forEach((item, index) => {
      const metaHTMLArr = [
        item.ecli ? `<span class="tag">ECLI: ${item.ecli}</span>` : '',
        item.instantie ? `<span class="tag">${item.instantie}</span>` : '',
        item.zaaknummer ? `<span class="tag">${item.zaaknummer}</span>` : ''
      ];
      elements.jurisprudenceResults.innerHTML += `
        <div class="result-item">
          <div class="result-item-header">
            <h3><a href="${item.link}" target="_blank">${item.title}</a></h3>
          </div>
          <div class="meta-info">${metaHTMLArr.join(' ')}</div>
          <div class="summary">${item.summary}</div>
          <div class="ai-summary">
            <strong>AI Samenvatting:</strong> ${item.aiSummary ? item.aiSummary : ''}
          </div>
        </div>
      `;
    });
    renderPagination(elements.jurisprudencePagination, jurisprudenceCurrentPage, Math.ceil(jurisprudenceCurrentResults.length / jurisprudenceResultsPerPage), 'jurisprudence');
  }

  // ======= AI SAMENVATTING FUNCTIE =======
  async function fetchAISummary(text) {
    const apiKey = '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';
    const endpoint = "https://api-inference.huggingface.co/models/google/gemma-7b-it";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text })
    });
    const result = await response.json();
    if(result.error) return "AI is tijdelijk niet beschikbaar: " + result.error;
    if(Array.isArray(result)) return result[0]?.generated_text || "Geen samenvatting beschikbaar";
    // fallback voor string-type respons
    return typeof result === "string" ? result : "Geen samenvatting beschikbaar";
  }
  async function addAISummariesToResults(results) {
    for (let item of results) {
      try {
        item.aiSummary = await fetchAISummary(item.summary || item.title);
      } catch {
        item.aiSummary = "Samenvatting kon niet geladen worden";
      }
    }
    renderJurisprudenceResults();
  }

  // NOTIFICATIES/STATUS/LOADING
  function showLoading(show, isNewSearch = false) {
    elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    if (isNewSearch) {
      elements.apiSearchButton.disabled = show;
      elements.apiSearchButton.innerHTML = show ? ' Zoeken...' : ' Zoek uitspraken';
    }
  }
  function showStatus(element, message, type = 'info') {
    element.textContent = message;
    element.className = `status-message ${type}`;
    element.style.display = 'block';
  }
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease forwards';
      notification.addEventListener('animationend', () => notification.remove());
    }, 4000);
  }

  // Tags/filters
  function displayActiveFilters() {
    let html = 'Actieve filters:';
    let hasFilters = false;
    const addTag = (value) => { hasFilters = true; return `<span class="active-filter-tag">${value}</span>`; };
    const keyword = elements.quickSearchInput.value.trim();
    if (keyword) html += addTag(`Trefwoord: "${keyword}"`);
    const creatorName = elements.creator.value.trim();
    if (creatorName) html += addTag(`Instantie: ${creatorName}`);
    const subjectText = elements.subject.options[elements.subject.selectedIndex]?.text;
    if (elements.subject.value) html += addTag(`Rechtsgebied: ${subjectText}`);
    const procedureText = elements.procedure.options[elements.procedure.selectedIndex]?.text;
    if (elements.procedure.value) html += addTag(`Procedure: ${procedureText}`);
    if (elements.dateFrom.value && elements.dateTo.value) {
      html += addTag(`Periode: ${elements.dateFrom.value} tot ${elements.dateTo.value}`);
    }
    elements.activeFilters.innerHTML = hasFilters ? html : '';
  }

  initializeApp();
});
