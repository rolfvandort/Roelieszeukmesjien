document.addEventListener('DOMContentLoaded', () => {
    // --- PROXY-INSTELLING ---
    const PROXY_URL = 'https://corsproxy.io/?';

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
        // Basis elementen
        jurisprudenceCard: document.getElementById('jurisprudenceCard'),
        apiFilters: document.getElementById('apiFilters'),
        showFiltersButton: document.getElementById('showFiltersButton'),
        filterToggleIcon: document.getElementById('filterToggleIcon'),
        resetFiltersButton: document.getElementById('resetFiltersButton'),

        // Quick search
        quickSearchInput: document.getElementById('quickSearchInput'),
        quickSearchButton: document.getElementById('quickSearchButton'),

        // Filter elementen
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

        // Advanced filters
        advancedFilters: document.getElementById('advancedFilters'),
        toggleAdvanced: document.getElementById('toggleAdvanced'),
        advancedToggleIcon: document.getElementById('advancedToggleIcon'),
        creator: document.getElementById('creator'),
        clearCreator: document.getElementById('clearCreator'),
        creatorSuggestions: document.getElementById('creatorSuggestions'),

        // Search buttons
        apiSearchButton: document.getElementById('apiSearchButton'),
        smartFilterButton: document.getElementById('smartFilterButton'),

        // Results
        loadingIndicator: document.getElementById('loadingIndicator'),
        smartSearchSection: document.getElementById('smartSearchSection'),
        smartSearchInput: document.getElementById('smartSearchInput'),
        searchInCheckboxes: document.querySelectorAll('input[name="searchIn"]'),
        jurisprudenceStatus: document.getElementById('jurisprudenceStatus'),
        jurisprudenceResults: document.getElementById('jurisprudenceResults'),
        jurisprudencePagination: document.getElementById('jurisprudencePagination'),

        // Sidebar
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
        const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        elements.dateFrom.max = today.toISOString().split('T')[0];
        elements.dateTo.max = today.toISOString().split('T')[0];
        elements.modifiedFrom.max = today.toISOString().split('T')[0];
        elements.modifiedTo.max = today.toISOString().split('T')[0];
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        // Filter toggle
        elements.showFiltersButton.addEventListener('click', toggleFilters);
        elements.resetFiltersButton.addEventListener('click', resetAllFilters);
        elements.toggleAdvanced.addEventListener('click', toggleAdvancedFilters);

        // Quick search
        elements.quickSearchButton.addEventListener('click', handleQuickSearch);
        elements.quickSearchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleQuickSearch();
        });

        // Period preset
        elements.periodPreset.addEventListener('change', handlePeriodPresetChange);

        // Date validation
        elements.dateFrom.addEventListener('change', validateDateRange);
        elements.dateTo.addEventListener('change', validateDateRange);
        elements.modifiedFrom.addEventListener('change', validateModifiedDateRange);
        elements.modifiedTo.addEventListener('change', validateModifiedDateRange);

        // Autocomplete
        elements.creator.addEventListener('input', () => handleAutocompleteDebounced(elements.creator, elements.creatorSuggestions, instanties));
        elements.clearCreator.addEventListener('click', clearCreatorInput);

        // Search buttons
        elements.apiSearchButton.addEventListener('click', handleJurisprudenceSearch);
        elements.smartFilterButton.addEventListener('click', handleSmartSearch);
        elements.smartSearchInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleSmartSearch();
        });

        // Results interaction
        elements.jurisprudenceResults.addEventListener('click', handleResultsClick);

        // Wettenbank
        elements.wettenbankSearchButton.addEventListener('click', handleWettenbankSearch);
        elements.wettenbankKeyword.addEventListener('keypress', e => {
            if (e.key === 'Enter') handleWettenbankSearch();
        });

        // Global click handler
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.autocomplete-container')) {
                elements.creatorSuggestions.innerHTML = '';
            }
        });

        // Form change handler for URL state
        elements.apiFilters.addEventListener('change', saveStateToURL);
    };

    // --- FILTER MANAGEMENT ---
    const toggleFilters = () => {
        isFiltersVisible = !isFiltersVisible;
        elements.apiFilters.style.display = isFiltersVisible ? 'block' : 'none';
        elements.filterToggleIcon.textContent = isFiltersVisible ? '▲' : '▼';
        elements.showFiltersButton.innerHTML = `<span id="filterToggleIcon">${isFiltersVisible ? '▲' : '▼'}</span> ${isFiltersVisible ? 'Verberg filters' : 'Geavanceerd zoeken'}`;
        elements.resetFiltersButton.style.display = isFiltersVisible ? 'inline-block' : 'none';
    };

    const toggleAdvancedFilters = () => {
        isAdvancedVisible = !isAdvancedVisible;
        elements.advancedFilters.style.display = isAdvancedVisible ? 'block' : 'none';
        elements.advancedToggleIcon.textContent = isAdvancedVisible ? '▲' : '▼';
        elements.toggleAdvanced.innerHTML = `<span id="advancedToggleIcon">${isAdvancedVisible ? '▲' : '▼'}</span> ${isAdvancedVisible ? 'Minder opties' : 'Meer opties'}`;
    };

    const resetAllFilters = () => {
        // Reset all form elements
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

        // Reset radio buttons
        elements.documentTypeRadios.forEach(radio => {
            radio.checked = radio.value === '';
        });

        // Clear results
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
        elements.jurisprudenceStatus.style.display = 'none';
        elements.smartSearchSection.classList.add('hidden');
        elements.smartSearchSection.classList.remove('visible');

        // Clear URL state
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
                    today.setFullYear(today.getFullYear() - 1);
                    today.setMonth(11);
                    today.setDate(31);
                    break;
                default:
                    elements.dateFrom.value = '';
                    elements.dateTo.value = '';
                    return;
            }
            
            elements.dateFrom.value = fromDate.toISOString().split('T')[0];
            elements.dateTo.value = today.toISOString().split('T')[0];
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
            suggestions.innerHTML = '<div class="no-results">Geen instanties gevonden</div>';
            return;
        }

        matches.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.name;
            div.addEventListener('click', () => {
                input.value = item.name;
                input.dataset.id = item.id;
                suggestions.innerHTML = '';
                elements.clearCreator.style.display = 'inline-block';
            });
            suggestions.appendChild(div);
        });
    };

    const clearCreatorInput = () => {
        elements.creator.value = '';
        elements.creator.removeAttribute('data-id');
        elements.creatorSuggestions.innerHTML = '';
        elements.clearCreator.style.display = 'none';
    };

    // --- SEARCH FUNCTIONS ---
    const handleQuickSearch = async () => {
        const query = elements.quickSearchInput.value.trim();
        if (!query) {
            showNotification('Voer een zoekterm in', 'error');
            return;
        }

        // Reset filters for quick search
        resetAllFilters();
        
        // Show loading
        showLoading(true);
        
        const params = new URLSearchParams();
        params.append('return', 'DOC');
        params.append('max', '1000');
        params.append('sort', 'DESC');

        // Try to detect if it's an ECLI
        if (query.toUpperCase().startsWith('ECLI:')) {
            // Search by specific ECLI
            try {
                const response = await fetch(`${PROXY_URL}https://data.rechtspraak.nl/uitspraken/content?id=${encodeURIComponent(query)}`);
                if (response.ok) {
                    // Single result found
                    showNotification('ECLI gevonden, toon individueel resultaat', 'success');
                    return;
                }
            } catch (error) {
                console.log('ECLI niet gevonden, probeer algemene zoek');
            }
        }

        // General search - search in recent period with broad criteria
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        params.append('modified', sixMonthsAgo.toISOString().split('T')[0] + 'T00:00:00');

        try {
            const response = await fetch(`${PROXY_URL}https://data.rechtspraak.nl/uitspraken/zoeken?${params.toString()}`);
            if (!response.ok) throw new Error(`API-verzoek mislukt: ${response.status}`);

            const xmlString = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
            
            if (xmlDoc.getElementsByTagName("parsererror").length) {
                throw new Error("Fout bij het verwerken van de XML-data.");
            }

            const entries = xmlDoc.getElementsByTagName('entry');
            masterResults = Array.from(entries).map(entry => {
                const zaaknummerNode = entry.querySelector('zaaknummer, \\:zaaknummer');
                return {
                    title: entry.querySelector('title')?.textContent || 'Geen titel',
                    ecli: entry.querySelector('id')?.textContent || '',
                    summary: entry.querySelector('summary')?.textContent || 'Geen samenvatting.',
                    updated: new Date(entry.querySelector('updated')?.textContent),
                    zaaknummer: zaaknummerNode?.textContent || 'Niet gevonden'
                };
            });

            // Filter results based on quick search query
            currentFilteredResults = masterResults.filter(item => {
                const searchText = (item.title + ' ' + item.summary + ' ' + item.ecli + ' ' + item.zaaknummer).toLowerCase();
                return searchText.includes(query.toLowerCase());
            });

            showLoading(false);

            if (currentFilteredResults.length === 0) {
                showStatus(elements.jurisprudenceStatus, `Geen resultaten gevonden voor "${query}". Probeer andere zoektermen.`, 'error');
                return;
            }

            showStatus(elements.jurisprudenceStatus, `${currentFilteredResults.length} resultaten gevonden voor "${query}"`, 'success');
            currentPage = 1;
            renderJurisprudencePage(currentPage);
            
            // Auto-show smart search section
            elements.smartSearchSection.classList.remove('hidden');
            elements.smartSearchSection.classList.add('visible');
            elements.smartSearchInput.value = query;

        } catch (error) {
            showLoading(false);
            showStatus(elements.jurisprudenceStatus, `Fout: ${error.message}. Probeer het opnieuw.`, 'error');
            console.error(error);
        }
    };

    const handleJurisprudenceSearch = async () => {
        showLoading(true);
        unpinItem();
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
        elements.smartSearchSection.classList.remove('visible');
        elements.smartSearchSection.classList.add('hidden');

        const params = new URLSearchParams();

        // Date parameters
        if (elements.dateFrom.value) params.append('date', elements.dateFrom.value);
        if (elements.dateTo.value) params.append('date', elements.dateTo.value);
        if (elements.modifiedFrom.value) params.append('modified', elements.modifiedFrom.value);
        if (elements.modifiedTo.value) params.append('modified', elements.modifiedTo.value);

        // Other filters
        if (elements.subject.value) params.append('subject', elements.subject.value);
        if (elements.procedure.value) params.append('procedure', elements.procedure.value);
        if (elements.creator.dataset.id) params.append('creator', elements.creator.dataset.id);

        // Document type from radio buttons
        const selectedType = document.querySelector('input[name="documentType"]:checked')?.value;
        if (selectedType) params.append('type', selectedType);

        // Fixed parameters
        params.append('return', 'DOC');
        params.append('max', '1000');
        params.append('sort', elements.sortOrder.value);

        const baseUrl = 'https://data.rechtspraak.nl/uitspraken/zoeken';
        const targetUrl = `${baseUrl}?${params.toString()}`;
        const requestUrl = `${PROXY_URL}${targetUrl}`;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error(`API-verzoek mislukt: ${response.status}`);

            const xmlString = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
            
            if (xmlDoc.getElementsByTagName("parsererror").length) {
                throw new Error("Fout bij het verwerken van de XML-data.");
            }

            const entries = xmlDoc.getElementsByTagName('entry');
            masterResults = Array.from(entries).map(entry => {
                const zaaknummerNode = entry.querySelector('zaaknummer, \\:zaaknummer');
                return {
                    title: entry.querySelector('title')?.textContent || 'Geen titel',
                    ecli: entry.querySelector('id')?.textContent || '',
                    summary: entry.querySelector('summary')?.textContent || 'Geen samenvatting.',
                    updated: new Date(entry.querySelector('updated')?.textContent),
                    zaaknummer: zaaknummerNode?.textContent || 'Niet gevonden'
                };
            });

            currentFilteredResults = [...masterResults];
            showLoading(false);

            if (masterResults.length === 0) {
                showStatus(elements.jurisprudenceStatus, 'Geen resultaten gevonden voor deze filters. Probeer minder specifieke criteria.', 'error');
                return;
            }

            showStatus(elements.jurisprudenceStatus, `${masterResults.length} resultaten gevonden`, 'success');
            currentPage = 1;
            renderJurisprudencePage(currentPage);

            elements.smartSearchSection.classList.remove('hidden');
            elements.smartSearchSection.classList.add('visible');

            // Save successful search to history
            saveToSearchHistory(params);

        } catch (error) {
            showLoading(false);
            showStatus(elements.jurisprudenceStatus, `Fout: ${error.message}. Controleer je internetverbinding.`, 'error');
            console.error(error);
        }
    };

    const handleSmartSearch = () => {
        const keyword = elements.smartSearchInput.value.toLowerCase().trim();
        const searchIn = Array.from(elements.searchInCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        if (searchIn.length === 0) {
            showNotification('Selecteer minimaal één veld om in te zoeken', 'error');
            return;
        }

        currentFilteredResults = masterResults.filter(item => {
            if (!keyword) return true;

            const searchTargets = [];
            if (searchIn.includes('title')) searchTargets.push(item.title);
            if (searchIn.includes('summary')) searchTargets.push(item.summary);
            if (searchIn.includes('ecli')) searchTargets.push(item.ecli);
            if (searchIn.includes('zaaknummer')) searchTargets.push(item.zaaknummer);

            return searchTargets.some(target => 
                target.toLowerCase().includes(keyword)
            );
        });

        showStatus(elements.jurisprudenceStatus, 
            `${currentFilteredResults.length} van de ${masterResults.length} resultaten komen overeen${keyword ? ` met "${keyword}"` : ''}`, 
            'success'
        );
        
        currentPage = 1;
        renderJurisprudencePage(currentPage);
    };

    // --- RESULTS RENDERING ---
    const renderJurisprudencePage = (page) => {
        const startIndex = (page - 1) * resultsPerPage;
        const endIndex = startIndex + resultsPerPage;
        const pageResults = currentFilteredResults.slice(startIndex, endIndex);

        let html = '';
        pageResults.forEach((item, index) => {
            const globalIndex = startIndex + index;
            const formattedDate = item.updated.toLocaleDateString('nl-NL');
            
            html += `
                <div class="result-item" data-index="${globalIndex}">
                    <div class="result-item-header">
                        <h3><a href="https://uitspraken.rechtspraak.nl/inziendocument?id=${encodeURIComponent(item.ecli)}" target="_blank">${item.title}</a></h3>
                        <button class="pin-button" title="Pin dit resultaat" data-action="pin">📌</button>
                    </div>
                    <div class="meta-info">
                        <span><strong>ECLI:</strong> ${item.ecli}</span>
                        <span><strong>Zaaknummer:</strong> ${item.zaaknummer}</span>
                        <span><strong>Bijgewerkt:</strong> ${formattedDate}</span>
                    </div>
                    <div class="summary" id="summary-${globalIndex}">
                        ${item.summary}
                    </div>
                    <div class="read-more" data-target="summary-${globalIndex}">Lees meer</div>
                    <div class="full-link">
                        <a href="https://uitspraken.rechtspraak.nl/inziendocument?id=${encodeURIComponent(item.ecli)}" target="_blank">
                            📄 Bekijk volledige uitspraak
                        </a>
                    </div>
                </div>
            `;
        });

        elements.jurisprudenceResults.innerHTML = html;
        renderPagination(page, Math.ceil(currentFilteredResults.length / resultsPerPage));
    };

    const renderPagination = (currentPage, totalPages) => {
        if (totalPages <= 1) {
            elements.jurisprudencePagination.innerHTML = '';
            return;
        }

        let html = '<div class="pagination-controls">';
        
        // Previous button
        html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">← Vorige</button>`;
        
        // Page indicator
        html += `<span id="pageIndicator">Pagina ${currentPage} van ${totalPages}</span>`;
        
        // Next button
        html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Volgende →</button>`;
        
        html += '</div>';
        
        // Results summary
        const startResult = (currentPage - 1) * resultsPerPage + 1;
        const endResult = Math.min(currentPage * resultsPerPage, currentFilteredResults.length);
        html += `<div class="results-summary">Resultaten ${startResult}-${endResult} van ${currentFilteredResults.length}</div>`;
        
        elements.jurisprudencePagination.innerHTML = html;
    };

    // Global function for pagination (called from rendered HTML)
    window.changePage = (page) => {
        currentPage = page;
        renderJurisprudencePage(currentPage);
        elements.jurisprudenceResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- RESULTS INTERACTION ---
    const handleResultsClick = (e) => {
        if (e.target.classList.contains('read-more')) {
            const targetId = e.target.getAttribute('data-target');
            const summaryElement = document.getElementById(targetId);
            
            if (summaryElement.classList.contains('expanded')) {
                summaryElement.classList.remove('expanded');
                e.target.textContent = 'Lees meer';
            } else {
                summaryElement.classList.add('expanded');
                e.target.textContent = 'Lees minder';
            }
        } else if (e.target.getAttribute('data-action') === 'pin') {
            const index = parseInt(e.target.closest('.result-item').getAttribute('data-index'));
            pinItem(currentFilteredResults[index % resultsPerPage]);
        }
    };

    const pinItem = (item) => {
        elements.pinnedItemContent.innerHTML = `
            <h4>${item.title}</h4>
            <div class="meta-info">
                <span><strong>ECLI:</strong> ${item.ecli}</span>
                <span><strong>Bijgewerkt:</strong> ${item.updated.toLocaleDateString('nl-NL')}</span>
            </div>
            <p>${item.summary.substring(0, 200)}${item.summary.length > 200 ? '...' : ''}</p>
            <div class="pinned-actions">
                <a href="https://uitspraken.rechtspraak.nl/inziendocument?id=${encodeURIComponent(item.ecli)}" target="_blank" class="primary-button">
                    📄 Bekijk volledig
                </a>
                <button class="tertiary-button" onclick="unpinItem()">📌 Unpin</button>
            </div>
        `;
        
        elements.pinnedItemContainer.style.display = 'block';
        showNotification('Item vastgepind', 'success');
    };

    const unpinItem = () => {
        elements.pinnedItemContainer.style.display = 'none';
        elements.pinnedItemContent.innerHTML = '';
    };

    // Global function for unpinning
    window.unpinItem = unpinItem;

    // --- WETTENBANK SEARCH ---
    const handleWettenbankSearch = async () => {
        showStatus(elements.wettenbankStatus, 'Wettenbank wordt doorzocht...');
        elements.wettenbankResults.innerHTML = '';

        const keyword = elements.wettenbankKeyword.value.trim();
        if (!keyword) {
            showStatus(elements.wettenbankStatus, 'Voer een trefwoord in.', 'error');
            return;
        }

        const params = new URLSearchParams({
            query: keyword,
            version: '1.2',
            operation: 'searchRetrieve',
            'x-connection': 'w',
            maximumRecords: '50'
        });

        const baseUrl = 'https://zoekdienst.overheid.nl/sru/Search';
        const targetUrl = `${baseUrl}?${params.toString()}`;
        const requestUrl = `${PROXY_URL}${targetUrl}`;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error(`API-verzoek mislukt: ${response.status}`);

            const xmlString = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
            
            if (xmlDoc.getElementsByTagName("parsererror").length) {
                throw new Error("Fout bij het verwerken van de XML-data.");
            }

            const records = xmlDoc.querySelectorAll('record');
            showStatus(elements.wettenbankStatus, `${records.length} resultaten gevonden in Wettenbank.`, 'success');

            if (records.length === 0) return;

            let html = '<div class="wettenbank-results">';
            Array.from(records).slice(0, 10).forEach(record => {
                const title = record.querySelector('dc\\:title, title')?.textContent || 'Geen titel';
                const identifier = record.querySelector('dc\\:identifier, identifier')?.textContent || '';
                const description = record.querySelector('dc\\:description, description')?.textContent || 'Geen beschrijving beschikbaar.';

                html += `
                    <div class="wettenbank-item">
                        <h4><a href="${identifier}" target="_blank">${title}</a></h4>
                        <p>${description.substring(0, 200)}${description.length > 200 ? '...' : ''}</p>
                        <div class="wettenbank-meta">
                            <small>📄 <a href="${identifier}" target="_blank">Bekijk document</a></small>
                        </div>
                    </div>
                `;
            });
            html += '</div>';

            elements.wettenbankResults.innerHTML = html;

        } catch (error) {
            showStatus(elements.wettenbankStatus, `Fout: ${error.message}. Probeer het opnieuw.`, 'error');
            console.error(error);
        }
    };

    // --- UTILITY FUNCTIONS ---
    const showLoading = (show) => {
        elements.loadingIndicator.style.display = show ? 'flex' : 'none';
        elements.apiSearchButton.disabled = show;
        if (show) {
            elements.apiSearchButton.innerHTML = '<span class="spinner-small"></span> Zoeken...';
        } else {
            elements.apiSearchButton.innerHTML = '<span class="button-icon">🔍</span> Zoek uitspraken';
        }
    };

    const showStatus = (element, message, type = 'info') => {
        element.textContent = message;
        element.className = `status-message ${type}`;
        element.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    };

    const showNotification = (message, type = 'info') => {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            backgroundColor: type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff',
            zIndex: '9999',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    const saveToSearchHistory = (params) => {
        const searchEntry = {
            timestamp: new Date(),
            params: Object.fromEntries(params),
            resultCount: masterResults.length
        };
        
        searchHistory.unshift(searchEntry);
        if (searchHistory.length > 10) {
            searchHistory = searchHistory.slice(0, 10);
        }
        
        localStorage.setItem('rechtspraakSearchHistory', JSON.stringify(searchHistory));
    };

    const saveStateToURL = () => {
        const params = new URLSearchParams();
        
        // Save current filter state to URL
        if (elements.subject.value) params.set('subject', elements.subject.value);
        if (elements.procedure.value) params.set('procedure', elements.procedure.value);
        if (elements.dateFrom.value) params.set('dateFrom', elements.dateFrom.value);
        if (elements.dateTo.value) params.set('dateTo', elements.dateTo.value);
        
        const selectedType = document.querySelector('input[name="documentType"]:checked')?.value;
        if (selectedType) params.set('type', selectedType);
        
        const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        history.replaceState({}, '', newUrl);
    };

    const loadStateFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('subject')) elements.subject.value = params.get('subject');
        if (params.get('procedure')) elements.procedure.value = params.get('procedure');
        if (params.get('dateFrom')) elements.dateFrom.value = params.get('dateFrom');
        if (params.get('dateTo')) elements.dateTo.value = params.get('dateTo');
        if (params.get('type')) {
            const radio = document.querySelector(`input[name="documentType"][value="${params.get('type')}"]`);
            if (radio) radio.checked = true;
        }
    };

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Focus quick search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            elements.quickSearchInput.focus();
        }
        
        // Escape: Clear search or close suggestions
        if (e.key === 'Escape') {
            elements.creatorSuggestions.innerHTML = '';
            document.activeElement.blur();
        }
    });

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .spinner-small {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // Initialize the application
    initializeApp();
});
