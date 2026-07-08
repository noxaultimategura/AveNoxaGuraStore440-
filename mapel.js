(function () {
    'use strict';

    // ========== 2240 THEMES ==========
    const THEMES = [];
    for (let i = 1; i <= 2240; i++) {
        THEMES.push('theme-' + i);
    }

    let currentThemeIndex = -1;
    let themeInterval = null;

    // ========== GLOBAL ELEMENTS ==========
    const searchInput = document.getElementById('searchInput');
    const materiContainer = document.getElementById('materiContainer');
    const resultCounterSpan = document.getElementById('resultCounter');
    const clearBtn = document.getElementById('clearSearchBtn');
    const shortcutNotifSpan = document.getElementById('shortcutNotif');
    const refreshBtn = document.getElementById('refreshButton');

    // ========== TRACKING WARNA ==========
    let usedThemeIndices = new Set();
    let allCardThemeIndices = {};

    // ========== HELPER FUNCTIONS ==========
    function getAllCards() {
        return Array.from(document.querySelectorAll('.materi-card'));
    }

    function getCardId(card) {
        const title = card.getAttribute('data-title') || card.querySelector('.card-title')?.innerText || '';
        return title.replace(/\s+/g, '_').toLowerCase() || card.dataset.id || Math.random().toString(36).substring(2, 8);
    }

    function cardHasLink(card) {
        const links = card.querySelectorAll('.button-group .materi-link');
        let hasLink = false;
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.trim() !== '' && href.trim() !== '#' && href.trim() !== '#!') {
                hasLink = true;
            }
        });
        return hasLink;
    }

    function isDesktop() {
        return window.innerWidth >= 992;
    }

    // ========== FUNGSI UTAMA ==========
    function processCards() {
        const cards = getAllCards();

        cards.forEach(card => {
            let statusDiv = card.querySelector('.card-status');
            let priceDiv = card.querySelector('.card-price');
            let btn = card.querySelector('.btn-dapatkan');
            let link = card.querySelector('.materi-link');

            if (statusDiv) {
                let rawStatus = statusDiv.getAttribute('data-status') || statusDiv.textContent.trim();
                let hasValidLink = false;

                if (link) {
                    const href = link.getAttribute('href');
                    if (href && href.trim() !== '' && href.trim() !== '#' && href.trim() !== '#!') {
                        hasValidLink = true;
                    }
                }

                statusDiv.className = 'card-status';
                statusDiv.style.display = '';

                if (rawStatus === '0') {
                    statusDiv.textContent = '';
                    statusDiv.classList.add('status-empty');
                    statusDiv.style.display = 'none';
                    if (btn) btn.classList.add('disabled');
                } else if (rawStatus === '1') {
                    statusDiv.textContent = 'Coming Soon';
                    statusDiv.classList.add('status-soon');
                    if (btn) btn.classList.add('disabled');
                } else if (rawStatus === '2') {
                    if (hasValidLink) {
                        statusDiv.textContent = 'Tersedia';
                        statusDiv.classList.add('status-active');
                        if (btn) btn.classList.remove('disabled');
                    } else {
                        statusDiv.textContent = 'Coming Soon';
                        statusDiv.classList.add('status-soon');
                        if (btn) btn.classList.add('disabled');
                    }
                } else {
                    statusDiv.textContent = 'Coming Soon';
                    statusDiv.classList.add('status-soon');
                    if (btn) btn.classList.add('disabled');
                }
            }

            if (priceDiv && !priceDiv.textContent.trim()) {
                priceDiv.textContent = 'Rp 0';
            }
        });
    }

    function updateStatistik() {
        const allCards = getAllCards();
        let sudahAda = 0;
        let belumAda = 0;

        allCards.forEach(card => {
            if (cardHasLink(card)) {
                sudahAda++;
            } else {
                belumAda++;
            }
        });

        const totalMateri = document.getElementById('totalMateriCount');
        const materiSudahAda = document.getElementById('materiSudahAda');
        const materiBelumAda = document.getElementById('materiBelumAda');

        if (totalMateri) totalMateri.innerText = allCards.length;
        if (materiSudahAda) materiSudahAda.innerText = sudahAda;
        if (materiBelumAda) materiBelumAda.innerText = belumAda;
    }

    function filterMateri() {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const allCards = getAllCards();

        const oldEmptyState = document.querySelector('.empty-state');
        if (oldEmptyState) oldEmptyState.remove();

        const oldNoResult = document.getElementById('customNoResultMsg');
        if (oldNoResult) oldNoResult.remove();

        let hasAnyLink = false;
        allCards.forEach(card => {
            if (cardHasLink(card)) hasAnyLink = true;
        });

        if (!hasAnyLink) {
            allCards.forEach(card => {
                card.style.display = 'none';
            });
            if (resultCounterSpan) {
                resultCounterSpan.innerHTML = '📚 Belum ada materi tersedia';
                resultCounterSpan.style.color = '#CCE2A3';
            }

            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
                <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; color: inherit;">Materi belum tersedia</div>
                <div style="font-size: 0.9rem; opacity: 0.7;">Belum ada materi yang tersedia saat ini.<br>Silakan cek kembali nanti.</div>
            `;
            if (materiContainer) materiContainer.appendChild(emptyDiv);
            return;
        }

        let visibleCount = 0;
        allCards.forEach(card => {
            const hasLink = cardHasLink(card);
            const titleAttr = card.getAttribute('data-title');
            const titleH3 = card.querySelector('.card-title');
            let title = '';

            if (titleAttr) title = titleAttr;
            else if (titleH3) title = titleH3.innerText || '';
            title = title.toLowerCase();

            const isMatch = searchTerm === '' || title.includes(searchTerm);
            const shouldShow = hasLink && isMatch;

            card.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        if (searchTerm !== '' && visibleCount === 0) {
            if (resultCounterSpan) {
                resultCounterSpan.innerHTML = '❌ Materi tidak ditemukan';
                resultCounterSpan.style.color = '#CCE2A3';
            }
            const msgDiv = document.createElement('div');
            msgDiv.id = 'customNoResultMsg';
            msgDiv.className = 'no-result';
            msgDiv.innerHTML = '📚 Materi tidak ditemukan<br><span style="font-size:0.8rem;">Coba kata kunci lain</span>';
            if (materiContainer) materiContainer.appendChild(msgDiv);
        } else {
            if (resultCounterSpan) {
                resultCounterSpan.innerHTML = searchTerm !== '' ? '✨ Ditemukan ' + visibleCount + ' materi' : '📚 ' +
                    visibleCount + ' materi';
                resultCounterSpan.style.color = 'inherit';
            }
        }
        updateStatistik();
    }

    function updateButtonsState() {
        document.querySelectorAll('.button-group .materi-link').forEach(function (link) {
            const href = link.getAttribute('href');
            const btn = link.querySelector('button');
            if (!btn) return;

            const preventInvalidClick = function (e) {
                if (!href || href === '' || href === '#' || href === '#!') e.preventDefault();
            };

            if (!href || href === '' || href === '#' || href === '#!') {
                btn.style.cursor = 'not-allowed';
                btn.style.opacity = '0.5';
                link.removeEventListener('click', preventInvalidClick);
                link.addEventListener('click', preventInvalidClick);
            } else {
                btn.style.cursor = 'pointer';
                btn.style.opacity = '1';
                if (!link.getAttribute('target')) link.setAttribute('target', '_blank');
                link.removeEventListener('click', preventInvalidClick);
            }
        });
        updateStatistik();
    }

    // ========== THEME SYSTEM - UNIK PER MAPEL ==========

    function getUniqueThemeIndex(avoidIndices = new Set()) {
        const availableIndices = [];
        for (let i = 0; i < THEMES.length; i++) {
            if (!usedThemeIndices.has(i) && !avoidIndices.has(i)) {
                availableIndices.push(i);
            }
        }

        if (availableIndices.length === 0) {
            usedThemeIndices = new Set();
            if (currentThemeIndex >= 0) {
                usedThemeIndices.add(currentThemeIndex);
            }
            return getUniqueThemeIndex(avoidIndices);
        }

        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        return availableIndices[randomIndex];
    }

    // ========== TERAPKAN TEMA KE BODY DAN CARD ==========
    function applyThemeToAll(themeIndex) {
        const body = document.body;
        const themeName = THEMES[themeIndex];

        // Hapus semua theme class dari body
        THEMES.forEach(t => body.classList.remove(t));

        // Apply theme ke BODY (untuk background)
        body.classList.add(themeName);

        // Update current theme index
        currentThemeIndex = themeIndex;

        // Simpan ke localStorage
        try {
            localStorage.setItem('noxa-theme-2240', themeName);
            localStorage.setItem('noxa-theme-index', String(currentThemeIndex));
        } catch (e) { }
    }

    // ========== BERI WARNA UNIK KE SETIAP CARD ==========
    function assignUniqueThemesToCards() {
        const cards = getAllCards();
        const usedIndices = new Set();

        // Reset tracking
        usedThemeIndices = new Set();
        allCardThemeIndices = {};

        // Pilih satu tema untuk BODY (global)
        const bodyThemeIndex = Math.floor(Math.random() * THEMES.length);
        applyThemeToAll(bodyThemeIndex);
        usedIndices.add(bodyThemeIndex);
        usedThemeIndices.add(bodyThemeIndex);

        // Beri tema unik ke setiap CARD
        cards.forEach((card, index) => {
            const cardId = getCardId(card);

            // Dapatkan tema unik yang belum digunakan
            const themeIndex = getUniqueThemeIndex(usedIndices);
            usedIndices.add(themeIndex);
            usedThemeIndices.add(themeIndex);

            const themeName = THEMES[themeIndex];

            // Hapus semua theme class dari card
            THEMES.forEach(t => card.classList.remove(t));

            // Apply tema ke CARD (untuk background card)
            card.classList.add(themeName);

            // Simpan mapping
            allCardThemeIndices[cardId] = themeIndex;

            // Apply gradien acak
            card.classList.remove('gradien-0', 'gradien-1', 'gradien-2', 'gradien-3', 'gradien-4');
            const gradIndex = Math.floor(Math.random() * 5);
            card.classList.add('gradien-' + gradIndex);
        });

        // Simpan state card themes
        try {
            localStorage.setItem('noxa-card-themes-2240', JSON.stringify(allCardThemeIndices));
        } catch (e) { }

        return cards.length;
    }

    // ========== ACAK SEMUA TEMA ==========
    function reshuffleAllThemes() {
        const cards = getAllCards();
        const usedIndices = new Set();

        // Reset tracking
        usedThemeIndices = new Set();
        allCardThemeIndices = {};

        // Pilih tema baru untuk BODY
        const bodyThemeIndex = Math.floor(Math.random() * THEMES.length);
        applyThemeToAll(bodyThemeIndex);
        usedIndices.add(bodyThemeIndex);
        usedThemeIndices.add(bodyThemeIndex);

        // Beri tema unik ke setiap CARD
        cards.forEach((card) => {
            const cardId = getCardId(card);

            const themeIndex = getUniqueThemeIndex(usedIndices);
            usedIndices.add(themeIndex);
            usedThemeIndices.add(themeIndex);

            const themeName = THEMES[themeIndex];

            THEMES.forEach(t => card.classList.remove(t));
            card.classList.add(themeName);

            allCardThemeIndices[cardId] = themeIndex;

            card.classList.remove('gradien-0', 'gradien-1', 'gradien-2', 'gradien-3', 'gradien-4');
            const gradIndex = Math.floor(Math.random() * 5);
            card.classList.add('gradien-' + gradIndex);
        });

        // Simpan state
        try {
            localStorage.setItem('noxa-card-themes-2240', JSON.stringify(allCardThemeIndices));
        } catch (e) { }

        if (shortcutNotifSpan) {
            shortcutNotifSpan.dataset.manual = 'true';
            shortcutNotifSpan.innerText = '🔄 ' + cards.length + ' tema unik diacak!';
            setTimeout(function () {
                shortcutNotifSpan.dataset.manual = '';
                shortcutNotifSpan.innerText = '';
            }, 2000);
        }

        return cards.length;
    }

    // ========== LOAD SAVED THEMES ==========
    function loadSavedTheme() {
        let savedTheme = null;
        let savedIndex = -1;

        try {
            savedTheme = localStorage.getItem('noxa-theme-2240');
            const idx = localStorage.getItem('noxa-theme-index');
            if (idx !== null) savedIndex = parseInt(idx, 10);
        } catch (e) { }

        let savedCardThemes = null;
        try {
            const saved = localStorage.getItem('noxa-card-themes-2240');
            if (saved) {
                savedCardThemes = JSON.parse(saved);
            }
        } catch (e) { }

        const cards = getAllCards();

        if (savedCardThemes && typeof savedCardThemes === 'object') {
            // Restore BODY theme
            if (savedTheme && THEMES.includes(savedTheme)) {
                applyThemeToAll(THEMES.indexOf(savedTheme));
            } else {
                const newIndex = Math.floor(Math.random() * THEMES.length);
                applyThemeToAll(newIndex);
            }

            // Restore card themes
            let maxIndex = 0;
            const usedIndices = new Set();
            usedIndices.add(currentThemeIndex);

            cards.forEach(card => {
                const cardId = getCardId(card);
                const themeIndex = savedCardThemes[cardId];

                if (themeIndex !== undefined && themeIndex >= 0 && themeIndex < THEMES.length && !usedIndices.has(themeIndex)) {
                    const themeName = THEMES[themeIndex];
                    card.classList.add(themeName);
                    allCardThemeIndices[cardId] = themeIndex;
                    usedIndices.add(themeIndex);
                    usedThemeIndices.add(themeIndex);

                    card.classList.remove('gradien-0', 'gradien-1', 'gradien-2', 'gradien-3', 'gradien-4');
                    const gradIndex = Math.floor(Math.random() * 5);
                    card.classList.add('gradien-' + gradIndex);

                    if (themeIndex > maxIndex) maxIndex = themeIndex;
                }
            });

            // Jika ada card yang belum mendapat tema
            cards.forEach(card => {
                const cardId = getCardId(card);
                if (allCardThemeIndices[cardId] === undefined) {
                    const newIndex = getUniqueThemeIndex(usedIndices);
                    usedIndices.add(newIndex);
                    usedThemeIndices.add(newIndex);
                    const themeName = THEMES[newIndex];
                    card.classList.add(themeName);
                    allCardThemeIndices[cardId] = newIndex;

                    card.classList.remove('gradien-0', 'gradien-1', 'gradien-2', 'gradien-3', 'gradien-4');
                    const gradIndex = Math.floor(Math.random() * 5);
                    card.classList.add('gradien-' + gradIndex);

                    if (newIndex > maxIndex) maxIndex = newIndex;
                }
            });

            currentThemeIndex = maxIndex;

        } else {
            // First time - assign all
            assignUniqueThemesToCards();
        }

        return savedTheme;
    }

    // ========== AUTO THEME ==========
    function startAutoTheme() {
        if (themeInterval) {
            clearInterval(themeInterval);
        }
        themeInterval = setInterval(function () {
            reshuffleAllThemes();
        }, 10000);
    }

    function stopAutoTheme() {
        if (themeInterval) {
            clearInterval(themeInterval);
            themeInterval = null;
        }
    }

    // ========== EVENT LISTENERS ==========
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterMateri, 200);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (searchInput) searchInput.value = '';
            filterMateri();
            if (searchInput) searchInput.focus();
            if (shortcutNotifSpan) {
                shortcutNotifSpan.dataset.manual = 'true';
                shortcutNotifSpan.innerText = '⌨️ Pencarian dihapus';
                setTimeout(function () {
                    shortcutNotifSpan.dataset.manual = '';
                    shortcutNotifSpan.innerText = '';
                }, 1200);
            }
        });
    }

    window.addEventListener('keydown', function (e) {
        if (!searchInput) return;
        if (!isDesktop()) return;

        if ((e.ctrlKey && e.key === 'k') || (e.ctrlKey && e.key === 'K')) {
            e.preventDefault();
            searchInput.focus();
            if (shortcutNotifSpan) {
                shortcutNotifSpan.dataset.manual = 'true';
                shortcutNotifSpan.innerText = '🔎 Ctrl+K fokus pencarian';
                setTimeout(function () {
                    shortcutNotifSpan.dataset.manual = '';
                    shortcutNotifSpan.innerText = '';
                }, 1500);
            }
        }

        if (e.shiftKey && (e.key === 'F' || e.key === 'f')) {
            e.preventDefault();
            searchInput.focus();
            if (shortcutNotifSpan) {
                shortcutNotifSpan.dataset.manual = 'true';
                shortcutNotifSpan.innerText = '⚡ Shift+F fokus';
                setTimeout(function () {
                    shortcutNotifSpan.dataset.manual = '';
                    shortcutNotifSpan.innerText = '';
                }, 1500);
            }
        }

        if (e.key === 'Escape') {
            if (searchInput.value !== '') {
                searchInput.value = '';
                filterMateri();
                if (shortcutNotifSpan) {
                    shortcutNotifSpan.dataset.manual = 'true';
                    shortcutNotifSpan.innerText = '⌨️ Pencarian dibersihkan (ESC)';
                    setTimeout(function () {
                        shortcutNotifSpan.dataset.manual = '';
                        shortcutNotifSpan.innerText = '';
                    }, 1200);
                }
            } else {
                searchInput.blur();
            }
        }
    });

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
            if (searchInput) searchInput.value = '';
            filterMateri();

            reshuffleAllThemes();

            startAutoTheme();

            const refreshIcon = refreshBtn.querySelector('span');
            if (refreshIcon) {
                refreshIcon.style.animation = 'spin 0.5s ease';
                setTimeout(function () { refreshIcon.style.animation = ''; }, 500);
            }
            if (shortcutNotifSpan) {
                shortcutNotifSpan.dataset.manual = 'true';
                shortcutNotifSpan.innerText = '⟳ Refresh + Tema Unik';
                setTimeout(function () {
                    shortcutNotifSpan.dataset.manual = '';
                    shortcutNotifSpan.innerText = '';
                }, 2000);
            }

            getAllCards().forEach(function (card) {
                card.style.transform = 'scale(0.98)';
                setTimeout(function () { card.style.transform = ''; }, 200);
            });
            updateButtonsState();
        });
    }

    if (!document.querySelector('#refreshSpinKeyframe')) {
        const spinStyle = document.createElement('style');
        spinStyle.id = 'refreshSpinKeyframe';
        spinStyle.textContent =
            '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(spinStyle);
    }

    // ========== EVENT DELEGASI ==========
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-dapatkan');
        if (btn && !btn.classList.contains('disabled')) {
            const link = btn.closest('.materi-link');
            const href = link ? link.getAttribute('href') : null;
            const card = btn.closest('.materi-card');
            const title = card ? card.getAttribute('data-title') || 'Materi' : 'Materi';

            if (href && href !== '' && href !== '#' && href !== '#!') {
                window.open(href, '_blank');
            } else {
                e.preventDefault();
                alert('📘 Materi "' + title + '" belum tersedia.');
            }
        }
    });

    document.addEventListener('click', function (e) {
        const card = e.target.closest('.materi-card');
        if (card && !e.target.closest('.btn-dapatkan') && !e.target.closest('a')) {
            const links = card.querySelectorAll('.button-group .materi-link');
            let linkHref = '';

            links.forEach(function (l) {
                const href = l.getAttribute('href');
                if (href && href !== '' && href !== '#' && href !== '#!') {
                    linkHref = href;
                }
            });

            const title = card.getAttribute('data-title') || 'Materi';
            if (linkHref && linkHref !== '' && linkHref !== '#' && linkHref !== '#!') {
                window.open(linkHref, '_blank');
                if (shortcutNotifSpan) {
                    shortcutNotifSpan.dataset.manual = 'true';
                    shortcutNotifSpan.innerText = '🔗 Membuka: ' + title;
                    setTimeout(function () {
                        shortcutNotifSpan.dataset.manual = '';
                        shortcutNotifSpan.innerText = '';
                    }, 2000);
                }
            } else {
                alert('🔗 Link untuk "' + title + '" belum tersedia.');
            }
        }
    });

    // ========== RESIZE HANDLER ==========
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { }, 250);
    });

    // ========== INISIALISASI ==========
    function init() {
        loadSavedTheme();

        startAutoTheme();

        processCards();
        setTimeout(function () {
            updateButtonsState();
            filterMateri();
        }, 100);

        const footerYearEl = document.getElementById('footerYear');
        if (footerYearEl) {
            footerYearEl.textContent = new Date().getFullYear();
        }

        const cards = getAllCards();
        const uniqueThemes = new Set();
        cards.forEach(card => {
            const cardId = getCardId(card);
            if (allCardThemeIndices[cardId] !== undefined) {
                uniqueThemes.add(allCardThemeIndices[cardId]);
            }
        });

        console.log('✅ Noxa Store | 2240 Themes Active');
        console.log('🎨 Body & setiap Card punya tema UNIK (0% duplikasi)');
        console.log('📌 ' + cards.length + ' card dengan ' + uniqueThemes.size + ' tema unik');
        console.log('🔄 Tema berganti otomatis setiap 10 detik');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();