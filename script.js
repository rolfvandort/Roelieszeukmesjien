document.addEventListener('DOMContentLoaded', () => {
    // --- PROXY-INSTELLING ---
    const PROXY_URL = 'https://corsproxy.io/?';
    
    // --- API BASE URL ---
    const API_BASE_URL = 'https://data.rechtspraak.nl/uitspraken/zoeken';
    
    // --- DATA (uit de XML-bestanden) ---
    const rechtsgebieden = [
        { name: 'Bestuursrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#bestuursrecht' },
        { name: 'Civiel recht', id: 'http://psi.rechtspraak.nl/rechtsgebied#civielRecht' },
        { name: 'Internationaal publiekrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#internationaalPubliekrecht' },
        { name: 'Strafrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#strafrecht' }
    ];

    const proceduresoorten = [
        { name: 'Artikel 81 RO-zaken', id: 'http://psi.rechtspraak.nl/procedure#artikel81ROzaken' },
        { name: 'Bodemzaak', id: 'http://psi.rechtspraak.nl/procedure#bodemzaak' },
        { name: 'Cassatie', id: 'http://psi.rechtspraak.nl/procedure#cassatie' },
        { name: 'Eerste aanleg - enkelvoudig', id: 'http://psi.rechtspraak.nl/procedure#eersteAanlegEnkelvoudig' },
        { name: 'Eerste aanleg - meervoudig', id: 'http://psi.rechtspraak.nl/procedure#eersteAanlegMeervoudig' },
        { name: 'Hoger beroep', id: 'http://psi.rechtspraak.nl/procedure#hogerBeroep' },
        { name: 'Kort geding', id: 'http://psi.rechtspraak.nl/procedure#kortGeding' },
        { name: 'Voorlopige voorziening', id: 'http://psi.rechtspraak.nl/procedure#voorlopigeVoorziening' }
    ];

    const instanties = [
        { name: "Hoge Raad", id: "http://standaarden.overheid.nl/owms/terms/Hoge_Raad_der_Nederlanden" },
        { name: "Raad van State", id: "http://standaarden.overheid.nl/owms/terms/Raad_van_State" },
        { name: "Centrale Raad van Beroep", id: "http://standaarden.overheid.nl/owms/terms/Centrale_Raad_van_Beroep" },
        { name: "College van Beroep voor het bedrijfsleven", id: "http://standaarden.overheid.nl/owms/terms/College_van_Beroep_voor_het_bedrijfsleven" },
        { name: "Rechtbank Amsterdam", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Amsterdam" },
        { name: "Rechtbank Den Haag", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Den_Haag" },
        { name: "Rechtbank Gelderland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Gelderland" },
        { name: "Rechtbank Limburg", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Limburg" },
        { name: "Rechtbank Midden-Nederland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Midden-Nederland" },
        { name: "Rechtbank Noord-Holland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Noord-Holland" },
        { name: "Rechtbank Noord-Nederland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Noord-Nederland" },
        { name: "Rechtbank Oost-Brabant", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Oost-Brabant" },
        { name: "Rechtbank Overijssel", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Overijssel" },
        { name: "Rechtbank Rotterdam", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Rotterdam" },
        { name: "Rechtbank Zeeland-West-Brabant", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Zeeland-West-Brabant" },
        { name: "Gerechtshof Amsterdam", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Amsterdam" },
        { name: "Gerechtshof Arnhem-Leeuwarden", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Arnhem-Leeuwarden" },
        { name: "Gerechtshof Den Haag", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Den_Haag" },
        { name: "Gerechtshof 's-Hertogenbosch", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_'s-Hertogenbosch" }
    ];

    // --- DOM ELEMENTEN ---
    const elements = {
        jurisprudenceCard: document.getElementById('jurisprudenceCard'),
        apiFilters: document.getElementById('apiFilters'),
        showFiltersButton: document.getElementById('showFiltersButton'),
        filterToggleIcon: document.getElementById('filterToggleIcon'),
        resetFiltersButton: document.getElementById('resetFiltersButton'),
        quickSearchInput: document.getElementById('quickSearchInput'),
        quickSearchButton: document.getElementById('quickSearchButton'),
        periodPreset: document.getElementById('periodPreset'),
        customDateRange: document.getElementById('customDateRange'),
        dateFrom: document.getElementById('dateFrom'),
        dateTo: document.getElementById('dateTo'),
        modifiedFrom: document.getElementById('modifiedFrom'),
        modifiedTo: document.getElementById('modifiedTo'),
        subject: document.getElementById('subject'),
        procedure: document.getElementById('procedure'),
        documentTypeRadios: document.querySelectorAll('input[name="documentType"]'),
        sortOrder: document.getElementById('sortOrder'),
        advancedFilters: document.getElementById('advancedFilters'),
        toggleAdvanced: document.getElementById('toggleAdvanced'),
        advancedToggleIcon: document.getElementById('advancedToggleIcon'),
        creator: document.getElementById('creator'),
        clearCreator: document.getElementById('clearCreator'),
        creatorSuggestions: document.getElementById('creatorSuggestions'),
        apiSearchButton: document.getElementById('apiSearchButton'),
        smartFilterButton: document.getElementById('smartFilterButton'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        smartSearchSection: document.getElementById('smartSearchSection'),
        smartSearchInput: document.getElementById('smartSearchInput'),
        searchInCheckboxes: document.querySelectorAll('input[name="searchIn"]'),
        jurisprudenceStatus: document.getElementById('jurisprudenceStatus'),
        jurisprudenceResults: document.getElementById('jurisprudenceResults'),
        jurisprudencePagination: document.getElementById('jurisprudencePagination'),
        wettenbankSearchButton: document.getElementById('wettenbankSearchButton'),
        wettenbankKeyword: document.getElementById('wettenbankKeyword'),
        wettenbankStatus: document.getElementById('wettenbankStatus'),
        wettenbankResults: document.getElementById('wettenbankResults'),
        pinnedItemContainer: document.getElementById('pinnedItemContainer'),
        pinnedItemContent: document.getElementById('pinnedItemContent')
    };

    // --- GLOBALE STATE ---
    let masterResults = [];
    let currentFilteredResults = [];
    let currentPage = 1;
    let searchHistory = [];
    let debounceTimer = null;
    let isFiltersVisible = false;
    let isAdvancedVisible = false;
    const resultsPerPage = 50;

    // --- INITIALISATIE ---
    const initializeApp = () => {
        populateSelect(elements.subject, rechtsgebieden);
        populateSelect(elements.procedure, proceduresoorten);
        setupEventListeners();
        loadStateFromURL();
        setDefaultDates();
    };

    const populateSelect = (select, items) => {
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.name;
            select.appendChild(opt);
        });
    };

    const setDefaultDates = () => {
        const today = new Date();
        const todayString = today.toISOString().split('T')[^0];
        
        elements.dateFrom.max = todayString;
        elements.dateTo.max = todayString;
        elements.modifiedFrom.max = todayString;
        elements.modifiedTo.max = todayString;
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        elements.showFiltersButton.addEventListener('click', toggleFilters);
        elements.resetFiltersButton.addEventListener('click', resetAllFilters);
        elements.toggleAdvanced.addEventListener('click', toggleAdvancedFilters);
        elements.quickSearchButton.addEventListener('click', handleQuickSearch);
        elements.quickSearchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleQuickSearch();
        });
        elements.periodPreset.addEventListener('change', handlePeriodPresetChange);
        elements.dateFrom.addEventListener('change', validateDateRange);
        elements.dateTo.addEventListener('change', validateDateRange);
        elements.modifiedFrom.addEventListener('change', validateModifiedDateRange);
        elements.modifiedTo.addEventListener('change', validateModifiedDateRange);
        elements.creator.addEventListener('input', () => handleAutocompleteDebounced(elements.creator, elements.creatorSuggestions, instanties));
        elements.clearCreator.addEventListener('click', clearCreatorInput);
        elements.apiSearchButton.addEventListener('click', handleJurisprudenceSearch);
        elements.smartFilterButton.addEventListener('click', handleSmartSearch);
        elements.smartSearchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleSmartSearch();
        });
        elements.jurisprudenceResults.addEventListener('click', handleResultsClick);
        elements.wettenbankSearchButton.addEventListener('click', handleWettenbankSearch);
        elements.wettenbankKeyword.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleWettenbankSearch();
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-container')) {
                elements.creatorSuggestions.innerHTML = '';
            }
        });
        elements.apiFilters.addEventListener('change', saveStateToURL);
    };

    // --- FILTER MANAGEMENT ---
    const toggleFilters = () => {
        isFiltersVisible = !isFiltersVisible;
        elements.apiFilters.style.display = isFiltersVisible ? 'block' : 'none';
        elements.filterToggleIcon.textContent = isFiltersVisible ? '▲' : '▼';
        elements.showFiltersButton.innerHTML = `${isFiltersVisible ? '▲' : '▼'} ${isFiltersVisible ? 'Verberg filters' : 'Geavanceerd zoeken'}`;
        elements.resetFiltersButton.style.display = isFiltersVisible ? 'inline-block' : 'none';
    };

    const toggleAdvancedFilters = () => {
        isAdvancedVisible = !isAdvancedVisible;
        elements.advancedFilters.style.display = isAdvancedVisible ? 'block' : 'none';
        elements.advancedToggleIcon.textContent = isAdvancedVisible ? '▲' : '▼';
        elements.toggleAdvanced.innerHTML = `${isAdvancedVisible ? '▲' : '▼'} ${isAdvancedVisible ? 'Minder opties' : 'Meer opties'}`;
    };

    const resetAllFilters = () => {
        elements.quickSearchInput.value = '';
        elements.periodPreset.value = '';
        elements.dateFrom.value = '';
        elements.dateTo.value = '';
        elements.modifiedFrom.value = '';
        elements.modifiedTo.value = '';
        elements.subject.value = '';
        elements.procedure.value = '';
        elements.sortOrder.value = 'DESC';
        elements.creator.value = '';
        elements.creator.removeAttribute('data-id');
        elements.customDateRange.style.display = 'none';
        elements.clearCreator.style.display = 'none';
        
        elements.documentTypeRadios.forEach(radio => {
            radio.checked = radio.value === '';
        });
        
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
        elements.jurisprudenceStatus.style.display = 'none';
        elements.smartSearchSection.classList.add('hidden');
        elements.smartSearchSection.classList.remove('visible');
        
        history.pushState({}, '', window.location.pathname);
        showNotification('Alle filters zijn gewist', 'success');
    };

    const handlePeriodPresetChange = () => {
        const preset = elements.periodPreset.value;
        const today = new Date();
        
        if (preset === 'custom') {
            elements.customDateRange.style.display = 'block';
            elements.dateFrom.value = '';
            elements.dateTo.value = '';
        } else {
            elements.customDateRange.style.display = 'none';
            let fromDate = new Date(today);
            let toDate = new Date(today);
            
            switch (preset) {
                case 'last-month':
                    fromDate.setMonth(today.getMonth() - 1);
                    break;
                case 'last-3-months':
                    fromDate.setMonth(today.getMonth() - 3);
                    break;
                case 'last-6-months':
                    fromDate.setMonth(today.getMonth() - 6);
                    break;
                case 'this-year':
                    fromDate = new Date(today.getFullYear(), 0, 1);
                    break;
                case 'last-year':
                    fromDate = new Date(today.getFullYear() - 1, 0, 1);
                    toDate = new Date(today.getFullYear() - 1, 11, 31);
                    break;
                default:
                    elements.dateFrom.value = '';
                    elements.dateTo.value = '';
                    return;
            }
            
            elements.dateFrom.value = fromDate.toISOString().split('T')[^0];
            elements.dateTo.value = toDate.toISOString().split('T')[^0];
        }
    };

    const validateDateRange = () => {
        const fromDate = new Date(elements.dateFrom.value);
        const toDate = new Date(elements.dateTo.value);
        
        if (elements.dateFrom.value && elements.dateTo.value && fromDate > toDate) {
            showNotification('Van-datum kan niet na tot-datum liggen', 'error');
            elements.dateTo.value = elements.dateFrom.value;
        }
    };

    const validateModifiedDateRange = () => {
        const fromDate = new Date(elements.modifiedFrom.value);
        const toDate = new Date(elements.modifiedTo.value);
        
        if (elements.modifiedFrom.value && elements.modifiedTo.value && fromDate > toDate) {
            showNotification('Van-datum kan niet na tot-datum liggen', 'error');
            elements.modifiedTo.value = elements.modifiedFrom.value;
        }
    };

    // --- AUTOCOMPLETE ---
    const handleAutocompleteDebounced = (input, suggestions, items) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleAutocomplete(input, suggestions, items);
        }, 300);
    };

    const handleAutocomplete = (input, suggestions, items) => {
        const query = input.value.toLowerCase().trim();
        suggestions.innerHTML = '';
        
        if (query.length < 2) {
            elements.clearCreator.style.display = 'none';
            return;
        }
        
        elements.clearCreator.style.display = 'inline-block';
        
        const matches = items.filter(item => 
            item.name.toLowerCase().includes(query)
        ).slice(0, 8);
        
        if (matches.length === 0) {
            suggestions.innerHTML = '<div class="no-results">Geen resultaten gevonden</div>';
        } else {
            matches.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item.name;
                div.addEventListener('click', () => {
                    input.value = item.name;
                    input.setAttribute('data-id', item.id);
                    suggestions.innerHTML = '';
                    elements.clearCreator.style.display = 'inline-block';
                });
                suggestions.appendChild(div);
            });
        }
    };

    const clearCreatorInput = () => {
        elements.creator.value = '';
        elements.creator.removeAttribute('data-id');
        elements.clearCreator.style.display = 'none';
        elements.creatorSuggestions.innerHTML = '';
    };

    // --- API CALLS ---
    const buildApiUrl = () => {
        const params = new URLSearchParams();
        
        // Zoekterm (niet verplicht volgens API documentatie)
        const quickSearch = elements.quickSearchInput.value.trim();
        if (quickSearch) {
            // Voor zoektermen kunnen we eventueel later een volledige tekst search implementeren
            // Voor nu voegen we het toe als algemene parameter, maar de API heeft geen specifieke tekst search parameter
        }
        
        // Document type - API parameter: type
        const checkedDocType = document.querySelector('input[name="documentType"]:checked');
        if (checkedDocType && checkedDocType.value) {
            params.append('type', checkedDocType.value);
        }
        
        // Rechtsgebied - API parameter: subject
        if (elements.subject.value) {
            params.append('subject', elements.subject.value);
        }
        
        // Procedure
        if (elements.procedure.value) {
            // De API documentatie vermeld geen procedure parameter, maar laten we het proberen
            params.append('procedure', elements.procedure.value);
        }
        
        // Datum range - API parameter: date
        if (elements.dateFrom.value && elements.dateTo.value) {
            params.append('date', elements.dateFrom.value);
            params.append('date', elements.dateTo.value);
        } else if (elements.dateFrom.value) {
            params.append('date', elements.dateFrom.value);
        } else if (elements.dateTo.value) {
            params.append('date', elements.dateTo.value);
        }
        
        // Wijzigingsdatum - API parameter: modified
        if (elements.modifiedFrom.value && elements.modifiedTo.value) {
            params.append('modified', elements.modifiedFrom.value + 'T00:00:00');
            params.append('modified', elements.modifiedTo.value + 'T23:59:59');
        } else if (elements.modifiedFrom.value) {
            params.append('modified', elements.modifiedFrom.value + 'T00:00:00');
        }
        
        // Instantie - API parameter: creator
        const creatorId = elements.creator.getAttribute('data-id');
        if (creatorId) {
            params.append('creator', creatorId);
        }
        
        // Sortering - API parameter: sort
        const sortValue = elements.sortOrder.value;
        if (sortValue) {
            params.append('sort', sortValue);
        }
        
        // Altijd return=DOC voor alleen documenten met volledige tekst
        params.append('return', 'DOC');
        
        // Maximum resultaten
        params.append('max', '1000');
        
        return `${API_BASE_URL}?${params.toString()}`;
    };

    const handleJurisprudenceSearch = async () => {
        const url = buildApiUrl();
        console.log('API URL:', url);
        
        showLoading(true);
        elements.jurisprudenceStatus.style.display = 'none';
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
        
        try {
            const proxyUrl = PROXY_URL + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            
            if (xmlDoc.querySelector('parsererror')) {
                throw new Error('Invalid XML response');
            }
            
            const results = parseJurisprudenceResults(xmlDoc);
            masterResults = results;
            currentFilteredResults = results;
            currentPage = 1;
            
            displayJurisprudenceResults(results);
            setupJurisprudencePagination(results.length);
            showSmartSearch();
            
        } catch (error) {
            console.error('Search error:', error);
            showNotification('Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.', 'error');
        } finally {
            showLoading(false);
        }
    };

    const parseJurisprudenceResults = (xmlDoc) => {
        const entries = xmlDoc.getElementsByTagName('entry');
        const results = [];
        
        for (let entry of entries) {
            const title = entry.querySelector('title')?.textContent || 'Geen titel';
            const link = entry.querySelector('link')?.getAttribute('href') || '';
            const id = entry.querySelector('id')?.textContent || '';
            const updated = entry.querySelector('updated')?.textContent || '';
            const summary = entry.querySelector('summary')?.textContent || '';
            
            // Skip deleted entries
            if (entry.getAttribute('deleted')) {
                continue;
            }
            
            // Parse title to extract court and date info
            const titleParts = title.split(',');
            const court = titleParts.length > 1 ? titleParts[^1].trim() : '';
            const date = titleParts.length > 2 ? titleParts[^2].trim() : updated;
            
            results.push({
                title: title,
                link: link,
                ecli: id,
                court: court,
                date: date,
                updated: updated,
                summary: summary
            });
        }
        
        return results;
    };

    const displayJurisprudenceResults = (results) => {
        if (results.length === 0) {
            elements.jurisprudenceResults.innerHTML = '<p class="text-center text-muted">Geen resultaten gevonden.</p>';
            elements.jurisprudenceStatus.textContent = 'Geen resultaten gevonden';
            elements.jurisprudenceStatus.style.display = 'block';
            return;
        }
        
        elements.jurisprudenceStatus.textContent = `${results.length} resultaten gevonden`;
        elements.jurisprudenceStatus.style.display = 'block';
        
        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, results.length);
        const pageResults = results.slice(startIndex, endIndex);
        
        const html = pageResults.map(result => `
            <div class="result-item">
                <div class="result-item-header">
                    <h3><a href="${result.link}" target="_blank">${result.ecli}</a></h3>
                    <button class="pin-button" data-ecli="${result.ecli}" title="Pin dit resultaat">📌</button>
                </div>
                <div class="meta-info">
                    <span>🏛️ ${result.court}</span>
                    <span>📅 ${result.date}</span>
                    <span>🔄 ${result.updated}</span>
                </div>
                <div class="summary">${result.summary.substring(0, 200)}${result.summary.length > 200 ? '...' : ''}</div>
                ${result.summary.length > 200 ? '<div class="read-more">Lees meer</div>' : ''}
                <div class="full-link">
                    <a href="${result.link}" target="_blank">Bekijk volledige uitspraak →</a>
                </div>
            </div>
        `).join('');
        
        elements.jurisprudenceResults.innerHTML = html;
    };

    const setupJurisprudencePagination = (totalResults) => {
        if (totalResults <= resultsPerPage) {
            elements.jurisprudencePagination.innerHTML = '';
            return;
        }
        
        const totalPages = Math.ceil(totalResults / resultsPerPage);
        
        const html = `
            <div class="pagination-controls">
                <button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">Vorige</button>
                <span id="pageIndicator">Pagina ${currentPage} van ${totalPages}</span>
                <button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Volgende</button>
            </div>
            <div class="results-summary">
                Resultaten ${((currentPage - 1) * resultsPerPage) + 1}-${Math.min(currentPage * resultsPerPage, totalResults)} van ${totalResults}
            </div>
        `;
        
        elements.jurisprudencePagination.innerHTML = html;
    };

    // Global function for pagination
    window.goToPage = (page) => {
        currentPage = page;
        displayJurisprudenceResults(currentFilteredResults);
        setupJurisprudencePagination(currentFilteredResults.length);
        elements.jurisprudenceResults.scrollIntoView({ behavior: 'smooth' });
    };

    const handleQuickSearch = () => {
        handleJurisprudenceSearch();
    };

    const showSmartSearch = () => {
        elements.smartSearchSection.classList.remove('hidden');
        elements.smartSearchSection.classList.add('visible');
    };

    const handleSmartSearch = () => {
        const query = elements.smartSearchInput.value.toLowerCase().trim();
        if (!query) {
            currentFilteredResults = masterResults;
        } else {
            // Get selected search fields
            const searchInFields = Array.from(elements.searchInCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            if (searchInFields.length === 0) {
                showNotification('Selecteer minimaal één zoekgebied', 'error');
                return;
            }
            
            currentFilteredResults = masterResults.filter(result => {
                return searchInFields.some(field => {
                    switch (field) {
                        case 'title':
                            return result.title.toLowerCase().includes(query);
                        case 'summary':
                            return result.summary.toLowerCase().includes(query);
                        case 'ecli':
                            return result.ecli.toLowerCase().includes(query);
                        case 'zaaknummer':
                            return result.title.toLowerCase().includes(query);
                        default:
                            return false;
                    }
                });
            });
        }
        
        currentPage = 1;
        displayJurisprudenceResults(currentFilteredResults);
        setupJurisprudencePagination(currentFilteredResults.length);
    };

    const handleResultsClick = (e) => {
        if (e.target.classList.contains('read-more')) {
            const summary = e.target.previousElementSibling;
            const fullLink = e.target.nextElementSibling;
            
            if (summary.classList.contains('expanded')) {
                summary.classList.remove('expanded');
                e.target.textContent = 'Lees meer';
                fullLink.style.display = 'none';
            } else {
                summary.classList.add('expanded');
                e.target.textContent = 'Lees minder';
                fullLink.style.display = 'block';
            }
        }
        
        if (e.target.classList.contains('pin-button')) {
            const ecli = e.target.getAttribute('data-ecli');
            const result = masterResults.find(r => r.ecli === ecli);
            if (result) {
                pinResult(result);
            }
        }
    };

    const pinResult = (result) => {
        elements.pinnedItemContainer.classList.remove('hidden');
        elements.pinnedItemContent.innerHTML = `
            <h4>${result.ecli}</h4>
            <p><strong>Instantie:</strong> ${result.court}</p>
            <p><strong>Datum:</strong> ${result.date}</p>
            <p>${result.summary.substring(0, 150)}${result.summary.length > 150 ? '...' : ''}</p>
            <div class="pinned-actions">
                <a href="${result.link}" target="_blank" class="primary-button">Bekijk uitspraak</a>
                <button onclick="unpinResult()" class="tertiary-button">Verwijderen</button>
            </div>
        `;
        showNotification('Resultaat gepind', 'success');
    };

    // Global function for unpinning
    window.unpinResult = () => {
        elements.pinnedItemContainer.classList.add('hidden');
        elements.pinnedItemContent.innerHTML = '';
        showNotification('Pin verwijderd', 'info');
    };

    // --- WETTENBANK SEARCH (unchanged from original) ---
    const handleWettenbankSearch = async () => {
        const keyword = elements.wettenbankKeyword.value.trim();
        
        if (!keyword) {
            showNotification('Voer een zoekterm in voor de Wettenbank', 'error');
            return;
        }
        
        elements.wettenbankStatus.textContent = 'Zoeken in Wettenbank...';
        elements.wettenbankStatus.style.display = 'block';
        elements.wettenbankResults.innerHTML = '';
        
        try {
            // Simulate API call - replace with actual Wettenbank API
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock results
            const mockResults = [
                {
                    title: `Burgerlijk Wetboek - ${keyword}`,
                    description: `Relevante bepalingen betreffende ${keyword} in het Burgerlijk Wetboek`,
                    url: '#',
                    source: 'BWB'
                },
                {
                    title: `Wetboek van Strafrecht - ${keyword}`,
                    description: `Artikelen gerelateerd aan ${keyword} in het Wetboek van Strafrecht`,
                    url: '#',
                    source: 'BWB'
                }
            ];
            
            displayWettenbankResults(mockResults);
            
        } catch (error) {
            console.error('Wettenbank search error:', error);
            elements.wettenbankStatus.textContent = 'Fout bij zoeken in Wettenbank';
            showNotification('Er is een fout opgetreden bij het zoeken in de Wettenbank', 'error');
        }
    };

    const displayWettenbankResults = (results) => {
        if (results.length === 0) {
            elements.wettenbankResults.innerHTML = '<p class="text-muted">Geen resultaten gevonden in Wettenbank.</p>';
            elements.wettenbankStatus.textContent = 'Geen resultaten gevonden';
            return;
        }
        
        elements.wettenbankStatus.textContent = `${results.length} resultaten gevonden in Wettenbank`;
        
        const html = results.map(result => `
            <div class="wettenbank-item">
                <h4><a href="${result.url}" target="_blank">${result.title}</a></h4>
                <p>${result.description}</p>
                <div class="wettenbank-meta">
                    <a href="${result.url}" target="_blank">Bron: ${result.source}</a>
                </div>
            </div>
        `).join('');
        
        elements.wettenbankResults.innerHTML = html;
    };

    // --- UTILITY FUNCTIONS ---
    const showLoading = (show) => {
        elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    };

    const showNotification = (message, type = 'info') => {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = `status-message ${type}`;
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '1000';
        notification.style.maxWidth = '300px';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };

    const saveStateToURL = () => {
        // Save current filter state to URL for bookmarking
        const params = new URLSearchParams();
        
        if (elements.quickSearchInput.value) params.set('q', elements.quickSearchInput.value);
        if (elements.subject.value) params.set('subject', elements.subject.value);
        if (elements.procedure.value) params.set('procedure', elements.procedure.value);
        if (elements.dateFrom.value) params.set('dateFrom', elements.dateFrom.value);
        if (elements.dateTo.value) params.set('dateTo', elements.dateTo.value);
        if (elements.sortOrder.value !== 'DESC') params.set('sort', elements.sortOrder.value);
        
        const checkedDocType = document.querySelector('input[name="documentType"]:checked');
        if (checkedDocType && checkedDocType.value) params.set('type', checkedDocType.value);
        
        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        history.replaceState({}, '', newUrl);
    };

    const loadStateFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('q')) elements.quickSearchInput.value = params.get('q');
        if (params.get('subject')) elements.subject.value = params.get('subject');
        if (params.get('procedure')) elements.procedure.value = params.get('procedure');
        if (params.get('dateFrom')) elements.dateFrom.value = params.get('dateFrom');
        if (params.get('dateTo')) elements.dateTo.value = params.get('dateTo');
        if (params.get('sort')) elements.sortOrder.value = params.get('sort');
        
        if (params.get('type')) {
            const radio = document.querySelector(`input[name="documentType"][value="${params.get('type')}"]`);
            if (radio) radio.checked = true;
        }
    };

    // --- START APPLICATION ---
    initializeApp();
});
