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
        mainContainer: document.getElementById('mainContainer'),
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
        toggleWettenbankFiltersButton: document.getElementById('toggleWettenbankFiltersButton'),
        wettenbankFilterToggleIcon: document.getElementById('wettenbankFilterToggleIcon'),
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
    let jurisprudenceCurrentPage = 1;
    const jurisprudenceResultsPerPage = 10;

    let wettenbankCurrentQuery = '';
    let wettenbankActiveFacets = {};
    let wettenbankCurrentPage = 1;
    let wettenbankTotalResults = 0;
    const wettenbankResultsPerPage = 10;

    let debounceTimer = null;
    let isFiltersVisible = false;
    let isAdvancedVisible = false;
    let isWettenbankFiltersVisible = false;

    // --- INITIALISATIE ---
    const initializeApp = () => {
        populateSelect(elements.subject, rechtsgebieden);
        populateSelect(elements.procedure, proceduresoorten);
        setupEventListeners();
    };

    const populateSelect = (select, items) => {
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.name;
            select.appendChild(opt);
        });
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        elements.showFiltersButton.addEventListener('click', toggleFilters);
        elements.resetFiltersButton.addEventListener('click', resetAllFilters);
        elements.toggleAdvanced.addEventListener('click', toggleAdvancedFilters);
        elements.quickSearchButton.addEventListener('click', handleJurisprudenceSearch);
        elements.quickSearchInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleJurisprudenceSearch(); });
        elements.periodPreset.addEventListener('change', handlePeriodPresetChange);
        elements.creator.addEventListener('input', () => handleAutocompleteDebounced(elements.creator, elements.creatorSuggestions, instanties));
        elements.clearCreator.addEventListener('click', clearCreatorInput);
        elements.apiSearchButton.addEventListener('click', handleJurisprudenceSearch);
        elements.smartFilterButton.addEventListener('click', handleSmartSearch);
        elements.smartSearchInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSmartSearch(); });
        
        elements.jurisprudenceResults.addEventListener('click', handleResultsClick);
        elements.wettenbankResults.addEventListener('click', handleResultsClick);

        elements.wettenbankSearchButton.addEventListener('click', () => handleWettenbankSearch(true));
        elements.wettenbankKeyword.addEventListener('keypress', e => { if (e.key === 'Enter') handleWettenbankSearch(true); });
        elements.toggleWettenbankFiltersButton.addEventListener('click', toggleWettenbankFilters);
        elements.wettenbankFacets.addEventListener('change', handleFacetChange);
        
        elements.jurisprudencePagination.addEventListener('click', handlePaginationClick);
        elements.jurisprudencePagination.addEventListener('change', handlePageInputChange);
        elements.wettenbankPagination.addEventListener('click', handlePaginationClick);
        elements.wettenbankPagination.addEventListener('change', handlePageInputChange);
        
        elements.closeKeywordModal.addEventListener('click', hideKeywordModal);
        elements.searchWithKeywordsButton.addEventListener('click', searchWithSelectedKeywords);
        elements.keywordModal.addEventListener('click', (e) => {
            if (e.target.id === 'keywordModal') { // Close modal if clicking on the background
                hideKeywordModal();
            }
        });

        document.addEventListener('click', (e) => { if (!e.target.closest('.autocomplete-container')) { elements.creatorSuggestions.innerHTML = ''; } });
    };

    // --- FILTER MANAGEMENT ---
    const toggleFilters = () => {
        isFiltersVisible = !isFiltersVisible;
        elements.apiFilters.style.display = isFiltersVisible ? 'block' : 'none';
        elements.showFiltersButton.innerHTML = `<span id="filterToggleIcon">${isFiltersVisible ? '▲' : '▼'}</span> ${isFiltersVisible ? 'Verberg filters' : 'Geavanceerd zoeken'}`;
        elements.resetFiltersButton.style.display = isFiltersVisible ? 'inline-block' : 'none';
        
        if (!isFiltersVisible) {
            isAdvancedVisible = false;
            elements.advancedFilters.style.display = 'none';
            elements.toggleAdvanced.innerHTML = `<span id="advancedToggleIcon">▼</span> Meer opties`;
        }
    };
    
    const toggleAdvancedFilters = () => {
        isAdvancedVisible = !isAdvancedVisible;
        elements.advancedFilters.style.display = isAdvancedVisible ? 'block' : 'none';
        elements.toggleAdvanced.innerHTML = `<span id="advancedToggleIcon">${isAdvancedVisible ? '▲' : '▼'}</span> ${isAdvancedVisible ? 'Minder opties' : 'Meer opties'}`;
    };

    const toggleWettenbankFilters = () => {
        isWettenbankFiltersVisible = !isWettenbankFiltersVisible;
        elements.wettenbankFacets.style.display = isWettenbankFiltersVisible ? 'block' : 'none';
        elements.toggleWettenbankFiltersButton.innerHTML = `<span id="wettenbankFilterToggleIcon">${isWettenbankFiltersVisible ? '▲' : '▼'}</span> ${isWettenbankFiltersVisible ? 'Verberg filters' : 'Verfijn resultaten'}`;
    };

    const resetAllFilters = () => {
        elements.apiFilters.querySelectorAll('input, select').forEach(el => {
            if (el.type === 'radio' || el.type === 'checkbox') {
                el.checked = false;
            } else {
                el.value = '';
            }
        });
        document.querySelector('input[name="documentType"][value=""]').checked = true;
        elements.quickSearchInput.value = '';
        elements.creator.removeAttribute('data-id');
        elements.customDateRange.style.display = 'none';
        elements.clearCreator.style.display = 'none';
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
        elements.jurisprudenceStatus.style.display = 'none';
        elements.smartSearchSection.classList.add('hidden');
        showNotification('Alle filters zijn gewist', 'success');
    };

    const handlePeriodPresetChange = () => {
        const preset = elements.periodPreset.value;
        const today = new Date();
        elements.customDateRange.style.display = preset === 'custom' ? 'grid' : 'none';
        if (preset === 'custom') { elements.dateFrom.value = ''; elements.dateTo.value = ''; return; }
        let fromDate = new Date();
        let toDate = new Date();
        switch (preset) {
            case 'last-month': fromDate.setMonth(today.getMonth() - 1); break;
            case 'last-3-months': fromDate.setMonth(today.getMonth() - 3); break;
            case 'last-6-months': fromDate.setMonth(today.getMonth() - 6); break;
            case 'this-year': fromDate = new Date(today.getFullYear(), 0, 1); break;
            case 'last-year': fromDate = new Date(today.getFullYear() - 1, 0, 1); toDate = new Date(today.getFullYear() - 1, 11, 31); break;
            default: elements.dateFrom.value = ''; elements.dateTo.value = ''; return;
        }
        elements.dateFrom.value = fromDate.toISOString().split('T')[0];
        elements.dateTo.value = toDate.toISOString().split('T')[0];
    };

    // --- AUTOCOMPLETE ---
    const handleAutocompleteDebounced = (input, suggestions, items) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => handleAutocomplete(input, suggestions, items), 300);
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
    const clearCreatorInput = () => { elements.creator.value = ''; elements.creator.removeAttribute('data-id'); elements.creatorSuggestions.innerHTML = ''; elements.clearCreator.style.display = 'none'; };

    // --- ZOEKFUNCTIES (JURISPRUDENTIE) ---
    const handleJurisprudenceSearch = async () => {
        showLoading(true);
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
        elements.smartSearchSection.classList.add('hidden');

        const params = new URLSearchParams();
        if (elements.dateFrom.value) params.append('date', elements.dateFrom.value);
        if (elements.dateTo.value) params.append('date', elements.dateTo.value);
        if (elements.modifiedFrom.value) params.append('modified', `${elements.modifiedFrom.value}T00:00:00`);
        if (elements.modifiedTo.value) params.append('modified', `${elements.modifiedTo.value}T23:59:59`);
        if (elements.subject.value) params.append('subject', elements.subject.value);
        if (elements.procedure.value) params.append('procedure', elements.procedure.value);
        if (elements.creator.dataset.id) params.append('creator', elements.creator.dataset.id);
        const selectedType = document.querySelector('input[name="documentType"]:checked')?.value;
        if (selectedType) params.append('type', selectedType);
        params.append('return', 'DOC');
        params.append('max', '1000');
        params.append('sort', elements.sortOrder.value);

        const requestUrl = `${PROXY_URL}${encodeURIComponent(`https://data.rechtspraak.nl/uitspraken/zoeken?${params.toString()}`)}`;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error(`API-verzoek mislukt: ${response.status}`);
            const xmlString = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
            if (xmlDoc.getElementsByTagName("parsererror").length) throw new Error("Fout bij het verwerken van de XML-data.");
            
            const entries = xmlDoc.getElementsByTagName('entry');
            jurisprudenceMasterResults = Array.from(entries).map(entry => {
                const title = entry.querySelector('title')?.textContent || 'Geen titel';
                
                // *** GECORRIGEERDE LOGICA ***
                // Zoek naar het JJJJ-MM-DD patroon ergens in de titel, niet alleen aan het eind.
                const dateMatch = title.match(/(\d{4}-\d{2}-\d{2})/);
                const uitspraakdatum = dateMatch ? new Date(dateMatch[1]) : null;

                return {
                    title: title,
                    ecli: entry.querySelector('id')?.textContent || '',
                    summary: entry.querySelector('summary')?.textContent || 'Geen samenvatting.',
                    uitspraakdatum: uitspraakdatum, // Gebruik de geparste datum
                    zaaknummer: entry.querySelector('zaaknummer, \\:zaaknummer')?.textContent || 'Niet gevonden'
                };
            });

            handleSmartSearch(true); 

        } catch (error) {
            showStatus(elements.jurisprudenceStatus, `Fout: ${error.message}.`, 'error');
            console.error(error);
        } finally {
            showLoading(false);
        }
    };

    const handleSmartSearch = (isInitialSearch = false) => {
        const keyword = isInitialSearch ? elements.quickSearchInput.value.toLowerCase().trim() : elements.smartSearchInput.value.toLowerCase().trim();
        const searchIn = Array.from(elements.searchInCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        if (!isInitialSearch && searchIn.length === 0) {
            showNotification('Selecteer minimaal één veld om in te zoeken', 'error');
            return;
        }
        
        if (isInitialSearch) {
            elements.smartSearchInput.value = elements.quickSearchInput.value;
        }

        jurisprudenceCurrentResults = jurisprudenceMasterResults.filter(item => {
            if (!keyword) return true;
            const searchTargets = [];
            if (isInitialSearch || searchIn.includes('title')) searchTargets.push(item.title);
            if (isInitialSearch || searchIn.includes('summary')) searchTargets.push(item.summary);
            if (isInitialSearch || searchIn.includes('ecli')) searchTargets.push(item.ecli);
            if (isInitialSearch || searchIn.includes('zaaknummer')) searchTargets.push(item.zaaknummer);
            return searchTargets.some(target => target.toLowerCase().includes(keyword));
        });

        if (jurisprudenceCurrentResults.length === 0) {
            showStatus(elements.jurisprudenceStatus, 'Geen resultaten gevonden voor deze criteria.', 'warning');
            elements.jurisprudenceResults.innerHTML = '';
            elements.jurisprudencePagination.innerHTML = '';
        } else {
            const message = `${jurisprudenceCurrentResults.length} resultaten gevonden`;
            showStatus(elements.jurisprudenceStatus, message, 'success');
            elements.smartSearchSection.classList.remove('hidden');
        }
        
        jurisprudenceCurrentPage = 1;
        renderJurisprudencePage(jurisprudenceCurrentPage);
    };

    const showKeywordModal = (summary) => {
        const stopWords = new Set(['de', 'het', 'een', 'en', 'van', 'in', 'op', 'met', 'is', 'zijn', 'aan', 'voor', 'door', 'als', 'dat', 'heeft', 'wordt', 'te', 'om', 'uit', 'bij', 'dan']);
        const keywords = summary.toLowerCase()
                                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
                                .split(/\s+/)
                                .filter(word => word.length > 3 && !stopWords.has(word));
        
        const uniqueKeywords = [...new Set(keywords)].slice(0, 15); // Max 15 keywords
        
        elements.keywordOptions.innerHTML = ''; // Clear previous options
        if (uniqueKeywords.length > 0) {
            uniqueKeywords.forEach(keyword => {
                const button = document.createElement('button');
                button.className = 'keyword-button';
                button.textContent = keyword;
                button.dataset.keyword = keyword;
                button.addEventListener('click', () => {
                    button.classList.toggle('selected');
                });
                elements.keywordOptions.appendChild(button);
            });
            elements.keywordModal.style.display = 'flex';
        } else {
            showNotification('Geen unieke trefwoorden gevonden in de samenvatting.', 'warning');
        }
    };

    const hideKeywordModal = () => {
        elements.keywordModal.style.display = 'none';
    };

    const searchWithSelectedKeywords = () => {
        const selectedButtons = elements.keywordOptions.querySelectorAll('.keyword-button.selected');
        const selectedKeywords = Array.from(selectedButtons).map(btn => btn.dataset.keyword);

        if (selectedKeywords.length > 0) {
            const keywordString = selectedKeywords.join(' ');
            elements.wettenbankKeyword.value = keywordString;
            hideKeywordModal();
            handleWettenbankSearch(true);
            showNotification(`Zoeken in Wettenbank op: "${keywordString}"`, 'info');
            elements.wettenbankKeyword.scrollIntoView({ behavior: 'smooth' });
        } else {
            showNotification('Selecteer minimaal één trefwoord om te zoeken.', 'error');
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

        if (!wettenbankCurrentQuery) { showNotification('Voer een trefwoord in.', 'error'); return; }

        showStatus(elements.wettenbankStatus, 'Wettenbank wordt doorzocht...', 'info');
        elements.wettenbankResults.innerHTML = '';
        if (isNewSearch) elements.wettenbankFacets.innerHTML = '';

        const keywordQuery = `cql.textAndIndexes = "${wettenbankCurrentQuery.replace(/"/g, '\\"')}"`;
        const facetClauses = Object.entries(wettenbankActiveFacets).map(([, queries]) => {
            return queries.length > 1 ? `(${queries.join(' OR ')})` : queries.join('');
        }).filter(Boolean).join(' AND ');

        const finalQuery = facetClauses ? `(${keywordQuery}) AND (${facetClauses})` : keywordQuery;
        
        const params = new URLSearchParams({
            query: finalQuery,
            maximumRecords: wettenbankResultsPerPage,
            startRecord: ((wettenbankCurrentPage - 1) * wettenbankResultsPerPage) + 1,
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
            if (isNewSearch) {
                renderWettenbankFacets(xmlDoc);
            }
        } catch (error) {
            showStatus(elements.wettenbankStatus, `Fout: ${error.message}.`, 'error');
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

    // --- RESULTATEN RENDERING & INTERACTIE ---
    const renderJurisprudencePage = (page) => {
        const startIndex = (page - 1) * jurisprudenceResultsPerPage;
        const endIndex = startIndex + jurisprudenceResultsPerPage;
        const pageResults = jurisprudenceCurrentResults.slice(startIndex, endIndex);

        let html = '';
        pageResults.forEach((item, index) => {
            const globalIndex = `jurisprudence-${startIndex + index}`;
            const metaData = {
                "ECLI": item.ecli,
                "Zaaknummer": item.zaaknummer,
                "Datum Uitspraak": item.uitspraakdatum ? item.uitspraakdatum.toLocaleDateString('nl-NL') : 'Onbekend'
            };
            html += createResultItemHTML(
                'jurisprudence', 
                item.title,
                `https://uitspraken.rechtspraak.nl/inziendocument?id=${encodeURIComponent(item.ecli)}`,
                item.summary,
                metaData,
                globalIndex
            );
        });
        elements.jurisprudenceResults.innerHTML = html || "<p>Geen resultaten op deze pagina.</p>";
        renderPagination(elements.jurisprudencePagination, jurisprudenceCurrentPage, Math.ceil(jurisprudenceCurrentResults.length / jurisprudenceResultsPerPage), 'jurisprudence');
    };

    const renderWettenbankResults = (xmlDoc) => {
        const records = xmlDoc.querySelectorAll('recordData');
        let html = '';
        records.forEach((record, index) => {
            const globalIndex = `wettenbank-${((wettenbankCurrentPage - 1) * wettenbankResultsPerPage) + index}`;
            const meta = record.querySelector('meta');
            
            const title = meta?.querySelector('title')?.textContent || 'Geen titel';
            const identifier = meta?.querySelector('identifier')?.textContent || '#';
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

            html += createResultItemHTML('wettenbank', title, identifier, contentHTML, { "Door": creator, "Datum": formattedDate }, globalIndex);
        });
        elements.wettenbankResults.innerHTML = html || "<p>Geen documenten gevonden.</p>";
    };

    const createResultItemHTML = (type, title, link, content, meta, index) => {
        const metaHTML = Object.entries(meta).map(([key, value]) => `<span><strong>${key}:</strong> ${value || 'n.v.t.'}</span>`).join('');
        
        const isHtmlContent = /<[a-z][\s\S]*>/i.test(content);
        const summaryText = isHtmlContent ? content : (content.substring(0, 250) + (content.length > 250 ? '...' : ''));
        
        let actionsHTML = `
            <button class="tertiary-button view-document-button" 
                    data-title="${encodeURIComponent(title)}" 
                    data-content="${encodeURIComponent(content)}">
                Bekijk document
            </button>`;

        if (type === 'jurisprudence') {
            actionsHTML += `<button class="secondary-button search-related-laws-button" data-summary="${encodeURIComponent(content)}">Zoek gerelateerde wetten</button>`;
        }

        return `
            <div class="result-item" data-index="${index}">
                <div>
                    <div class="result-item-header"><h3><a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a></h3></div>
                    <div class="meta-info">${metaHTML}</div>
                    <div class="summary" id="summary-${index}">${summaryText}</div>
                </div>
                <div class="result-item-actions">${actionsHTML}</div>
            </div>`;
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
        elements.toggleWettenbankFiltersButton.style.display = 'inline-block';
        elements.toggleWettenbankFiltersButton.innerHTML = `<span id="wettenbankFilterToggleIcon">▼</span> Verfijn resultaten`;
    };
    
    // --- PAGINERING ---
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
    
    const changePage = (type, page) => {
        page = parseInt(page, 10);
        if (isNaN(page) || page < 1) page = 1;

        if (type === 'jurisprudence') {
            const totalPages = Math.ceil(jurisprudenceCurrentResults.length / jurisprudenceResultsPerPage);
            if (page > totalPages) page = totalPages;
            jurisprudenceCurrentPage = page;
            renderJurisprudencePage(page);
            elements.jurisprudenceResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (type === 'wettenbank') {
            const totalPages = Math.ceil(wettenbankTotalResults / wettenbankResultsPerPage);
            if (page > totalPages) page = totalPages;
            wettenbankCurrentPage = page;
            handleWettenbankSearch(false);
            elements.wettenbankResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

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

    // --- DOCUMENT VIEWER ---
    const showDocumentViewer = (title, content) => {
        elements.documentViewer.innerHTML = `
            <div class="document-viewer-card">
                <div class="document-viewer-header"><h3>${title}</h3></div>
                <div class="document-viewer-body">${content}</div>
                <div class="document-viewer-footer"><button id="closeViewerButton" class="primary-button">Terug</button></div>
            </div>`;
        elements.documentViewer.style.display = 'flex';
        elements.mainContainer.classList.add('main-content-hidden');
        document.getElementById('closeViewerButton').addEventListener('click', hideDocumentViewer);
    };

    const hideDocumentViewer = () => {
        elements.documentViewer.style.display = 'none';
        elements.documentViewer.innerHTML = '';
        elements.mainContainer.classList.remove('main-content-hidden');
    };

    // --- UTILITIES & STATE MANAGEMENT ---
    const handleResultsClick = (e) => {
        const viewDocumentButton = e.target.closest('.view-document-button');
        const searchLawsButton = e.target.closest('.search-related-laws-button');

        if (viewDocumentButton) {
            showDocumentViewer(decodeURIComponent(viewDocumentButton.dataset.title), decodeURIComponent(viewDocumentButton.dataset.content));
        }
        if (searchLawsButton) {
            showKeywordModal(decodeURIComponent(searchLawsButton.dataset.summary));
        }
    };
    
    const showLoading = (show) => { 
        elements.loadingIndicator.style.display = show ? 'flex' : 'none'; 
        elements.apiSearchButton.disabled = show; 
        elements.apiSearchButton.innerHTML = show ? '<span class="spinner-small"></span> Zoeken...' : '<span class="button-icon"></span> Zoek uitspraken'; 
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

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); elements.quickSearchInput.focus(); }
        if (e.key === 'Escape') { 
            if (elements.documentViewer.style.display === 'flex') hideDocumentViewer();
            else if (elements.keywordModal.style.display === 'flex') hideKeywordModal();
            else { elements.creatorSuggestions.innerHTML = ''; document.activeElement.blur(); }
        }
    });
    
    // Inject CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        .spinner-small { display: inline-block; width: 16px; height: 16px; border: 2px solid #ffffff; border-radius: 50%; border-top-color: transparent; animation: spin 1s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .notification { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 6px; color: white; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.3s ease forwards; }
        .notification.success { background-color: #28a745; }
        .notification.error { background-color: #dc3545; }
        .notification.warning { background-color: #ffc107; color: #343a40; }
        .notification.info { background-color: #007bff; }
    `;
    document.head.appendChild(style);

    initializeApp();
});
