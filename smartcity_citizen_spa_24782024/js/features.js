/* ============================================================
   FEATURES.JS - VERSI FINAL AMAN
   Fitur aktif:
   1. Search & Filter
   2. Keyboard Shortcut
   3. Card Expandable
   5. Relative Timestamp
   6. Scroll To Top
   8. Form Validation Visual
   9. Live Character Counter
   10-11. Simpan + Salin Ringkasan

   Catatan:
   - Infinite Scroll dinonaktifkan total.
   - Stagger Animation dinonaktifkan total.
   - File ini tidak membungkus loadDashboardData(), renderList(), atau renderPagination().
============================================================ */

(function () {
    "use strict";

    if (window.silentHillSafeFeaturesFinalV3) {
        return;
    }

    window.silentHillSafeFeaturesFinalV3 = true;
    localStorage.removeItem("silent_hill_scroll_mode");

    let enhanceTimer = null;

    const REPORT_FIELDS = [
        {
            id: "reportTitle",
            min: 5,
            max: 80,
            message: "Judul laporan minimal 5 karakter."
        },
        {
            id: "reportCategory",
            min: 1,
            max: null,
            message: "Kategori laporan wajib dipilih."
        },
        {
            id: "reportLocation",
            min: 5,
            max: 100,
            message: "Lokasi laporan minimal 5 karakter."
        },
        {
            id: "reportDescription",
            min: 15,
            max: 500,
            message: "Deskripsi laporan minimal 15 karakter."
        }
    ];

    const BOOKMARK_KEY = "silent_hill_bookmarked_reports_final_v3";

    function runWhenReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }

        callback();
    }

    function scheduleEnhance() {
        window.clearTimeout(enhanceTimer);

        enhanceTimer = window.setTimeout(function () {
            bindSearchFilter();
            applySearchFilter();
            patchExpandableCards();
            attachRelativeTimestamps();
            bindScrollTopButton();
            bindFormValidation();
            bindCharacterCounter();
            applyCardActions();
        }, 120);
    }

    function getListContainer() {
        return document.getElementById("listContainer");
    }

    function getText(element) {
        return element ? String(element.textContent || "").replace(/\s+/g, " ").trim() : "";
    }

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    /* ============================================================
       FITUR 1: SEARCH & FILTER
    ============================================================ */

    function getStatusKeywords(statusValue) {
        const map = {
            DRAFT: ["draft", "belum diajukan"],
            REPORTED: ["reported", "menunggu", "diajukan"],
            VERIFIED: ["verified", "diverifikasi"],
            IN_PROGRESS: ["in progress", "in_progress", "diproses"],
            RESOLVED: ["resolved", "selesai"]
        };

        return map[statusValue] || [];
    }

    function bindSearchFilter() {
        const panel = document.getElementById("featSearchFilterPanel");
        const input = document.getElementById("featSearchInput");
        const clearButton = document.getElementById("featClearSearchBtn");
        const statusFilter = document.getElementById("featStatusFilter");

        if (!panel || panel.dataset.featureReady === "true") {
            return;
        }

        panel.dataset.featureReady = "true";

        if (input) {
            input.addEventListener("input", function () {
                toggleClearButton();
                applySearchFilter();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener("change", applySearchFilter);
        }

        if (clearButton && input) {
            clearButton.addEventListener("click", function () {
                input.value = "";

                if (statusFilter) {
                    statusFilter.value = "ALL";
                }

                input.focus();
                toggleClearButton();
                applySearchFilter();
            });
        }

        toggleClearButton();
    }

    function toggleClearButton() {
        const input = document.getElementById("featSearchInput");
        const clearButton = document.getElementById("featClearSearchBtn");

        if (!input || !clearButton) {
            return;
        }

        clearButton.classList.toggle("visible", input.value.trim() !== "");
    }

    function applySearchFilter() {
        const listContainer = getListContainer();
        const input = document.getElementById("featSearchInput");
        const statusFilter = document.getElementById("featStatusFilter");
        const counter = document.getElementById("featFilterCounter");

        if (!listContainer) {
            return;
        }

        const cards = Array.from(listContainer.querySelectorAll(".card-report"));

        if (cards.length === 0) {
            if (counter) {
                counter.textContent = "Menampilkan 0 dari 0 laporan";
            }

            return;
        }

        const keyword = normalizeText(input ? input.value : "");
        const statusValue = statusFilter ? statusFilter.value : "ALL";
        const statusKeywords = getStatusKeywords(statusValue);

        let visibleCount = 0;

        cards.forEach(function (card) {
            const cardText = normalizeText(card.textContent);
            const matchKeyword = keyword === "" || cardText.includes(keyword);
            const matchStatus = statusValue === "ALL" ||
                statusKeywords.some(function (statusText) {
                    return cardText.includes(statusText);
                });

            const shouldShow = matchKeyword && matchStatus;

            card.classList.toggle("d-none", !shouldShow);

            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (counter) {
            counter.textContent = `Menampilkan ${visibleCount} dari ${cards.length} laporan`;
        }

        toggleClearButton();
    }

    /* ============================================================
       FITUR 2: KEYBOARD SHORTCUT
    ============================================================ */

    function isDashboardPage() {
        return window.location.hash === "#dashboard";
    }

    function isTypingTarget(element) {
        if (!element) {
            return false;
        }

        const tagName = element.tagName ? element.tagName.toLowerCase() : "";

        return (
            tagName === "input" ||
            tagName === "textarea" ||
            tagName === "select" ||
            element.isContentEditable
        );
    }

    function showShortcutHint(message) {
        let hint = document.getElementById("featShortcutHint");

        if (!hint) {
            hint = document.createElement("div");
            hint.id = "featShortcutHint";
            hint.className = "shortcut-hint";
            document.body.appendChild(hint);
        }

        hint.textContent = `⌨ Shortcut: ${message}`;
        hint.classList.remove("fade-out");
        hint.classList.add("show");

        window.setTimeout(function () {
            hint.classList.add("fade-out");
            hint.classList.remove("show");
        }, 1500);
    }

    function bindKeyboardShortcut() {
        if (document.body.dataset.keyboardShortcutReady === "true") {
            return;
        }

        document.body.dataset.keyboardShortcutReady = "true";

        document.addEventListener("keydown", function (event) {
            if (!isDashboardPage()) {
                return;
            }

            const key = event.key.toLowerCase();

            if (event.key === "Escape") {
                event.preventDefault();

                const modalElement = document.querySelector(".modal.show");

                if (modalElement && typeof bootstrap !== "undefined") {
                    const modal = bootstrap.Modal.getInstance(modalElement) ||
                        bootstrap.Modal.getOrCreateInstance(modalElement);

                    modal.hide();
                    showShortcutHint("Modal ditutup");
                }

                const searchInput = document.getElementById("featSearchInput");
                const statusFilter = document.getElementById("featStatusFilter");

                if (searchInput) {
                    searchInput.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "ALL";
                }

                applySearchFilter();
                return;
            }

            if (isTypingTarget(document.activeElement)) {
                return;
            }

            if (event.key === "/" || ((event.ctrlKey || event.metaKey) && key === "f")) {
                event.preventDefault();

                const searchInput = document.getElementById("featSearchInput");

                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                    searchInput.classList.add("feat-shortcut-focus");

                    window.setTimeout(function () {
                        searchInput.classList.remove("feat-shortcut-focus");
                    }, 700);

                    showShortcutHint("Fokus ke pencarian");
                }

                return;
            }

            if (key === "r") {
                event.preventDefault();

                if (typeof loadDashboardData === "function") {
                    showShortcutHint("Reload dashboard");
                    loadDashboardData(currentTab, currentPage);
                }

                return;
            }

            if (typeof isCitizenUser === "function" && !isCitizenUser()) {
                return;
            }

            if (key === "1") {
                const button = document.getElementById("myReportBtn");

                if (button) {
                    event.preventDefault();
                    button.click();
                    showShortcutHint("Laporan Saya");
                }

                return;
            }

            if (key === "2") {
                const button = document.getElementById("feedBtn");

                if (button) {
                    event.preventDefault();
                    button.click();
                    showShortcutHint("Feed Kota");
                }
            }
        });
    }

    /* ============================================================
       FITUR 3: CARD EXPANDABLE
    ============================================================ */

    function makeSafeId(value) {
        return String(value || "")
            .replace(/[^A-Za-z0-9_-]/g, "")
            .slice(0, 48);
    }

    function patchExpandableCards() {
        const listContainer = getListContainer();

        if (!listContainer) {
            return;
        }

        const cards = Array.from(listContainer.querySelectorAll(".card-report"));

        cards.forEach(function (card, index) {
            if (card.dataset.expandPatchedV3 === "true") {
                return;
            }

            const oldDescription = Array.from(card.querySelectorAll(".report-description")).find(function (element) {
                return !element.closest(".report-desc-wrapper");
            });

            if (!oldDescription) {
                return;
            }

            const descriptionHTML = oldDescription.innerHTML;
            const title = getText(card.querySelector("h5"));
            const reportId = makeSafeId(card.dataset.reportCard || `${index}-${title}`);

            const wrapper = document.createElement("div");
            wrapper.className = "report-desc-wrapper";

            wrapper.innerHTML = `
                <p class="mt-3 mb-2 text-secondary report-description report-desc-preview">
                    ${descriptionHTML}
                </p>

                <div
                    class="report-desc-full"
                    id="reportDesc${reportId}"
                    aria-hidden="true">
                    <p class="mb-0 text-secondary report-description">
                        ${descriptionHTML}
                    </p>
                </div>

                <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary btn-expand"
                    data-expand-report
                    aria-expanded="false"
                    aria-controls="reportDesc${reportId}">
                    <span data-expand-text>Lihat Detail</span>
                    <i class="bi bi-chevron-down ms-1" data-expand-icon></i>
                </button>
            `;

            oldDescription.replaceWith(wrapper);
            card.dataset.expandPatchedV3 = "true";
        });
    }

    function bindExpandableClick() {
        if (document.body.dataset.expandClickReady === "true") {
            return;
        }

        document.body.dataset.expandClickReady = "true";

        document.addEventListener("click", function (event) {
            const button = event.target.closest("[data-expand-report]");

            if (!button) {
                return;
            }

            event.preventDefault();

            const card = button.closest(".card-report");

            if (!card) {
                return;
            }

            const targetId = button.getAttribute("aria-controls");
            const detailElement = targetId ? document.getElementById(targetId) : null;
            const textElement = button.querySelector("[data-expand-text]");
            const iconElement = button.querySelector("[data-expand-icon]");
            const isExpanded = button.getAttribute("aria-expanded") === "true";

            card.classList.toggle("report-card-expanded", !isExpanded);
            button.setAttribute("aria-expanded", String(!isExpanded));

            if (detailElement) {
                detailElement.setAttribute("aria-hidden", String(isExpanded));
            }

            if (textElement) {
                textElement.textContent = isExpanded ? "Lihat Detail" : "Sembunyikan";
            }

            if (iconElement) {
                iconElement.classList.toggle("bi-chevron-down", isExpanded);
                iconElement.classList.toggle("bi-chevron-up", !isExpanded);
            }
        });
    }

    /* ============================================================
       FITUR 5: RELATIVE TIMESTAMP
    ============================================================ */

    function parseTimestamp(value) {
        const rawValue = String(value || "").trim();

        if (!rawValue) {
            return null;
        }

        const date = new Date(rawValue);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    }

    function formatFullTimestamp(date) {
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }) + ", " + date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function formatOriginalDate(date) {
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function timeAgo(rawTimestamp) {
        const date = parseTimestamp(rawTimestamp);

        if (!date) {
            return null;
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);

        if (diffSeconds < 0) {
            return formatOriginalDate(date);
        }

        if (diffSeconds < 60) {
            return "baru saja";
        }

        if (diffMinutes < 60) {
            return `${diffMinutes} menit lalu`;
        }

        if (diffHours < 24) {
            return `${diffHours} jam lalu`;
        }

        if (diffDays === 1) {
            return "kemarin";
        }

        if (diffDays < 7) {
            return `${diffDays} hari lalu`;
        }

        if (diffWeeks < 4) {
            return `${diffWeeks} minggu lalu`;
        }

        if (diffMonths < 12) {
            return `${diffMonths} bulan lalu`;
        }

        return formatOriginalDate(date);
    }

    function attachRelativeTimestamps() {
        const elements = Array.from(document.querySelectorAll("[data-timestamp]"));

        elements.forEach(function (element) {
            const rawTimestamp = element.dataset.timestamp || "";
            const date = parseTimestamp(rawTimestamp);
            const relativeText = timeAgo(rawTimestamp);

            if (!date || !relativeText) {
                return;
            }

            element.textContent = relativeText;
            element.title = formatFullTimestamp(date);
            element.classList.add("feat-relative-timestamp");
        });
    }

    /* ============================================================
       FITUR 6: SCROLL TO TOP
    ============================================================ */

    function bindScrollTopButton() {
        const scrollTopButton = document.getElementById("scrollTopBtn");

        if (!scrollTopButton || scrollTopButton.dataset.scrollTopReady === "true") {
            return;
        }

        scrollTopButton.dataset.scrollTopReady = "true";

        function toggleScrollTopButton() {
            const shouldShow = window.scrollY > 300;

            scrollTopButton.classList.toggle("visible", shouldShow);
            scrollTopButton.setAttribute("aria-hidden", shouldShow ? "false" : "true");
        }

        scrollTopButton.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        window.addEventListener("scroll", toggleScrollTopButton, {
            passive: true
        });

        toggleScrollTopButton();
    }

    /* ============================================================
       FITUR 8: FORM VALIDATION
    ============================================================ */

    function ensureFeedbackElement(element, field) {
        let feedback = element.parentElement.querySelector(
            `.feat-validation-feedback[data-feedback-for="${field.id}"]`
        );

        if (feedback) {
            return feedback;
        }

        feedback = document.createElement("div");
        feedback.className = "feat-validation-feedback";
        feedback.dataset.feedbackFor = field.id;
        feedback.textContent = field.message;

        element.insertAdjacentElement("afterend", feedback);

        return feedback;
    }

    function validateField(field, showMessage) {
        const element = document.getElementById(field.id);

        if (!element) {
            return true;
        }

        const value = String(element.value || "").trim();
        const feedback = ensureFeedbackElement(element, field);
        const isValid = value.length >= field.min;

        if (!showMessage && value.length === 0) {
            element.classList.remove("is-valid", "is-invalid");
            feedback.textContent = field.message;
            return true;
        }

        element.classList.toggle("is-valid", isValid);
        element.classList.toggle("is-invalid", !isValid);
        feedback.textContent = field.message;

        return isValid;
    }

    function validateAllFields(showMessage) {
        let firstInvalid = null;
        let isValid = true;

        REPORT_FIELDS.forEach(function (field) {
            const valid = validateField(field, showMessage);
            const element = document.getElementById(field.id);

            if (!valid) {
                isValid = false;

                if (!firstInvalid && element) {
                    firstInvalid = element;
                }
            }
        });

        if (showMessage && firstInvalid) {
            firstInvalid.focus();
        }

        return isValid;
    }

    function resetValidationVisual() {
        REPORT_FIELDS.forEach(function (field) {
            const element = document.getElementById(field.id);

            if (element) {
                element.classList.remove("is-valid", "is-invalid");
            }
        });
    }

    function bindFormValidation() {
        REPORT_FIELDS.forEach(function (field) {
            const element = document.getElementById(field.id);

            if (!element || element.dataset.validationReadyV3 === "true") {
                return;
            }

            element.dataset.validationReadyV3 = "true";
            ensureFeedbackElement(element, field);

            element.addEventListener("input", function () {
                validateField(field, false);
            });

            element.addEventListener("blur", function () {
                validateField(field, true);
            });

            element.addEventListener("change", function () {
                validateField(field, true);
            });
        });

        const buttons = [
            document.getElementById("btnDraft"),
            document.getElementById("btnSubmit")
        ];

        buttons.forEach(function (button) {
            if (!button || button.dataset.validationButtonReadyV3 === "true") {
                return;
            }

            button.dataset.validationButtonReadyV3 = "true";

            button.addEventListener("click", function () {
                validateAllFields(true);
            });
        });

        const modal = document.getElementById("reportModal");

        if (modal && modal.dataset.validationModalReadyV3 !== "true") {
            modal.dataset.validationModalReadyV3 = "true";

            modal.addEventListener("hidden.bs.modal", resetValidationVisual);

            modal.addEventListener("shown.bs.modal", function () {
                bindFormValidation();
                bindCharacterCounter();
                resetValidationVisual();
            });
        }
    }

    /* ============================================================
       FITUR 9: CHARACTER COUNTER
    ============================================================ */

    function getCounterId(fieldId) {
        return `charCounter_${fieldId}`;
    }

    function ensureCounterElement(element, field) {
        if (!field.max) {
            return null;
        }

        const counterId = getCounterId(field.id);
        let counter = document.getElementById(counterId);

        if (counter) {
            return counter;
        }

        counter = document.createElement("div");
        counter.id = counterId;
        counter.className = "feat-char-counter";
        counter.setAttribute("aria-live", "polite");

        const feedback = element.parentElement.querySelector(
            `.feat-validation-feedback[data-feedback-for="${field.id}"]`
        );

        if (feedback) {
            feedback.insertAdjacentElement("afterend", counter);
        } else {
            element.insertAdjacentElement("afterend", counter);
        }

        return counter;
    }

    function updateCounter(field) {
        const element = document.getElementById(field.id);

        if (!element || !field.max) {
            return;
        }

        const counter = ensureCounterElement(element, field);

        if (!counter) {
            return;
        }

        const length = String(element.value || "").trim().length;

        counter.classList.remove("invalid", "warning", "valid");

        if (length === 0) {
            counter.textContent = `0/${field.max} karakter`;
            return;
        }

        if (length < field.min) {
            counter.classList.add("invalid");
            counter.textContent = `${length}/${field.max} karakter - minimal ${field.min}`;
            return;
        }

        if (length > field.max) {
            counter.classList.add("invalid");
            counter.textContent = `${length}/${field.max} karakter - terlalu panjang`;
            return;
        }

        if (length >= field.max * 0.85) {
            counter.classList.add("warning");
            counter.textContent = `${length}/${field.max} karakter - hampir batas`;
            return;
        }

        counter.classList.add("valid");
        counter.textContent = `${length}/${field.max} karakter`;
    }

    function bindCharacterCounter() {
        REPORT_FIELDS.forEach(function (field) {
            const element = document.getElementById(field.id);

            if (!element || !field.max) {
                return;
            }

            ensureCounterElement(element, field);
            updateCounter(field);

            if (element.dataset.charCounterReadyV3 === "true") {
                return;
            }

            element.dataset.charCounterReadyV3 = "true";

            element.addEventListener("input", function () {
                updateCounter(field);
            });

            element.addEventListener("blur", function () {
                updateCounter(field);
            });
        });
    }

    /* ============================================================
       FITUR 10-11: SIMPAN + SALIN RINGKASAN
    ============================================================ */

    function getBookmarks() {
        try {
            const data = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function saveBookmarks(bookmarks) {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
    }

    function getReportKey(card, index) {
        const title = getText(card.querySelector("h5"));
        const idText = getText(card.querySelector("small"));

        return String(card.dataset.reportCard || `${index}-${title}-${idText}`)
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9_-]/g, "")
            .slice(0, 80);
    }

    function isSaved(reportKey) {
        return getBookmarks().includes(reportKey);
    }

    function toggleSaved(reportKey) {
        let bookmarks = getBookmarks();

        if (bookmarks.includes(reportKey)) {
            bookmarks = bookmarks.filter(function (item) {
                return item !== reportKey;
            });

            saveBookmarks(bookmarks);
            return false;
        }

        bookmarks.push(reportKey);
        saveBookmarks(bookmarks);
        return true;
    }

    function updateSaveButton(button, active) {
        const icon = button.querySelector("[data-save-icon]");
        const text = button.querySelector("[data-save-text]");

        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));

        if (icon) {
            icon.classList.toggle("bi-bookmark", !active);
            icon.classList.toggle("bi-bookmark-fill", active);
        }

        if (text) {
            text.textContent = active ? "Tersimpan" : "Simpan";
        }
    }

    function getReportSummary(card) {
        const title = getText(card.querySelector("h5")) || "-";
        const status = getText(card.querySelector(".badge")) || "-";

        const descriptionElement =
            card.querySelector(".report-desc-full .report-description") ||
            card.querySelector(".report-description");

        const description = getText(descriptionElement) || "-";

        const smallTexts = Array.from(card.querySelectorAll("small"))
            .map(function (item) {
                return getText(item);
            })
            .filter(Boolean)
            .join("\n");

        return [
            "Ringkasan Laporan Silent Hill Citizen Portal",
            "--------------------------------------------",
            `Judul     : ${title}`,
            `Status    : ${status}`,
            `Info      : ${smallTexts || "-"}`,
            `Deskripsi : ${description}`
        ].join("\n");
    }

    function copyText(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        }

        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        return Promise.resolve();
    }

    function addActionsToCard(card, index) {
        if (!card || card.dataset.cardActionsV3Ready === "true") {
            return;
        }

        const cardBody = card.querySelector(".card-body");

        if (!cardBody) {
            return;
        }

        const reportKey = getReportKey(card, index);
        const active = isSaved(reportKey);

        const actionBar = document.createElement("div");
        actionBar.className = "feat-card-actions-final";

        actionBar.innerHTML = `
            <button
                type="button"
                class="btn btn-sm feat-action-btn-final feat-save-btn-final"
                data-save-report-v3
                data-report-key="${reportKey}"
                aria-pressed="${active}">
                <i class="bi ${active ? "bi-bookmark-fill" : "bi-bookmark"}" data-save-icon></i>
                <span data-save-text>${active ? "Tersimpan" : "Simpan"}</span>
            </button>

            <button
                type="button"
                class="btn btn-sm feat-action-btn-final feat-copy-btn-final"
                data-copy-report-v3>
                <i class="bi bi-clipboard" data-copy-icon></i>
                <span data-copy-text>Salin</span>
            </button>
        `;

        cardBody.appendChild(actionBar);
        card.dataset.cardActionsV3Ready = "true";
    }

    function applyCardActions() {
        const cards = Array.from(document.querySelectorAll(".card-report"));

        cards.forEach(function (card, index) {
            addActionsToCard(card, index);
        });
    }

    function bindCardActionClicks() {
        if (document.body.dataset.cardActionClickReadyV3 === "true") {
            return;
        }

        document.body.dataset.cardActionClickReadyV3 = "true";

        document.addEventListener("click", function (event) {
            const saveButton = event.target.closest("[data-save-report-v3]");
            const copyButton = event.target.closest("[data-copy-report-v3]");

            if (saveButton) {
                event.preventDefault();

                const reportKey = saveButton.dataset.reportKey;

                if (!reportKey) {
                    return;
                }

                const active = toggleSaved(reportKey);
                updateSaveButton(saveButton, active);

                if (typeof showToast === "function") {
                    showToast(
                        active ? "Laporan disimpan." : "Laporan dihapus dari simpanan.",
                        "info"
                    );
                }

                return;
            }

            if (copyButton) {
                event.preventDefault();

                const card = copyButton.closest(".card-report");

                if (!card) {
                    return;
                }

                copyText(getReportSummary(card)).then(function () {
                    const icon = copyButton.querySelector("[data-copy-icon]");
                    const text = copyButton.querySelector("[data-copy-text]");

                    copyButton.classList.add("copied");

                    if (icon) {
                        icon.classList.remove("bi-clipboard");
                        icon.classList.add("bi-check2");
                    }

                    if (text) {
                        text.textContent = "Tersalin";
                    }

                    if (typeof showToast === "function") {
                        showToast("Ringkasan laporan berhasil disalin.", "info");
                    }

                    window.setTimeout(function () {
                        copyButton.classList.remove("copied");

                        if (icon) {
                            icon.classList.remove("bi-check2");
                            icon.classList.add("bi-clipboard");
                        }

                        if (text) {
                            text.textContent = "Salin";
                        }
                    }, 1500);
                });
            }
        });
    }

    /* ============================================================
       OBSERVER UTAMA
    ============================================================ */

    function observePageChanges() {
        const target = document.getElementById("app-content") || document.body;

        if (!target || !("MutationObserver" in window)) {
            return;
        }

        const observer = new MutationObserver(scheduleEnhance);

        observer.observe(target, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        bindKeyboardShortcut();
        bindExpandableClick();
        bindCardActionClicks();
        bindSearchFilter();
        bindScrollTopButton();
        bindFormValidation();
        bindCharacterCounter();
        observePageChanges();
        scheduleEnhance();

        window.addEventListener("hashchange", scheduleEnhance);

        window.setInterval(function () {
            attachRelativeTimestamps();
            applyCardActions();
        }, 60000);

        window.setTimeout(scheduleEnhance, 300);
        window.setTimeout(scheduleEnhance, 800);
        window.setTimeout(scheduleEnhance, 1500);
    }

    runWhenReady(init);
})();
