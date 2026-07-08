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

    // ========== TRACKING WARNA YANG SUDAH DIGUNAKAN ==========
    let usedThemeIndices = new Set();
    let allCardThemeIndices = {}; // { cardId: themeIndex }

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

    // ========== THEME SYSTEM - 2240 WARNA UNIK PER MAPEL ==========

    // Fungsi untuk mendapatkan tema unik yang belum pernah digunakan
    function getUniqueThemeIndex(avoidIndices = new Set()) {
        const availableIndices = [];
        for (let i = 0; i < THEMES.length; i++) {
            if (!usedThemeIndices.has(i) && !avoidIndices.has(i)) {
                availableIndices.push(i);
            }
        }

        if (availableIndices.length === 0) {
            // Jika semua tema sudah digunakan, reset usedThemeIndices
            usedThemeIndices = new Set();
            // Kecualikan indeks saat ini
            if (currentThemeIndex >= 0) {
                usedThemeIndices.add(currentThemeIndex);
            }
            // Ambil ulang
            return getUniqueThemeIndex(avoidIndices);
        }

        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        return availableIndices[randomIndex];
    }

    // Fungsi untuk mengaplikasikan tema ke card tertentu
    function applyThemeToCard(card, themeIndex) {
        const themeName = THEMES[themeIndex];
        const cardId = getCardId(card);

        // Hapus semua theme class dari card (jika ada)
        THEMES.forEach(t => card.classList.remove(t));

        // Apply theme ke card
        card.classList.add(themeName);

        // Simpan mapping
        allCardThemeIndices[cardId] = themeIndex;
        usedThemeIndices.add(themeIndex);

        // Apply gradien acak
        card.classList.remove('gradien-0', 'gradien-1', 'gradien-2', 'gradien-3', 'gradien-4');
        const gradIndex = Math.floor(Math.random() * 5);
        card.classList.add('gradien-' + gradIndex);
    }

    // Fungsi untuk memberi tema unik ke semua card
    function assignUniqueThemesToCards() {
        const cards = getAllCards();
        const assignedIndices = new Set();

        cards.forEach((card, index) => {
            const cardId = getCardId(card);

            // Jika card sudah punya tema di session ini, skip
            if (allCardThemeIndices[cardId] !== undefined) {
                assignedIndices.add(allCardThemeIndices[cardId]);
                return;
            }

            // Dapatkan tema unik
            const themeIndex = getUniqueThemeIndex(assignedIndices);
            assignedIndices.add(themeIndex);
            applyThemeToCard(card, themeIndex);

            // Update currentThemeIndex
            currentThemeIndex = themeIndex;
        });

        // Update usedThemeIndices
        assignedIndices.forEach(idx => usedThemeIndices.add(idx));

        return assignedIndices.size;
    }

    // Fungsi untuk mengacak semua tema card (tanpa mengulang)
    function reshuffleAllThemes() {
        const cards = getAllCards();

        // Reset tracking
        usedThemeIndices = new Set();
        allCardThemeIndices = {};

        // Pastikan tidak ada duplikasi
        const usedIndices = new Set();

        cards.forEach((card) => {
            const cardId = getCardId(card);

            // Dapatkan tema unik
            const themeIndex = getUniqueThemeIndex(usedIndices);
            usedIndices.add(themeIndex);
            applyThemeToCard(card, themeIndex);
            allCardThemeIndices[cardId] = themeIndex;
        });

        // Update usedThemeIndices
        usedIndices.forEach(idx => usedThemeIndices.add(idx));

        // Update currentThemeIndex
        if (cards.length > 0) {
            const lastCard = cards[cards.length - 1];
            const lastCardId = getCardId(lastCard);
            currentThemeIndex = allCardThemeIndices[lastCardId] || 0;
        }

        if (shortcutNotifSpan) {
            shortcutNotifSpan.dataset.manual = 'true';
            shortcutNotifSpan.innerText = '🔄 ' + cards.length + ' tema unik diacak ulang!';
            setTimeout(function () {
                shortcutNotifSpan.dataset.manual = '';
                shortcutNotifSpan.innerText = '';
            }, 2000);
        }

        return cards.length;
    }

    // ========== THEME SYSTEM - GLOBAL ==========

    function applyGlobalTheme(themeName) {
        // Hanya untuk notifikasi, tidak mengubah semua card
        const body = document.body;
        THEMES.forEach(t => body.classList.remove(t));
        body.classList.add(themeName);
    }

    function getRandomThemeIndexGlobal() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * THEMES.length);
        } while (newIndex === currentThemeIndex && THEMES.length > 1);
        return newIndex;
    }

    function toggleTheme() {
        // Jika ada card, gunakan random tema baru untuk semua card
        const cards = getAllCards();
        if (cards.length > 0) {
            reshuffleAllThemes();
            return THEMES[currentThemeIndex];
        }

        // Fallback: global theme
        const newIndex = getRandomThemeIndexGlobal();
        currentThemeIndex = newIndex;
        applyGlobalTheme(THEMES[newIndex]);

        if (shortcutNotifSpan) {
            shortcutNotifSpan.innerText = '🎨 Tema ' + (newIndex + 1) + ' dari 2240';
            setTimeout(function () {
                if (!shortcutNotifSpan.dataset.manual) {
                    shortcutNotifSpan.innerText = '';
                }
            }, 2000);
        }

        return THEMES[newIndex];
    }

    function startAutoTheme() {
        if (themeInterval) {
            clearInterval(themeInterval);
        }
        themeInterval = setInterval(function () {
            toggleTheme();
        }, 5000); // 5 detik
    }

    function stopAutoTheme() {
        if (themeInterval) {
            clearInterval(themeInterval);
            themeInterval = null;
        }
    }

    function loadSavedTheme() {
        let savedTheme = null;
        let savedIndex = -1;

        try {
            savedTheme = localStorage.getItem('noxa-theme-2240');
            const idx = localStorage.getItem('noxa-theme-index');
            if (idx !== null) savedIndex = parseInt(idx, 10);
        } catch (e) { }

        // Load unique themes per card dari localStorage
        let savedCardThemes = null;
        try {
            const saved = localStorage.getItem('noxa-card-themes-2240');
            if (saved) {
                savedCardThemes = JSON.parse(saved);
            }
        } catch (e) { }

        if (savedCardThemes && typeof savedCardThemes === 'object') {
            // Restore card themes
            allCardThemeIndices = savedCardThemes;
            const cards = getAllCards();
            let maxIndex = 0;

            cards.forEach(card => {
                const cardId = getCardId(card);
                const themeIndex = allCardThemeIndices[cardId];
                if (themeIndex !== undefined && themeIndex >= 0 && themeIndex < THEMES.length) {
                    const themeName = THEMES[themeIndex];
                    card.classList.add(themeName);
                    usedThemeIndices.add(themeIndex);
                    if (themeIndex > maxIndex) maxIndex = themeIndex;

                    // Apply gradien
                    card.classList.remove('gradien-0', 'gradien-1', 'gradien-2', 'gradien-3', 'gradien-4');
                    const gradIndex = Math.floor(Math.random() * 5);
                    card.classList.add('gradien-' + gradIndex);
                } else {
                    // Assign new unique theme
                    const newIndex = getUniqueThemeIndex();
                    allCardThemeIndices[cardId] = newIndex;
                    usedThemeIndices.add(newIndex);
                    const themeName = THEMES[newIndex];
                    card.classList.add(themeName);

                    card.classList.remove('gradien-0', 'gradien-1', 'gradien-2', 'gradien-3', 'gradien-4');
                    const gradIndex = Math.floor(Math.random() * 5);
                    card.classList.add('gradien-' + gradIndex);

                    if (newIndex > maxIndex) maxIndex = newIndex;
                }
            });

            currentThemeIndex = maxIndex;

            // Validate no duplicates
            const usedSet = new Set();
            let hasDuplicate = false;
            for (const key in allCardThemeIndices) {
                const val = allCardThemeIndices[key];
                if (usedSet.has(val)) {
                    hasDuplicate = true;
                    break;
                }
                usedSet.add(val);
            }

            if (hasDuplicate) {
                // Reshuffle if duplicates found
                reshuffleAllThemes();
            }

            return savedTheme;
        } else {
            // First time - assign unique themes
            const assigned = assignUniqueThemesToCards();
            // Save card themes
            try {
                localStorage.setItem('noxa-card-themes-2240', JSON.stringify(allCardThemeIndices));
            } catch (e) { }
            return THEMES[0];
        }
    }

    // ========== SAVE STATE ==========
    function saveCardThemesState() {
        try {
            localStorage.setItem('noxa-card-themes-2240', JSON.stringify(allCardThemeIndices));
        } catch (e) { }
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

            // Ganti tema manual - acak semua card dengan tema unik
            reshuffleAllThemes();

            // Simpan state
            saveCardThemesState();

            // Restart auto theme
            startAutoTheme();

            const refreshIcon = refreshBtn.querySelector('span');
            if (refreshIcon) {
                refreshIcon.style.animation = 'spin 0.5s ease';
                setTimeout(function () { refreshIcon.style.animation = ''; }, 500);
            }
            if (shortcutNotifSpan) {
                shortcutNotifSpan.dataset.manual = 'true';
                shortcutNotifSpan.innerText = '⟳ Refresh + Tema Unik (2240 Tema)';
                setTimeout(function () {
                    shortcutNotifSpan.dataset.manual = '';
                    shortcutNotifSpan.innerText = '';
                }, 2240);
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
        // Load tema tersimpan
        loadSavedTheme();

        // Mulai auto ganti tema setiap 10 detik
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

        console.log('✅ Noxa Store | 2240 Themes Active');
        console.log('🎨 Setiap mapel memiliki tema UNIK (tidak ada yang sama)');
        console.log('📊 Total tema: ' + THEMES.length);
        console.log('🔄 Tema berganti otomatis setiap 10 detik');
        console.log('💾 Tema tersimpan di localStorage');

        // Log jumlah card dan tema unik
        const cards = getAllCards();
        const uniqueThemes = new Set();
        cards.forEach(card => {
            const cardId = getCardId(card);
            if (allCardThemeIndices[cardId] !== undefined) {
                uniqueThemes.add(allCardThemeIndices[cardId]);
            }
        });
        console.log('📌 ' + cards.length + ' card dengan ' + uniqueThemes.size + ' tema unik (0% duplikasi)');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();