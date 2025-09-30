document.addEventListener('DOMContentLoaded', () => {
    // --- PROXY-INSTELLING & API Limits ---
    const PROXY_URL = 'https://corsproxy.io/?';
    const MAX_JURISPRUDENCE_RESULTS = 10000;

    // --- DATA (volledig) ---
    const rechtsgebieden = [
        { name: 'Bestuursrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#bestuursrecht' },
        { name: 'Civiel recht', id: 'http://psi.rechtspraak.nl/rechtsgebied#civielRecht' },
        { name: 'Internationaal publiekrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#internationaalPubliekrecht' },
        { name: 'Strafrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#strafrecht' }
    ];
    const proceduresoorten = [
        { name: 'Artikel 81 RO-zaken', id: 'http://psi.rechtspraak.nl/procedure#artikel81ROzaken' },
        { name: 'Bodemzaak', id: 'http://psi.rechtspraak.nl/procedure#bodemzaak' },
        /* ... (heel je lijst van proceduresoorten) ... */
        { name: 'Beslissing RC', id: 'http://psi.rechtspraak.nl/procedure#beslissingRC' }
    ];
    const instanties = [
        { name: "Hoge Raad", id: "http://standaarden.overheid.nl/owms/terms/Hoge_Raad_der_Nederlanden" },
        { name: "Raad van State", id: "http://standaarden.overheid.nl/owms/terms/Raad_van_State" },
        /* ... (heel je lijst van instanties) ... */
        { name: "Gerechtshof 's-Hertogenbosch", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_'s-Hertogenbosch" }
    ];

    // --- DOM ELEMENTEN ---
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

    // --- GLOBALE STATE ---
    let jurisprudenceMasterResults = [];
    let jurisprudenceCurrentResults = [];
    let totalJurisprudenceResults = 0;
    let currentJurisprudenceParams = null;
    let jurisprudenceCurrentPage = 1;
    const jurisprudenceResultsPerPage = 10;
    let isJurisprudenceLoadingInBackground = false;

    let wettenbankCurrentQuery = '';
    let wettenbankActiveFacets = {};
    let wettenbankCurrentPage = 1;
    let wettenbankTotalResults = 0;
    const wettenbankResultsPerPage = 10;

    let debounceTimer = null;
    let isFiltersVisible = false;
    let isWettenbankFiltersVisible = false;
        // --- INITIALISATIE ---
    const initializeApp = () => {
        populateSelect(elements.subject, rechtsgebieden, 'Alle rechtsgebieden');
        populateSelect(elements.procedure, proceduresoorten, 'Alle procedures');
        setupEventListeners();
    };

    const populateSelect = (selectElement, items, defaultOptionText) => {
        selectElement.innerHTML = `<option value="">-- ${defaultOptionText} --</option>`;
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.name;
            selectElement.appendChild(opt);
        });
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
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
        elements.wettenbankResults.addEventListener('click', handleResultsClick);
        elements.wettenbankSearchButton.addEventListener('click', () => handleWettenbankSearch(true));
        elements.wettenbankKeyword.addEventListener('keypress', e => { if (e.key === 'Enter') handleWettenbankSearch(true); });
        elements.toggleWettenbankFiltersButton.addEventListener('click', toggleWettenbankFilters);
        elements.wettenbankFacets.addEventListener('change', handleFacetChange);

        elements.jurisprudencePagination.addEventListener('click', handlePaginationClick);
        elements.wettenbankPagination.addEventListener('click', handlePaginationClick);
        elements.jurisprudencePagination.addEventListener('change', handlePageInputChange);
        elements.wettenbankPagination.addEventListener('change', handlePageInputChange);

        elements.closeKeywordModal.addEventListener('click', hideKeywordModal);
        elements.searchWithKeywordsButton.addEventListener('click', searchWithSelectedKeywords);
        elements.keywordModal.addEventListener('click', (e) => {
            if (e.target.id === 'keywordModal') {
                hideKeywordModal();
            }
        });

        document.addEventListener('click', (e) => { 
            if (!e.target.closest('.autocomplete-container')) { 
                elements.creatorSuggestions.innerHTML = ''; 
            } 
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); elements.quickSearchInput.focus(); }
            if (e.key === 'Escape') { 
                if (elements.keywordModal.style.display === 'flex') hideKeywordModal();
                else { elements.creatorSuggestions.innerHTML = ''; document.activeElement.blur(); }
            }
        });
    };
    // --- FILTERS MANAGEMENT ---
    const toggleFilters = () => {
        isFiltersVisible = !isFiltersVisible;
        elements.apiFilters.style.display = isFiltersVisible ? 'block' : 'none';
        elements.showFiltersButton.innerHTML = `<span id="filterToggleIcon">${isFiltersVisible ? '▲' : '▼'}</span> ${isFiltersVisible ? 'Verberg filters' : 'Geavanceerd zoeken'}`;
        elements.showFiltersButton.setAttribute('aria-expanded', isFiltersVisible.toString());
        elements.resetFiltersButton.style.display = isFiltersVisible ? 'inline-flex' : 'none';
    };
    const resetAllFilters = () => {
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
    };

    const handlePeriodPresetChange = () => {
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
    };

    // --- AUTOCOMPLETE INSTANTIE ---
    const handleAutocompleteDebounced = (input, suggestions, items) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => handleAutocomplete(input, suggestions, items), 250);
    };
    const handleAutocomplete = (input, suggestions, items) => {
        const query = input.value.toLowerCase().trim();
        suggestions.innerHTML = '';
        elements.clearCreator.style.display = query.length > 0 ? 'inline-block' : 'none';
        if (query.length < 2) return;
        const matches = items.filter(item => item.name.toLowerCase().includes(query)).slice(0, 8);
        if (matches.length === 0) { suggestions.innerHTML = '<div class="no-results">Geen instanties gevonden</div>'; return; }
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
    };
    const clearCreatorInput = () => { 
        elements.creator.value = ''; 
        elements.creator.removeAttribute('data-id'); 
        elements.creatorSuggestions.innerHTML = ''; 
        elements.clearCreator.style.display = 'none';
    };

    // --- BOUW FILTERPARAMETERS ---
    const buildJurisprudenceParams = (from = 0, includeSort = false) => {
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
    };

    // --- ZOEK JURISPRUDENTIE ---
    const handleJurisprudenceSearch = async (isNewSearch = false) => {
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

                sortAndRenderJurisprudence();

                // Feedback als er slechts deel-resultaat getoond wordt
                if(totalJurisprudenceResults > 1000) {
                    showNotification('Let op: slechts de eerste 1000 van mogelijk meer resultaten zijn geladen. Verfijn uw zoekopdracht voor volledigheid.', 'warning');
                    loadAllJurisprudenceInBackground();
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
    };

    // --- BACKGROUND LADEN VOOR > 1000 ---
    const loadAllJurisprudenceInBackground = async () => {
        if (isJurisprudenceLoadingInBackground) return;
        isJurisprudenceLoadingInBackground = true;
        elements.backgroundLoader.style.display = 'flex';

        let from = jurisprudenceMasterResults.length + 1;
        const maxToFetch = Math.min(totalJurisprudenceResults, MAX_JURISPRUDENCE_RESULTS);

        while(from <= maxToFetch) {
            const includeSort = (elements.sortOrder.value === 'ASC' || elements.sortOrder.value === 'DESC');
            const params = buildJurisprudenceParams(from, includeSort);
            const requestUrl = `${PROXY_URL}${encodeURIComponent(`https://data.rechtspraak.nl/uitspraken/zoeken?${params.toString()}`)}`;

            try {
                const response = await fetch(requestUrl);
                if (!response.ok) break;
                const xmlString = await response.text();
                const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
                const entries = Array.from(xmlDoc.getElementsByTagName('entry'));
                if(entries.length === 0) break;
                const newResults = entries.map(entry => parseJurisprudenceEntry(entry));
                jurisprudenceMasterResults.push(...newResults);

                sortAndRenderJurisprudence();

                from += entries.length;
            } catch (error) {
                console.error("Fout bij laden op achtergrond:", error);
                break;
            }
        }

        isJurisprudenceLoadingInBackground = false;
        elements.backgroundLoader.style.display = 'none';
        showNotification(`Alle ${jurisprudenceMasterResults.length} resultaten zijn geladen.`, 'success');
        sortAndRenderJurisprudence();
    };

    const parseJurisprudenceEntry = (entry) => {
        // Bronnen uit API/Atom
        const fullTitle = entry.querySelector('title')?.textContent || 'Geen titel beschikbaar';
        const ecli = entry.querySelector('id')?.textContent || 'Geen ECLI';

        // Metadata datums
        const lastUpdatedDateRaw = entry.querySelector('updated')?.textContent;
        const lastUpdatedDate = lastUpdatedDateRaw ? new Date(lastUpdatedDateRaw) : null;

        const issuedDateRaw = entry.querySelector('issued')?.textContent;
        const issuedDate = issuedDateRaw ? new Date(issuedDateRaw) : null;

        const decisionDateRaw = entry.querySelector('date')?.textContent;
        let decisionDateObject = decisionDateRaw ? new Date(decisionDateRaw) : null;
        let uitspraakdatum = decisionDateObject ? decisionDateObject.toLocaleDateString('nl-NL') : 'Niet beschikbaar';

        let instantie = 'N/A';
        let zaaknummer = 'N/A';

        // Extract instantie, uitspraakdatum (fallback) en zaaknummer uit de title
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

        if (!decisionDateObject) {
            decisionDateObject = issuedDate || lastUpdatedDate;
        }
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
    };

    const sortAndRenderJurisprudence = () => {
        handleSmartSearch();
        const sortValue = elements.sortOrder.value;
        if (sortValue === 'date-desc' || sortValue === 'date-asc') {
            if (jurisprudenceMasterResults.length < totalJurisprudenceResults && !isJurisprudenceLoadingInBackground) {
                showNotification('Let op: sortering op uitspraakdatum wordt enkel toegepast op de reeds geladen resultaten.', 'warning');
            }
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
    };

    const handleSortChange = () => {
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
    };

    const handleSmartSearch = () => {
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
    };

    // --- PAGINERING JURISPRUDENTIE ---
    const handlePaginationClick = (event) => {
        if (event.target.tagName === 'BUTTON') {
            const type = event.target.dataset.type;
            const page = parseInt(event.target.dataset.page, 10);
            if (type && !isNaN(page)) changePage(type, page);
        }
    };

    const handlePageInputChange = (event) => {
        if (event.target.classList.contains('page-input')) {
            const type = event.target.dataset.type;
            const totalPages = parseInt(event.target.dataset.totalPages, 10);
            let page = parseInt(event.target.value, 10);
            if (isNaN(page) || page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            event.target.value = page;
            changePage(type, page);
        }
    };

    const changePage = (type, page) => {
        page = parseInt(page, 10);
        if (isNaN(page) || page < 1) page = 1;
        if (type === 'jurisprudence') {
            const totalPages = Math.ceil(jurisprudenceCurrentResults.length / jurisprudenceResultsPerPage);
            if (page > totalPages) page = totalPages;
            jurisprudenceCurrentPage = page;
            renderJurisprudenceResults();
            elements.jurisprudenceResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (type === 'wettenbank') {
            const totalPages = Math.ceil(wettenbankTotalResults / wettenbankResultsPerPage);
            if (page > totalPages) page = totalPages;
            wettenbankCurrentPage = page;
            handleWettenbankSearch(false);
            elements.wettenbankResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    // --- WETTENBANK SEARCH (SRU 2.0) ---
    const handleWettenbankSearch = async (isNewSearch = false) => {
        if (isNewSearch) {
            wettenbankCurrentQuery = elements.wettenbankKeyword.value.trim();
            wettenbankCurrentPage = 1;
            wettenbankActiveFacets = {};
            isWettenbankFiltersVisible = false;
            elements.wettenbankFacets.style.display = 'none';
            elements.toggleWettenbankFiltersButton.style.display = 'none';
        }

        if (!wettenbankCurrentQuery || wettenbankCurrentQuery.length < 2) {
            showNotification('Voer een trefwoord in van minimaal 2 tekens.', 'error');
            return;
        }

        showStatus(elements.wettenbankStatus, 'Wettenbank wordt doorzocht...', 'info');
        elements.wettenbankResults.innerHTML = '';
        if (isNewSearch) elements.wettenbankFacets.innerHTML = '';

        // Maak CQL-query voor SRU
        const keywordQuery = `cql.textAndIndexes = "${wettenbankCurrentQuery.replace(/"/g, '\\"')}"`;
        const facetClauses = Object.entries(wettenbankActiveFacets).map(([, queries]) => {
            return queries.length > 1 ? `(${queries.join(' OR ')})` : queries.join('');
        }).filter(Boolean).join(' AND ');

        const finalQuery = facetClauses ? `(${keywordQuery}) AND (${facetClauses})` : keywordQuery;

        const params = new URLSearchParams({
            query: finalQuery,
            maximumRecords: wettenbankResultsPerPage,
            startRecord: ((wettenbankCurrentPage - 1) * wettenbankResultsPerPage) + 1
        });

        if (isNewSearch) {
            params.append('facetLimit', '10:w.organisatietype,10:dt.type');
        }

        const requestUrl = `${PROXY_URL}https://repository.overheid.nl/sru/Search`;

        try {
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            if (!response.ok) throw new Error(`API-verzoek mislukt: ${response.status} ${response.statusText}`);
            const xmlString = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
            if (xmlDoc.getElementsByTagName("parsererror").length) throw new Error("Fout bij verwerken XML.");
            
            wettenbankTotalResults = parseInt(xmlDoc.querySelector('numberOfRecords')?.textContent || '0', 10);

            if(wettenbankTotalResults === 0) {
                showStatus(elements.wettenbankStatus, `Geen resultaten gevonden voor "${wettenbankCurrentQuery}"`, 'warning');
                elements.wettenbankResults.innerHTML = '<p>Probeer een andere zoekterm.</p>';
                elements.wettenbankPagination.innerHTML = '';
                elements.toggleWettenbankFiltersButton.style.display = 'none';
                return;
            }

            showStatus(elements.wettenbankStatus, `${wettenbankTotalResults} resultaten voor "${wettenbankCurrentQuery}"`, 'success');
            
            renderWettenbankResults(xmlDoc);
            renderPagination(elements.wettenbankPagination, wettenbankCurrentPage, Math.ceil(wettenbankTotalResults / wettenbankResultsPerPage), 'wettenbank');
            if (isNewSearch) renderWettenbankFacets(xmlDoc);
        } catch (error) {
            showStatus(elements.wettenbankStatus, `Fout: ${error.message}.`, 'error');
            elements.wettenbankResults.innerHTML = '';
            elements.wettenbankFacets.innerHTML = '';
            console.error(error);
        }
    };

    const handleFacetChange = (e) => {
        const checkbox = e.target;
        if (checkbox.type !== 'checkbox') return;
        const index = checkbox.dataset.facetIndex;
        const query = checkbox.dataset.facetQuery;

        if (!wettenbankActiveFacets[index]) wettenbankActiveFacets[index] = [];

        if (checkbox.checked) {
            if (!wettenbankActiveFacets[index].includes(query)) {
                wettenbankActiveFacets[index].push(query);
            }
        } else {
            wettenbankActiveFacets[index] = wettenbankActiveFacets[index].filter(q => q !== query);
            if (wettenbankActiveFacets[index].length === 0) {
                delete wettenbankActiveFacets[index];
            }
        }

        wettenbankCurrentPage = 1;
        handleWettenbankSearch(false);
    };

    const toggleWettenbankFilters = () => {
        isWettenbankFiltersVisible = !isWettenbankFiltersVisible;
        elements.wettenbankFacets.style.display = isWettenbankFiltersVisible ? 'block' : 'none';
        elements.toggleWettenbankFiltersButton.innerHTML = `<span id="wettenbankFilterToggleIcon">${isWettenbankFiltersVisible ? '▲' : '▼'}</span> ${isWettenbankFiltersVisible ? 'Verberg filters' : 'Verfijn resultaten'}`;
    };
    // --- RENDERERS & UTILITY FUNCTIES ---
    const renderJurisprudenceResults = () => {
        elements.jurisprudenceResults.innerHTML = '';
        const keyword = elements.smartSearchInput.value.trim().toLowerCase() || elements.quickSearchInput.value.trim().toLowerCase();

        const startIndex = (jurisprudenceCurrentPage - 1) * jurisprudenceResultsPerPage;
        const endIndex = startIndex + jurisprudenceResultsPerPage;
        const paginatedResults = jurisprudenceCurrentResults.slice(startIndex, endIndex);

        paginatedResults.forEach((item, index) => {
            const globalIndex = startIndex + index;
            elements.jurisprudenceResults.innerHTML += createResultItemHTML(
                'jurisprudence', 
                highlightText(item.title, keyword), 
                item.link, 
                highlightText(item.summary, keyword),
                {
                    "ECLI": highlightText(item.ecli, keyword),
                    "Instantie": item.instantie,
                    "Uitspraakdatum": item.uitspraakdatum,
                    "Zaaknummer(s)": item.zaaknummer,
                    "Publicatiedatum": item.publicatiedatum,
                    "Laatste update": item.gewijzigd
                },
                `jurisprudence-${globalIndex}`
            );
        });

        if (jurisprudenceCurrentResults.length === 0 && totalJurisprudenceResults > 0) {
            elements.jurisprudenceResults.innerHTML = `<p class="status-message info" style="display:block;">Geen resultaten gevonden met uw filterterm. Wis de term om alle resultaten te zien.</p>`;
        }

        renderPagination(elements.jurisprudencePagination, jurisprudenceCurrentPage, Math.ceil(jurisprudenceCurrentResults.length / jurisprudenceResultsPerPage), 'jurisprudence');
    };

    const renderWettenbankResults = (xmlDoc) => {
        const records = xmlDoc.querySelectorAll('recordData');
        let html = '';
        records.forEach((record, index) => {
            const globalIndex = `wettenbank-${((wettenbankCurrentPage - 1) * wettenbankResultsPerPage) + index}`;
            const meta = record.querySelector('meta');

            const title = meta?.querySelector('title')?.textContent || 'Geen titel';
            const identifierLink = record.querySelector('preferredUrl')?.textContent || record.querySelector('identifier')?.textContent || '#';
            const abstract = meta?.querySelector('abstract')?.textContent;
            const creator = meta?.querySelector('creator')?.textContent || 'Onbekend';
            const dateText = meta?.querySelector('date')?.textContent;
            const formattedDate = dateText ? new Date(dateText).toLocaleDateString('nl-NL') : 'Onbekend';

            let contentHTML;
            if (abstract) {
                contentHTML = abstract;
            } else {
                const docType = meta?.querySelector('type')?.textContent;
                const publicationName = record.querySelector('publicatienaam')?.textContent;
                const subject = meta?.querySelector('subject')?.textContent;
                contentHTML = `<div class="kenmerken-blok"><strong>Kenmerken:</strong><ul>`;
                if (docType) contentHTML += `<li><strong>Type:</strong> ${docType}</li>`;
                if (publicationName) contentHTML += `<li><strong>Publicatie:</strong> ${publicationName}</li>`;
                if (subject) contentHTML += `<li><strong>Onderwerp:</strong> ${subject}</li>`;
                contentHTML += `</ul></div>`;
            }

            html += createResultItemHTML('wettenbank', title, identifierLink, contentHTML, { "Door": creator, "Datum": formattedDate }, globalIndex);
        });
        elements.wettenbankResults.innerHTML = html || "<p>Geen documenten gevonden.</p>";
    };

    const renderWettenbankFacets = (xmlDoc) => {
        const facets = xmlDoc.querySelectorAll('facet');
        if (facets.length === 0) { 
            elements.wettenbankFacets.innerHTML = ''; 
            elements.toggleWettenbankFiltersButton.style.display = 'none';
            return; 
        }
        let html = '<h3>Verfijn op:</h3>';
        const titleMap = { 'w.organisatietype': 'Organisatie Type', 'dt.type': 'Document Type' };
        facets.forEach(facet => {
            const index = facet.querySelector('index')?.textContent;
            const terms = facet.querySelectorAll('term');
            if (terms.length === 0) return;
            html += `<details class="facet-group" open><summary>${titleMap[index] || index}</summary><div class="facet-options">`;
            terms.forEach(term => {
                const actualTerm = term.querySelector('actualTerm')?.textContent;
                const count = term.querySelector('count')?.textContent;
                const query = term.querySelector('query')?.textContent;
                html += `<label class="checkbox-option"><input type="checkbox" data-facet-query='${query}' data-facet-index="${index}"><span class="checkmark"></span>${actualTerm} (${count})</label>`;
            });
            html += `</div></details>`;
        });
        elements.wettenbankFacets.innerHTML = html;
        elements.toggleWettenbankFiltersButton.style.display = 'inline-flex';
        elements.toggleWettenbankFiltersButton.innerHTML = `<span id="wettenbankFilterToggleIcon">▼</span> Verfijn resultaten`;
    };

    // --- UTILITY & STATE MANAGEMENT ---
    const handleResultsClick = (e) => {
        const target = e.target;
        const action = target.dataset.action;

        if (!action) {
             const searchLawsButton = e.target.closest('.search-related-laws-button');
             if (searchLawsButton) {
                 showKeywordModal(decodeURIComponent(searchLawsButton.dataset.summary));
             }
             return;
        }

        const resultItem = target.closest('.result-item');
        if (!resultItem) return;

        if (action === 'toggle-summary') {
            const summaryDiv = resultItem.querySelector('.summary');
            const isExpanded = summaryDiv.classList.toggle('expanded');
            target.textContent = isExpanded ? 'Lees minder...' : 'Lees meer...';
        }
    };

    const showLoading = (show, isNewSearch = false) => {
        elements.loadingIndicator.style.display = show ? 'flex' : 'none'; 
        if (isNewSearch) {
            elements.apiSearchButton.disabled = show;
            elements.apiSearchButton.innerHTML = show 
                ? '<span class="spinner-small"></span> Zoeken...' 
                : '<span class="button-icon"></span> Zoek uitspraken';
        }
    };

    const showStatus = (element, message, type = 'info') => {
        element.textContent = message;
        element.className = `status-message ${type}`;
        element.style.display = 'block';
    };

    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            notification.addEventListener('animationend', () => notification.remove());
        }, 4000);
    };

    const highlightText = (text, keyword) => {
        if (!keyword || !text) return text;
        const escapedKeyword = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    };

    // --- RESULTAAT ITEM BUILDER ---
    const createResultItemHTML = (type, title, link, content, meta, index) => {
        const metaHTML = Object.entries(meta)
            .filter(([, value]) => value && value.trim() !== 'N/A' && value.trim() !== '' && value.trim() !== 'Niet beschikbaar')
            .map(([key, value]) => `<span><strong>${key}:</strong> ${value}</span>`).join('');       

        const summaryNeedsToggle = content.length > 350;

        let actionsHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer" class="tertiary-button">Bekijk origineel</a>`;
        if (type === 'jurisprudence') {
            actionsHTML += `<button class="secondary-button search-related-laws-button" data-summary="${encodeURIComponent(content)}">Zoek gerelateerde wetten</button>`;
        }

        return `
            <div class="result-item" data-index="${index}">
                <div>
                    <div class="result-item-header"><h3><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h3></div>
                    <div class="meta-info">${metaHTML}</div>
                    <div class="summary" id="summary-${index}">${content}</div>
                    ${summaryNeedsToggle ? '<button class="read-more-button" data-action="toggle-summary">Lees meer...</button>' : ''}
                </div>
                <div class="result-item-actions">${actionsHTML}</div>
            </div>`;
    };

    // --- PAGINATION ---
    const renderPagination = (container, currentPage, totalPages, type) => {
        container.innerHTML = '';
        if (totalPages <= 1) return;
        const totalResults = type === 'jurisprudence' ? jurisprudenceCurrentResults.length : wettenbankTotalResults;
        const resultsPerPage = type === 'jurisprudence' ? jurisprudenceResultsPerPage : wettenbankResultsPerPage;
        let html = `<div class="pagination-controls">
            <button data-type="${type}" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>← Vorige</button>
            <span class="page-indicator">Pagina <input type="number" class="page-input" value="${currentPage}" min="1" max="${totalPages}" data-type="${type}" data-total-pages="${totalPages}"> van ${totalPages}</span>
            <button data-type="${type}" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''}>Volgende →</button>
        </div>`;
        const startResult = (currentPage - 1) * resultsPerPage + 1;
        const endResult = Math.min(currentPage * resultsPerPage, totalResults);
        html += `<div class="results-summary">Resultaten ${startResult}-${endResult} van ${totalResults}</div>`;
        container.innerHTML = html;
    };

    // --- ACTIVE FILTERS DISPLAY ---
    const displayActiveFilters = () => {
        let html = '<span>Actieve filters:</span>';
        let hasFilters = false;

        const addTag = (value) => {
            hasFilters = true;
            return `<div class="active-filter-tag">${value}</div>`;
        };

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
    };

    // --- MODALS KEYWORD ---    
    const showKeywordModal = (summary) => {
        const stopWords = new Set(['de','het','een','en','van','in','op','met','is','zijn','aan','voor','door','als','dat','heeft','wordt','te','om','uit','bij','dan','naar','tot','ook','niet','over','onder','welke','deze','dit','die','er','maar','zal','kan','worden','heeft']);
        const keywords = summary.toLowerCase()
            .replace(/<[^>]*>/g, "") // HTML-tags weghalen
            .replace(/[.,\/#!$%\^&*;:{}=\-_`~()]/g,"")
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));

        const uniqueKeywords = [...new Set(keywords)].slice(0, 15);

        elements.keywordOptions.innerHTML = '';
        if (uniqueKeywords.length > 0) {
            uniqueKeywords.forEach(keyword => {
                const button = document.createElement('button');
                button.className = 'keyword-button';
                button.textContent = keyword;
                button.dataset.keyword = keyword;
                button.addEventListener('click', () => button.classList.toggle('selected'));
                elements.keywordOptions.appendChild(button);
            });
            elements.keywordModal.style.display = 'flex';
        } else {
            showNotification('Geen unieke trefwoorden gevonden in de samenvatting.', 'warning');
        }
    };
    const hideKeywordModal = () => { elements.keywordModal.style.display = 'none'; };
    const searchWithSelectedKeywords = () => {
        const selectedKeywords = Array.from(elements.keywordOptions.querySelectorAll('.keyword-button.selected')).map(btn => btn.dataset.keyword);
        if (selectedKeywords.length > 0) {
            const keywordString = selectedKeywords.join(' ');
            elements.wettenbankKeyword.value = keywordString;
            hideKeywordModal();
            handleWettenbankSearch(true);
            showNotification(`Zoeken in Wettenbank op: "${keywordString}"`, 'info');
            elements.wettenbankKeyword.scrollIntoView({ behavior: 'smooth' });
        } else {
            showNotification('Selecteer minimaal één trefwoord.', 'warning');
        }
    };

    // ======= AI Samenvatting Functie ========
async function fetchAISummary(text) {
    const apiKey = 'JOUW_HUGGINGFACE_API_KEY_HIER'; // Vervang met je eigen key!
    const endpoint = "https://api-inference.huggingface.co/models/google/gemma-7b-it"; // Goed NL, snel + gratis
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
    });
    const result = await response.json();
    return result?.[0]?.generated_text || "Geen samenvatting beschikbaar";
}

// ======= Voeg samenvatting toe aan resultaat ========
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

// ======= Aanroep integreren na ophalen resultaten ========
async function handleJurisprudenceSearch(isNewSearch = false) {
    // ... je bestaande zoeklogica ...
    // (Laatste deel, na het ophalen en renderen van resultaten:)
    if (jurisprudenceCurrentResults.length > 0) {
        await addAISummariesToResults(jurisprudenceCurrentResults);
    }
}

    
    // --- INITIALISATIEAPP EN AFSLUITING ---
    initializeApp();
});


