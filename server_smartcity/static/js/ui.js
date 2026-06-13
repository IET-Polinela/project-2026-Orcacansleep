document.addEventListener("DOMContentLoaded", function () {
    setupNavbarToggle();
    setupScrollTop();
    setupToasts();
    setupRevealAnimation();
});

function setupNavbarToggle() {
    const toggleButton = document.querySelector("[data-nav-toggle]");
    const navMenu = document.querySelector("[data-nav-menu]");

    if (!toggleButton || !navMenu) return;

    toggleButton.addEventListener("click", function () {
        navMenu.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = toggleButton.contains(event.target);

        if (!isClickInsideMenu && !isClickOnToggle) {
            navMenu.classList.remove("show");
        }
    });
}

function setupScrollTop() {
    const scrollButton = document.getElementById("scrollTopBtn");

    if (!scrollButton) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 420) {
            scrollButton.classList.add("show");
        } else {
            scrollButton.classList.remove("show");
        }
    });

    scrollButton.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

function setupToasts() {
    const toasts = document.querySelectorAll("[data-toast]");

    toasts.forEach(function (toast) {
        const closeButton = toast.querySelector("[data-toast-close]");

        if (closeButton) {
            closeButton.addEventListener("click", function () {
                hideToast(toast);
            });
        }

        setTimeout(function () {
            hideToast(toast);
        }, 4200);
    });
}

function hideToast(toast) {
    if (!toast) return;

    toast.style.opacity = "0";
    toast.style.transform = "translateX(16px)";

    setTimeout(function () {
        toast.remove();
    }, 240);
}

function setupRevealAnimation() {
    const elements = document.querySelectorAll("[data-animate]");

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12
    });

    elements.forEach(function (element) {
        observer.observe(element);
    });
}

/* === FITUR 1: LIVE SEARCH REALTIME === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('reportTableBody');

    if (!searchInput || !tableBody) {
        return;
    }

    const table = tableBody.closest('table');
    const columnCount = table ? table.querySelectorAll('thead th').length : 4;

    let counterElement = document.getElementById('reportSearchCounter');

    if (!counterElement) {
        counterElement = document.createElement('small');
        counterElement.id = 'reportSearchCounter';
        counterElement.className = 'report-search-counter';
        counterElement.setAttribute('aria-live', 'polite');

        const searchWrapper = searchInput.closest('.search-input-wrap');

        if (searchWrapper && searchWrapper.parentNode) {
            searchWrapper.insertAdjacentElement('afterend', counterElement);
        }
    }

    const emptyRow = document.createElement('tr');
    emptyRow.className = 'sh-live-search-empty-row';
    emptyRow.hidden = true;
    emptyRow.innerHTML = `
        <td colspan="${columnCount}">
            <div class="sh-live-search-empty-state">
                <i class="bi bi-search"></i>
                <strong>Tidak ada laporan ditemukan</strong>
                <span>Coba gunakan kata kunci pencarian yang lain.</span>
            </div>
        </td>
    `;

    tableBody.appendChild(emptyRow);

    function getReportRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(function (row) {
            const isEmptyRow = row.classList.contains('sh-live-search-empty-row');
            const isDefaultEmptyState = row.querySelector('.empty-table-state');

            return !isEmptyRow && !isDefaultEmptyState;
        });
    }

    function getSearchableText(row) {
        const titleCell = row.cells[0] ? row.cells[0].textContent : '';
        const locationCell = row.cells[1] ? row.cells[1].textContent : '';
        const statusCell = row.cells[2] ? row.cells[2].textContent : '';

        return `${titleCell} ${locationCell} ${statusCell}`.toLowerCase();
    }

    function showRow(row) {
        row.hidden = false;
        row.classList.add('sh-live-search-row');

        requestAnimationFrame(function () {
            row.classList.remove('sh-live-search-hidden');
        });
    }

    function hideRow(row) {
        row.classList.add('sh-live-search-row');
        row.classList.add('sh-live-search-hidden');

        window.setTimeout(function () {
            if (row.classList.contains('sh-live-search-hidden')) {
                row.hidden = true;
            }
        }, 180);
    }

    function updateCounter(visibleCount, totalCount) {
        if (!counterElement) {
            return;
        }

        counterElement.textContent = `Menampilkan ${visibleCount} dari ${totalCount} laporan`;
    }

    function filterReports() {
        const keyword = searchInput.value.trim().toLowerCase();
        const rows = getReportRows();
        let visibleCount = 0;

        rows.forEach(function (row) {
            const searchableText = getSearchableText(row);
            const isMatch = keyword === '' || searchableText.includes(keyword);

            if (isMatch) {
                visibleCount += 1;
                showRow(row);
            } else {
                hideRow(row);
            }
        });

        emptyRow.hidden = visibleCount !== 0 || rows.length === 0;

        updateCounter(visibleCount, rows.length);
    }

    /*
     * Capture listener dipakai supaya search lama berbasis fetch/API
     * tidak ikut berjalan kalau masih ada script lama di template.
     */
    document.addEventListener('input', function (event) {
        if (event.target !== searchInput) {
            return;
        }

        event.stopImmediatePropagation();
        filterReports();
    }, true);

    filterReports();
});

/* === FITUR 2: TOAST NOTIFICATION === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const TOAST_DURATION = 4000;

    function getToastContainer() {
        let container = document.getElementById('shToastContainer');

        if (!container) {
            container = document.createElement('div');
            container.id = 'shToastContainer';
            container.className = 'sh-toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(container);
        }

        return container;
    }

    function normalizeToastType(type) {
        const safeType = String(type || 'info').toLowerCase();

        if (safeType.includes('success')) return 'success';
        if (safeType.includes('error')) return 'error';
        if (safeType.includes('danger')) return 'error';
        if (safeType.includes('warning')) return 'warning';
        if (safeType.includes('info')) return 'info';

        return 'info';
    }

    function getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        return icons[type] || icons.info;
    }

    function getToastTitle(type) {
        const titles = {
            success: 'Berhasil',
            error: 'Gagal',
            warning: 'Peringatan',
            info: 'Informasi'
        };

        return titles[type] || titles.info;
    }

    function showToast(message, type, duration) {
        const normalizedType = normalizeToastType(type);
        const toastDuration = Number(duration || TOAST_DURATION);
        const container = getToastContainer();

        const toast = document.createElement('div');
        toast.className = `sh-toast sh-toast-${normalizedType}`;
        toast.setAttribute('role', 'status');

        toast.innerHTML = `
            <div class="sh-toast-icon">${getToastIcon(normalizedType)}</div>

            <div class="sh-toast-content">
                <strong class="sh-toast-title">${getToastTitle(normalizedType)}</strong>
                <p class="sh-toast-message">${message}</p>
            </div>

            <button type="button" class="sh-toast-close" aria-label="Tutup notifikasi">×</button>

            <div class="sh-toast-progress"></div>
        `;

        container.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        const closeButton = toast.querySelector('.sh-toast-close');

        function closeToast() {
            toast.classList.remove('show');
            toast.classList.add('hide');

            window.setTimeout(function () {
                toast.remove();
            }, 320);
        }

        closeButton.addEventListener('click', closeToast);

        window.setTimeout(closeToast, toastDuration);
    }

    function renderDjangoMessages() {
        const source = document.getElementById('djangoToastSource');

        if (!source) {
            return;
        }

        const messages = source.querySelectorAll('[data-toast-message]');

        messages.forEach(function (item) {
            const message = item.dataset.toastMessage || item.textContent.trim();
            const type = item.dataset.toastType || 'info';

            if (message) {
                showToast(message, type, TOAST_DURATION);
            }
        });

        source.remove();
    }

    window.showToast = showToast;

    renderDjangoMessages();
});

/* === FITUR 3: CUSTOM CONFIRM MODAL HAPUS === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.querySelector || !document.addEventListener) {
        return;
    }

    let pendingDeleteAction = null;

    function createConfirmModal() {
        const existingModal = document.getElementById('deleteConfirmModal');

        if (existingModal) {
            return existingModal;
        }

        const modal = document.createElement('div');
        modal.id = 'deleteConfirmModal';
        modal.className = 'confirm-modal-overlay';
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="deleteConfirmTitle">
                <div class="confirm-modal-icon">⚠</div>

                <h2 class="confirm-modal-title" id="deleteConfirmTitle">
                    Hapus Laporan?
                </h2>

                <p class="confirm-modal-message" id="deleteConfirmMessage">
                    Tindakan ini tidak dapat dibatalkan.
                </p>

                <div class="confirm-modal-actions">
                    <button type="button" class="confirm-modal-btn confirm-modal-cancel" data-confirm-cancel>
                        Batal
                    </button>

                    <button type="button" class="confirm-modal-btn confirm-modal-danger" data-confirm-submit>
                        Ya, Hapus
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        return modal;
    }

    function openConfirmModal(title, message, action) {
        const modal = createConfirmModal();
        const titleElement = modal.querySelector('#deleteConfirmTitle');
        const messageElement = modal.querySelector('#deleteConfirmMessage');

        pendingDeleteAction = action;

        titleElement.textContent = title || 'Hapus Laporan?';
        messageElement.textContent = message || 'Tindakan ini tidak dapat dibatalkan.';

        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeConfirmModal() {
        const modal = document.getElementById('deleteConfirmModal');

        if (!modal) {
            return;
        }

        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        pendingDeleteAction = null;
    }

    function submitFormSafely(form) {
        if (!form) {
            return;
        }

        HTMLFormElement.prototype.submit.call(form);
    }

    document.addEventListener('click', function (event) {
        const trigger = event.target.closest('[data-confirm-delete]');

        if (!trigger) {
            return;
        }

        event.preventDefault();

        const title = trigger.getAttribute('data-confirm-title') || 'Hapus Laporan?';
        const message = trigger.getAttribute('data-confirm-message') || 'Tindakan ini tidak dapat dibatalkan.';

        if (trigger.tagName.toLowerCase() === 'a') {
            const targetUrl = trigger.getAttribute('href');

            openConfirmModal(title, message, function () {
                if (targetUrl) {
                    window.location.href = targetUrl;
                }
            });

            return;
        }

        const form = trigger.closest('form');

        openConfirmModal(title, message, function () {
            submitFormSafely(form);
        });
    });

    document.addEventListener('click', function (event) {
        const modal = document.getElementById('deleteConfirmModal');

        if (!modal || !modal.classList.contains('show')) {
            return;
        }

        if (event.target === modal || event.target.closest('[data-confirm-cancel]')) {
            closeConfirmModal();
            return;
        }

        if (event.target.closest('[data-confirm-submit]')) {
            const action = pendingDeleteAction;

            closeConfirmModal();

            if (typeof action === 'function') {
                action();
            }
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeConfirmModal();
        }
    });
});

/* === FITUR 4: SCROLL TO TOP BUTTON === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const scrollTopButton = document.getElementById('scrollTopBtn');

    if (!scrollTopButton) {
        return;
    }

    const SHOW_AFTER = 300;

    function isSmoothScrollSupported() {
        return 'scrollBehavior' in document.documentElement.style;
    }

    function toggleScrollTopButton() {
        const shouldShow = window.scrollY > SHOW_AFTER;

        scrollTopButton.classList.toggle('sh-scroll-visible', shouldShow);
        scrollTopButton.classList.toggle('visible', shouldShow);
        scrollTopButton.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    }

    function scrollToTop() {
        if (isSmoothScrollSupported()) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }

        window.scrollTo(0, 0);
    }

    window.addEventListener('scroll', toggleScrollTopButton, {
        passive: true
    });

    scrollTopButton.addEventListener('click', function () {
        scrollToTop();
    });

    toggleScrollTopButton();
});

/* === FITUR 5: COUNTER ANIMASI STAT CARDS - FIX DASHBOARD === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const COUNTER_DURATION = 1500;

    /*
     * Catatan:
     * - Counter global hanya membaca elemen yang punya data-counter.
     * - Dashboard tidak disentuh di sini karena Dashboard punya proses fetch sendiri.
     * - Ini mencegah angka Dashboard terkunci di 0 sebelum data JSON selesai dimuat.
     */
    const counters = Array.from(document.querySelectorAll('[data-counter]'));

    if (!counters.length) {
        return;
    }

    function parseCounterValue(value) {
        const cleanValue = String(value || '0').replace(/[^\d]/g, '');
        return Number(cleanValue || 0);
    }

    function easeOutCubic(progress) {
        return 1 - Math.pow(1 - progress, 3);
    }

    function animateCounter(element) {
        if (!element || element.dataset.counterDone === 'true') {
            return;
        }

        const target = parseCounterValue(element.dataset.counter);

        element.dataset.counterDone = 'true';
        element.classList.add('sh-counter-ready');
        element.classList.add('sh-counter-animating');

        if (target <= 0) {
            element.textContent = '0';
            element.classList.remove('sh-counter-animating');
            return;
        }

        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / COUNTER_DURATION, 1);
            const easedProgress = easeOutCubic(progress);
            const currentValue = Math.round(target * easedProgress);

            element.textContent = currentValue.toLocaleString('id-ID');

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('id-ID');
                element.classList.remove('sh-counter-animating');
            }
        }

        requestAnimationFrame(updateCounter);
    }

    if (!('IntersectionObserver' in window)) {
        counters.forEach(animateCounter);
        return;
    }

    const observer = new IntersectionObserver(function (entries, counterObserver) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.35
    });

    counters.forEach(function (counter) {
        observer.observe(counter);
    });
});

/* === FITUR 6: STAGGER FADE-IN ANIMATION === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.querySelectorAll) {
        return;
    }

    const fadeSelector = [
        'main section',
        '.glass-card',
        '.card',
        '.stat-card',
        '.landing-stat-card',
        '.metric-card',
        '.chart-card',
        '.feature-card',
        '.workflow-card',
        '.about-feature-card',
        '.about-role-card',
        '.contact-info-card',
        '.contact-note-card',
        '.auth-card',
        '.auth-visual'
    ].join(',');

    const excludedSelector = [
        '.report-modal',
        '.report-modal *',
        '.confirm-modal-overlay',
        '.confirm-modal-overlay *',
        '.sh-toast',
        '.sh-toast *',
        '#djangoToastSource',
        '#scrollTopBtn',
        '.app-navbar',
        '.app-navbar *'
    ].join(',');

    function isElementAllowed(element) {
        if (!element || element.matches(excludedSelector)) {
            return false;
        }

        if (element.classList.contains('fade-in-element')) {
            return false;
        }

        return true;
    }

    function getFadeElements() {
        return Array.from(document.querySelectorAll(fadeSelector)).filter(isElementAllowed);
    }

    function applyFadeClass(elements) {
        elements.forEach(function (element, index) {
            const delay = Math.min(index % 8, 7) * 0.1;

            element.classList.add('fade-in-element');
            element.style.setProperty('--fade-delay', `${delay}s`);
        });
    }

    function showElement(element) {
        element.classList.add('visible');
    }

    function initFadeAnimation() {
        const elements = getFadeElements();

        if (!elements.length) {
            return;
        }

        applyFadeClass(elements);

        if (!('IntersectionObserver' in window)) {
            elements.forEach(showElement);
            return;
        }

        const observer = new IntersectionObserver(function (entries, fadeObserver) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                showElement(entry.target);
                fadeObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        elements.forEach(function (element) {
            observer.observe(element);
        });
    }

    initFadeAnimation();
});

/* === FITUR 7: TABLE COLUMN SORT === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.querySelector || !document.querySelectorAll) {
        return;
    }

    const tableBody = document.getElementById('reportTableBody');

    if (!tableBody) {
        return;
    }

    const table = tableBody.closest('table');

    if (!table) {
        return;
    }

    const headers = Array.from(table.querySelectorAll('thead th'));
    const sortableColumns = [
        { index: 0, key: 'title' },
        { index: 1, key: 'location' },
        { index: 2, key: 'status' }
    ];

    let activeSort = {
        index: null,
        direction: 'none'
    };

    function getReportRows() {
        return Array.from(tableBody.querySelectorAll('tr')).filter(function (row) {
            const isSearchEmptyRow = row.classList.contains('sh-live-search-empty-row');
            const isDefaultEmptyRow = row.querySelector('.empty-table-state');

            return !isSearchEmptyRow && !isDefaultEmptyRow;
        });
    }

    function getSearchEmptyRow() {
        return tableBody.querySelector('.sh-live-search-empty-row');
    }

    function setOriginalOrder() {
        getReportRows().forEach(function (row, index) {
            if (!row.dataset.originalIndex) {
                row.dataset.originalIndex = String(index);
            }
        });
    }

    function normalizeText(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function getCellText(row, columnIndex) {
        const cell = row.cells[columnIndex];

        if (!cell) {
            return '';
        }

        return normalizeText(cell.textContent);
    }

    function clearHeaderStates() {
        sortableColumns.forEach(function (column) {
            const header = headers[column.index];

            if (!header) {
                return;
            }

            header.classList.remove('sort-asc', 'sort-desc');

            const icon = header.querySelector('.sort-icon');

            if (icon) {
                icon.textContent = '↕';
            }
        });
    }

    function updateHeaderState(header, direction) {
        clearHeaderStates();

        if (direction === 'asc') {
            header.classList.add('sort-asc');
            header.querySelector('.sort-icon').textContent = '↑';
        }

        if (direction === 'desc') {
            header.classList.add('sort-desc');
            header.querySelector('.sort-icon').textContent = '↓';
        }
    }

    function getNextDirection(columnIndex) {
        if (activeSort.index !== columnIndex) {
            return 'asc';
        }

        if (activeSort.direction === 'none') {
            return 'asc';
        }

        if (activeSort.direction === 'asc') {
            return 'desc';
        }

        return 'none';
    }

    function appendRows(rows) {
        const emptyRow = getSearchEmptyRow();

        rows.forEach(function (row) {
            tableBody.appendChild(row);
        });

        if (emptyRow) {
            tableBody.appendChild(emptyRow);
        }
    }

    function sortRows(columnIndex, direction) {
        const rows = getReportRows();

        if (!rows.length) {
            return;
        }

        let sortedRows = rows.slice();

        if (direction === 'none') {
            sortedRows.sort(function (a, b) {
                return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
            });

            appendRows(sortedRows);
            return;
        }

        sortedRows.sort(function (a, b) {
            const valueA = getCellText(a, columnIndex);
            const valueB = getCellText(b, columnIndex);

            return valueA.localeCompare(valueB, 'id', {
                sensitivity: 'base',
                numeric: true
            });
        });

        if (direction === 'desc') {
            sortedRows.reverse();
        }

        appendRows(sortedRows);
    }

    function enhanceHeader(column) {
        const header = headers[column.index];

        if (!header || header.dataset.sortReady === 'true') {
            return;
        }

        const label = header.textContent.trim();

        header.dataset.sortReady = 'true';
        header.classList.add('sortable-header');
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-label', `Urutkan berdasarkan ${label}`);

        header.innerHTML = `
            <span class="sortable-header-content">
                <span>${label}</span>
                <span class="sort-icon" aria-hidden="true">↕</span>
            </span>
        `;

        function handleSort() {
            setOriginalOrder();

            const nextDirection = getNextDirection(column.index);

            activeSort = {
                index: nextDirection === 'none' ? null : column.index,
                direction: nextDirection
            };

            updateHeaderState(header, nextDirection);
            sortRows(column.index, nextDirection);
        }

        header.addEventListener('click', handleSort);

        header.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }

            event.preventDefault();
            handleSort();
        });
    }

    setOriginalOrder();

    sortableColumns.forEach(enhanceHeader);
});

/* === FITUR 8: RELATIVE TIMESTAMP === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.querySelectorAll) {
        return;
    }

    const MONTHS = {
        jan: 0,
        januari: 0,
        january: 0,

        feb: 1,
        februari: 1,
        february: 1,

        mar: 2,
        maret: 2,
        march: 2,

        apr: 3,
        april: 3,

        mei: 4,
        may: 4,

        jun: 5,
        juni: 5,
        june: 5,

        jul: 6,
        juli: 6,
        july: 6,

        agu: 7,
        ags: 7,
        agustus: 7,
        aug: 7,
        august: 7,

        sep: 8,
        sept: 8,
        september: 8,

        okt: 9,
        oktober: 9,
        oct: 9,
        october: 9,

        nov: 10,
        november: 10,

        des: 11,
        desember: 11,
        dec: 11,
        december: 11
    };

    function normalizeDateText(value) {
        return String(value || '')
            .replace(/\./g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function parseTimestamp(value) {
        const rawValue = normalizeDateText(value);

        if (!rawValue) {
            return null;
        }

        /*
         * Format ISO dari Django date:'c'
         * Contoh: 2026-06-13T09:20:00+07:00
         */
        if (/^\d{4}-\d{2}-\d{2}/.test(rawValue)) {
            const isoDate = new Date(rawValue);

            if (!Number.isNaN(isoDate.getTime())) {
                return isoDate;
            }
        }

        /*
         * Format dari template:
         * 13 Jun 2026, 02:20
         * 13 Juni 2026 02:20
         * 13 Mei 2026
         */
        const localMatch = rawValue.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?$/);

        if (localMatch) {
            const day = Number(localMatch[1]);
            const monthName = localMatch[2].toLowerCase();
            const year = Number(localMatch[3]);
            const hour = Number(localMatch[4] || 0);
            const minute = Number(localMatch[5] || 0);
            const monthIndex = MONTHS[monthName];

            if (monthIndex !== undefined) {
                return new Date(year, monthIndex, day, hour, minute, 0);
            }
        }

        /*
         * Fallback untuk format lain yang masih bisa dibaca browser.
         */
        const nativeDate = new Date(rawValue);

        if (!Number.isNaN(nativeDate.getTime())) {
            return nativeDate;
        }

        return null;
    }

    function formatFullDate(date) {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function formatFullDateTime(date) {
        const datePart = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const timePart = date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `${datePart}, ${timePart}`;
    }

    function timeAgo(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 0) {
            return formatFullDate(date);
        }

        if (diffSeconds < 60) {
            return 'baru saja';
        }

        if (diffMinutes < 60) {
            return `${diffMinutes} menit lalu`;
        }

        if (diffHours < 24) {
            return `${diffHours} jam lalu`;
        }

        if (diffDays === 1) {
            return 'kemarin';
        }

        if (diffDays < 7) {
            return `${diffDays} hari lalu`;
        }

        return formatFullDate(date);
    }

    function updateTimestamp(element) {
        const rawTimestamp = element.dataset.timestamp || element.getAttribute('datetime') || element.textContent;
        const normalizedTimestamp = normalizeDateText(rawTimestamp);

        if (!normalizedTimestamp) {
            return;
        }

        /*
         * Kalau timestamp yang sama sudah diproses, tidak perlu diproses ulang.
         * Kalau data-timestamp berubah, misalnya dari modal AJAX, elemen akan diproses lagi.
         */
        if (element.dataset.timestampProcessedValue === normalizedTimestamp) {
            return;
        }

        const parsedDate = parseTimestamp(normalizedTimestamp);

        if (!parsedDate) {
            return;
        }

        element.dataset.timestampProcessedValue = normalizedTimestamp;
        element.dataset.timestampOriginal = normalizedTimestamp;
        element.title = formatFullDateTime(parsedDate);
        element.textContent = timeAgo(parsedDate);
        element.classList.add('relative-timestamp');
    }

    function updateAllTimestamps(root) {
        const scope = root || document;
        const elements = Array.from(scope.querySelectorAll('[data-timestamp], .timestamp, .relative-timestamp'));

        elements.forEach(updateTimestamp);
    }

    window.silentHillUpdateTimestamps = updateAllTimestamps;

    document.addEventListener('silentHill:timestamps-updated', function () {
        updateAllTimestamps(document);
    });

    updateAllTimestamps(document);

    /*
     * Update ringan setiap 60 detik agar teks seperti "baru saja"
     * bisa berubah menjadi "1 menit lalu" tanpa reload.
     */
    window.setInterval(function () {
        updateAllTimestamps(document);
    }, 60000);
});

/* === FITUR 9: KEYBOARD SHORTCUT === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.addEventListener) {
        return;
    }

    const SHORTCUT_TOAST_DURATION = 1500;

    function isTypingTarget(element) {
        if (!element) {
            return false;
        }

        const tagName = element.tagName ? element.tagName.toLowerCase() : '';

        return (
            tagName === 'input' ||
            tagName === 'textarea' ||
            tagName === 'select' ||
            element.isContentEditable
        );
    }

    function showShortcutToast(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'info', SHORTCUT_TOAST_DURATION);
        }
    }

    function focusSearchBar() {
        const searchInput = document.getElementById('searchInput');

        if (!searchInput) {
            showShortcutToast('Search bar tidak tersedia di halaman ini.');
            return;
        }

        searchInput.focus();
        searchInput.select();

        searchInput.classList.add('shortcut-focus-ring');

        window.setTimeout(function () {
            searchInput.classList.remove('shortcut-focus-ring');
        }, 650);

        showShortcutToast('Search aktif.');
    }

    function navigateTo(url, label) {
        showShortcutToast(`Navigating to ${label}...`);

        window.setTimeout(function () {
            window.location.href = url;
        }, 180);
    }

    function closeReportModal() {
        const modal = document.getElementById('reportDetailModal');

        if (!modal || !modal.classList.contains('show')) {
            return false;
        }

        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        return true;
    }

    function closeConfirmModal() {
        const modal = document.getElementById('deleteConfirmModal');

        if (!modal || !modal.classList.contains('show')) {
            return false;
        }

        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        return true;
    }

    function closeLatestToast() {
        const toasts = Array.from(document.querySelectorAll('.sh-toast.show'));

        if (!toasts.length) {
            return false;
        }

        const latestToast = toasts[toasts.length - 1];

        latestToast.classList.remove('show');
        latestToast.classList.add('hide');

        window.setTimeout(function () {
            latestToast.remove();
        }, 320);

        return true;
    }

    function handleEscapeShortcut() {
        const closedConfirmModal = closeConfirmModal();

        if (closedConfirmModal) {
            return;
        }

        const closedReportModal = closeReportModal();

        if (closedReportModal) {
            return;
        }

        closeLatestToast();
    }

    document.addEventListener('keydown', function (event) {
        const activeElement = document.activeElement;
        const isTyping = isTypingTarget(activeElement);

        /*
         * Escape tetap boleh dipakai untuk menutup modal/toast,
         * tetapi shortcut navigasi tidak berjalan saat user sedang mengetik.
         */
        if (event.key === 'Escape') {
            handleEscapeShortcut();
            return;
        }

        if (isTyping) {
            return;
        }

        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            focusSearchBar();
            return;
        }

        if (event.key === '/') {
            event.preventDefault();
            focusSearchBar();
            return;
        }

        if (event.altKey && event.key.toLowerCase() === 'h') {
            event.preventDefault();
            navigateTo('/', 'Home');
            return;
        }

        if (event.altKey && event.key.toLowerCase() === 'd') {
            event.preventDefault();
            navigateTo('/dashboard/', 'Dashboard');
            return;
        }

        if (event.altKey && event.key.toLowerCase() === 'r') {
            event.preventDefault();
            navigateTo('/reports/', 'Reports');
        }
    });
});

/* === FITUR 10: PRINT LAPORAN === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const printButton = document.querySelector('[data-print-report]');
    const printedAtElement = document.querySelector('[data-print-date]');

    if (!printButton) {
        return;
    }

    function formatPrintDate(date) {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    printButton.addEventListener('click', function () {
        if (printedAtElement) {
            printedAtElement.textContent = formatPrintDate(new Date());
        }

        window.print();
    });
});

/* === FIX FITUR 10: PRINT MODAL DETAIL LAPORAN === */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const modalPrintButton = document.getElementById('modalPrintBtn');

    if (!modalPrintButton) {
        return;
    }

    modalPrintButton.addEventListener('click', function () {
        const title = document.getElementById('modalTitle')?.textContent || '-';
        const status = document.getElementById('modalStatus')?.textContent || '-';
        const category = document.getElementById('modalCategory')?.textContent || '-';
        const location = document.getElementById('modalLocation')?.textContent || '-';
        const createdAt = document.getElementById('modalCreatedAt')?.getAttribute('title') ||
            document.getElementById('modalCreatedAt')?.textContent ||
            '-';
        const description = document.getElementById('modalDescription')?.textContent || '-';

        const printWindow = window.open('', '_blank', 'width=900,height=700');

        if (!printWindow) {
            if (typeof window.showToast === 'function') {
                window.showToast('Popup print diblokir browser.', 'warning', 2500);
            }
            return;
        }

        const printedAt = new Date().toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <title>Print Detail Laporan</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        color: #111;
                        background: #fff;
                        padding: 32px;
                        line-height: 1.6;
                    }

                    .print-header {
                        text-align: center;
                        border-bottom: 2px solid #111;
                        padding-bottom: 14px;
                        margin-bottom: 24px;
                    }

                    .print-header h1 {
                        margin: 0;
                        font-size: 22px;
                    }

                    .print-header p {
                        margin: 6px 0 0;
                        color: #444;
                        font-size: 13px;
                    }

                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin: 18px 0;
                    }

                    .info-item,
                    .description {
                        border: 1px solid #777;
                        padding: 12px;
                    }

                    .info-item span,
                    .description span {
                        display: block;
                        margin-bottom: 5px;
                        color: #333;
                        font-size: 11px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }

                    .info-item strong {
                        font-size: 14px;
                    }

                    .description p {
                        margin: 0;
                    }

                    .footer {
                        margin-top: 28px;
                        padding-top: 12px;
                        border-top: 1px solid #777;
                        color: #444;
                        font-size: 12px;
                        text-align: right;
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <h1>Silent Hill Portal — Detail Laporan</h1>
                    <p>Dokumen cetak laporan masalah kota</p>
                </div>

                <h2>${title}</h2>

                <div class="info-grid">
                    <div class="info-item">
                        <span>Status</span>
                        <strong>${status}</strong>
                    </div>

                    <div class="info-item">
                        <span>Kategori</span>
                        <strong>${category}</strong>
                    </div>

                    <div class="info-item">
                        <span>Lokasi</span>
                        <strong>${location}</strong>
                    </div>

                    <div class="info-item">
                        <span>Tanggal Dibuat</span>
                        <strong>${createdAt}</strong>
                    </div>
                </div>

                <div class="description">
                    <span>Deskripsi Laporan</span>
                    <p>${description}</p>
                </div>

                <div class="footer">
                    Dicetak dari Silent Hill Portal pada ${printedAt}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        window.setTimeout(function () {
            printWindow.print();
            printWindow.close();
        }, 300);
    });
});