const PAGE_SIZE = 10;

let currentTab = "my_reports";
let currentPage = 1;
let allReports = [];
let totalPages = 1;
let totalReports = 0;
let editingReportId = null;
let modalFormInitialized = false;
let isSavingReport = false;

async function loadDashboardData(tab = currentTab, page = currentPage) {
    currentTab = isAdminUser() ? "admin_reports" : tab;
    currentPage = page;

    updateTabButtons();
    showListLoading();

    try {
        const response = await requestAPI(
            `/api/report/?tab=${encodeURIComponent(currentTab)}&page=${page}&page_size=${PAGE_SIZE}`,
            "GET"
        );

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            return;
        }

        if (response.status !== 200) {
            throw new Error("Gagal mengambil data laporan.");
        }

        const data = await parseResponseJSON(response);

        allReports = Array.isArray(data.results) ? data.results : [];
        totalReports = data.count || 0;
        totalPages = Math.max(1, Math.ceil(totalReports / PAGE_SIZE));

        renderList();
        renderPagination();
        updateDashboardInfo();
        await loadSummaryStats();

    } catch (error) {
        console.error("Dashboard error:", error);
        showListError("Gagal memuat data laporan. Pastikan server berjalan dan token masih valid.");
        clearPagination();
    }
}

async function loadSummaryStats() {
    try {
        const endpoint = isAdminUser()
            ? "/api/report/?page_size=1000"
            : "/api/report/?tab=my_reports&page_size=1000";

        const response = await requestAPI(endpoint, "GET");

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            return;
        }

        if (response.status !== 200) {
            throw new Error("Gagal mengambil rekap status.");
        }

        const data = await parseResponseJSON(response);
        const reports = Array.isArray(data.results) ? data.results : [];

        const draft = reports.filter(report => report.status === "DRAFT").length;

        const processed = reports.filter(report =>
            report.status === "REPORTED" ||
            report.status === "VERIFIED" ||
            report.status === "IN_PROGRESS"
        ).length;

        const resolved = reports.filter(report => report.status === "RESOLVED").length;

        setText("draftCount", draft);
        setText("reportedCount", processed);
        setText("resolvedCount", resolved);

    } catch (error) {
        console.error("Summary error:", error);
    }
}

function updateDashboardInfo() {
    const info = document.getElementById("dashboardInfo");

    if (!info) return;

    const label = isAdminUser()
        ? "Panel Status Admin"
        : currentTab === "feed"
            ? "Feed Kota Silent Hill"
            : "Laporan Warga Saya";

    const startData = totalReports === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE) + 1;
    const endData = Math.min(currentPage * PAGE_SIZE, totalReports);

    info.innerHTML = `
        <i class="bi bi-circle-fill text-success me-1" style="font-size:0.5rem;vertical-align:middle;"></i>
        ${label}
        &nbsp;•&nbsp; Halaman ${currentPage} dari ${totalPages}
        &nbsp;•&nbsp; ${startData}-${endData} dari ${totalReports} data
    `;
}

function updateTabButtons() {
    const myReportBtn = document.getElementById("myReportBtn");
    const feedBtn = document.getElementById("feedBtn");

    if (!myReportBtn || !feedBtn || isAdminUser()) return;

    if (currentTab === "my_reports") {
        myReportBtn.classList.remove("btn-outline-primary");
        myReportBtn.classList.add("btn-primary");

        feedBtn.classList.remove("btn-primary");
        feedBtn.classList.add("btn-outline-primary");
        return;
    }

    feedBtn.classList.remove("btn-outline-primary");
    feedBtn.classList.add("btn-primary");

    myReportBtn.classList.remove("btn-primary");
    myReportBtn.classList.add("btn-outline-primary");
}

function showListLoading() {
    const container = document.getElementById("listContainer");

    if (!container) return;

    container.innerHTML = `
        <div class="card shadow-sm border-0">
            <div class="card-body text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Memuat laporan...
            </div>
        </div>
    `;
}

function showListError(message) {
    const container = document.getElementById("listContainer");

    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-danger d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>${escapeHTML(message)}</div>
        </div>
    `;
}

function renderList() {
    const container = document.getElementById("listContainer");

    if (!container) return;

    if (allReports.length === 0) {
        container.innerHTML = `
            <div class="card shadow-sm border-0">
                <div class="card-body text-center py-5">
                    <i class="bi bi-cloud-fog2 empty-state-icon text-secondary"></i>
                    <h5 class="mt-3 fw-bold">Belum Ada Laporan</h5>
                    <p class="text-muted mb-0">Belum ada laporan yang ditemukan pada halaman ini.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = allReports.map(function (report) {
        const statusMeta = getStatusMeta(report.status);
        const title = escapeHTML(report.title || "Tanpa Judul");
        const category = escapeHTML(report.category || "Umum");
        const location = escapeHTML(report.location || "-");
        const description = escapeHTML(report.description || "-");
        const reporter = escapeHTML(report.reporter || "Warga Anonim");
        const reportId = escapeHTML(report.id);
        const updatedAt = formatDate(report.updated_at || report.created_at);

        let actionButtons = "";

        if (isCitizenUser() && report.can_edit) {
            actionButtons += `
                <button class="btn btn-sm btn-outline-primary" onclick="editDraft(${Number(report.id)})">
                    <i class="bi bi-pencil me-1"></i>Edit Draft
                </button>
            `;
        }

        if (isCitizenUser() && report.can_submit) {
            actionButtons += `
                <button class="btn btn-sm btn-primary" onclick="submitDraft(${Number(report.id)})">
                    <i class="bi bi-send me-1"></i>Ajukan
                </button>
            `;
        }

        if (isCitizenUser() && report.can_delete) {
            actionButtons += `
                <button class="btn btn-sm btn-outline-danger" onclick="deleteDraft(${Number(report.id)})">
                    <i class="bi bi-trash me-1"></i>Hapus
                </button>
            `;
        }

        if (isAdminUser() && report.can_update_status) {
            actionButtons += getAdminStatusButton(report);
        }

        return `
            <div class="card shadow-sm mb-3 border-0 card-report">
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1 me-3">
                            <h5 class="fw-bold mb-1">${title}</h5>
                            <small class="text-muted">
                                <i class="bi bi-tag me-1"></i>${category}
                                &nbsp;|&nbsp;
                                <i class="bi bi-geo-alt me-1"></i>${location}
                            </small>
                        </div>

                        <span class="badge ${statusMeta.badgeClass} ${statusMeta.textClass}">
                            ${statusMeta.label}
                        </span>
                    </div>

                    <p class="mt-3 mb-2 text-secondary report-description">${description}</p>

                    <div class="progress mb-3" style="height:8px;" title="Progress: ${statusMeta.progress}%">
                        <div
                            class="progress-bar ${statusMeta.progressClass}"
                            role="progressbar"
                            style="width:${statusMeta.progress}%">
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <small class="text-muted">
                            <i class="bi bi-person-circle me-1"></i>${reporter}
                        </small>

                        <small class="text-muted">
                            <i class="bi bi-hash"></i>${reportId}
                            &nbsp;|&nbsp;
                            <i class="bi bi-clock me-1"></i>${updatedAt}
                        </small>
                    </div>

                    ${actionButtons ? `<div class="mt-3 d-flex flex-wrap gap-2">${actionButtons}</div>` : ""}

                </div>
            </div>
        `;
    }).join("");
}

function getAdminStatusButton(report) {
    if (report.status === "REPORTED") {
        return `
            <button class="btn btn-sm btn-primary" onclick="updateReportStatus(${Number(report.id)}, 'VERIFIED')">
                <i class="bi bi-check2-circle me-1"></i>Verifikasi
            </button>
        `;
    }

    if (report.status === "VERIFIED") {
        return `
            <button class="btn btn-sm btn-warning text-dark" onclick="updateReportStatus(${Number(report.id)}, 'IN_PROGRESS')">
                <i class="bi bi-hourglass-split me-1"></i>Proses
            </button>
        `;
    }

    if (report.status === "IN_PROGRESS") {
        return `
            <button class="btn btn-sm btn-success" onclick="updateReportStatus(${Number(report.id)}, 'RESOLVED')">
                <i class="bi bi-check-circle me-1"></i>Selesaikan
            </button>
        `;
    }

    return "";
}

async function updateReportStatus(id, status) {
    const confirmed = confirm(`Ubah status laporan menjadi ${status}?`);

    if (!confirmed) return;

    try {
        const response = await requestAPI(
            `/api/report/${id}/`,
            "PATCH",
            { status }
        );

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            return;
        }

        if (response.status === 200) {
            showToast("Status laporan berhasil diperbarui.", "success");
            await loadDashboardData(currentTab, currentPage);
            return;
        }

        showToast("Gagal memperbarui status laporan.", "danger");

    } catch (error) {
        console.error("Update status error:", error);
        showToast("Gagal terhubung ke server.", "danger");
    }
}

async function deleteDraft(id) {
    const confirmed = confirm("Hapus draft laporan ini?");

    if (!confirmed) return;

    try {
        const response = await requestAPI(`/api/report/${id}/`, "DELETE");

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            return;
        }

        if (response.status === 204) {
            showToast("Draft laporan berhasil dihapus.", "success");
            await loadDashboardData(currentTab, currentPage);
            return;
        }

        showToast("Gagal menghapus draft laporan.", "danger");

    } catch (error) {
        console.error("Delete draft error:", error);
        showToast("Gagal terhubung ke server.", "danger");
    }
}

function renderPagination() {
    const container = document.getElementById("paginationContainer");

    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = `<nav><ul class="pagination pagination-sm justify-content-center mb-0">`;

    html += `
        <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
            <button class="page-link" onclick="loadDashboardData('${currentTab}', ${currentPage - 1})">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;

    for (let page = 1; page <= totalPages; page++) {
        html += `
            <li class="page-item ${page === currentPage ? "active" : ""}">
                <button class="page-link" onclick="loadDashboardData('${currentTab}', ${page})">
                    ${page}
                </button>
            </li>
        `;
    }

    html += `
        <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
            <button class="page-link" onclick="loadDashboardData('${currentTab}', ${currentPage + 1})">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;

    html += `</ul></nav>`;
    container.innerHTML = html;
}

function clearPagination() {
    const container = document.getElementById("paginationContainer");

    if (container) {
        container.innerHTML = "";
    }
}

async function editDraft(id) {
    try {
        const response = await requestAPI(`/api/report/${id}/`, "GET");

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            return;
        }

        if (response.status !== 200) {
            throw new Error("Gagal mengambil data draft.");
        }

        const report = await parseResponseJSON(response);

        if (!report.can_edit) {
            showToast("Draft ini tidak dapat diedit.", "warning");
            return;
        }

        document.getElementById("reportTitle").value = report.title || "";
        document.getElementById("reportCategory").value = report.category || "Jalan Rusak";
        document.getElementById("reportLocation").value = report.location || "";
        document.getElementById("reportDescription").value = report.description || "";

        editingReportId = id;

        const modalLabel = document.getElementById("reportModalLabel");
        if (modalLabel) {
            modalLabel.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Edit Draft Laporan #${escapeHTML(id)}`;
        }

        openReportModal();

    } catch (error) {
        console.error("Edit draft error:", error);
        showToast("Gagal memuat data draft untuk diedit.", "danger");
    }
}

async function submitDraft(id) {
    const confirmed = confirm("Ajukan laporan ini? Setelah diajukan, laporan tidak dapat diedit sebagai draft.");

    if (!confirmed) return;

    try {
        const response = await requestAPI(
            `/api/report/${id}/`,
            "PATCH",
            { status: "REPORTED" }
        );

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            return;
        }

        if (response.status === 200) {
            showToast("Laporan berhasil diajukan.", "success");
            await loadDashboardData(currentTab, currentPage);
            return;
        }

        showToast("Gagal mengajukan laporan.", "danger");

    } catch (error) {
        console.error("Submit draft error:", error);
        showToast("Gagal terhubung ke server.", "danger");
    }
}

function setupModalForm() {
    if (modalFormInitialized) return;

    const btnDraft = document.getElementById("btnDraft");
    const btnSubmit = document.getElementById("btnSubmit");
    const reportModal = document.getElementById("reportModal");

    if (!btnDraft || !btnSubmit || !reportModal) return;

    btnDraft.addEventListener("click", async function () {
        await handleModalSubmit("DRAFT");
    });

    btnSubmit.addEventListener("click", async function () {
        await handleModalSubmit("REPORTED");
    });

    reportModal.addEventListener("hidden.bs.modal", function () {
        resetReportForm();
    });

    modalFormInitialized = true;
}

async function handleModalSubmit(status) {
    if (isSavingReport) return;

    if (isAdminUser()) {
        showToast("Admin tidak dapat membuat atau mengedit laporan.", "warning");
        return;
    }

    const title = document.getElementById("reportTitle").value.trim();
    const category = document.getElementById("reportCategory").value;
    const location = document.getElementById("reportLocation").value.trim();
    const description = document.getElementById("reportDescription").value.trim();

    if (!title || !category || !location || !description) {
        showToast("Harap isi semua field sebelum menyimpan laporan.", "warning");
        return;
    }

    const payload = {
        title,
        category,
        location,
        description,
        status
    };

    isSavingReport = true;
    setModalButtonsDisabled(true);

    try {
        let response;

        if (editingReportId === null) {
            response = await requestAPI("/api/report/", "POST", payload);
        } else {
            response = await requestAPI(`/api/report/${editingReportId}/`, "PUT", payload);
        }

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            return;
        }

        if (response.status === 201 || response.status === 200) {
            closeReportModal();

            const message = status === "DRAFT"
                ? "Draft laporan berhasil disimpan."
                : "Laporan berhasil diajukan.";

            showToast(message, "success");
            await loadDashboardData(currentTab, currentPage);
            return;
        }

        showToast("Gagal menyimpan laporan. Periksa kembali data yang diisi.", "danger");

    } catch (error) {
        console.error("Save report error:", error);
        showToast("Gagal terhubung ke server.", "danger");

    } finally {
        isSavingReport = false;
        setModalButtonsDisabled(false);
    }
}

function setModalButtonsDisabled(disabled) {
    const btnDraft = document.getElementById("btnDraft");
    const btnSubmit = document.getElementById("btnSubmit");

    if (btnDraft) btnDraft.disabled = disabled;
    if (btnSubmit) btnSubmit.disabled = disabled;
}

function openReportModal() {
    const modalEl = document.getElementById("reportModal");

    if (!modalEl) return;

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

function closeReportModal() {
    const modalEl = document.getElementById("reportModal");

    if (!modalEl) return;

    const modal = bootstrap.Modal.getInstance(modalEl);

    if (modal) {
        modal.hide();
    }
}

function resetReportForm() {
    const form = document.getElementById("reportForm");
    const modalLabel = document.getElementById("reportModalLabel");

    editingReportId = null;

    if (form) {
        form.reset();
    }

    if (modalLabel) {
        modalLabel.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Form Laporan Warga`;
    }
}

function prepareCreateReportModal() {
    if (isAdminUser()) {
        showToast("Admin tidak dapat membuat laporan.", "warning");
        return;
    }

    resetReportForm();
    openReportModal();
}

function getStatusMeta(status) {
    const statusMap = {
        DRAFT: {
            label: "Draft",
            progress: 25,
            badgeClass: "bg-secondary",
            progressClass: "bg-secondary",
            textClass: "text-white"
        },
        REPORTED: {
            label: "Diajukan",
            progress: 50,
            badgeClass: "bg-warning",
            progressClass: "bg-warning",
            textClass: "text-dark"
        },
        VERIFIED: {
            label: "Diverifikasi",
            progress: 75,
            badgeClass: "bg-info",
            progressClass: "bg-info",
            textClass: "text-white"
        },
        IN_PROGRESS: {
            label: "Diproses",
            progress: 90,
            badgeClass: "bg-primary",
            progressClass: "bg-primary",
            textClass: "text-white"
        },
        RESOLVED: {
            label: "Selesai",
            progress: 100,
            badgeClass: "bg-success",
            progressClass: "bg-success",
            textClass: "text-white"
        }
    };

    return statusMap[status] || {
        label: status || "Unknown",
        progress: 0,
        badgeClass: "bg-dark",
        progressClass: "bg-dark",
        textClass: "text-white"
    };
}

function formatDate(isoString) {
    if (!isoString) return "-";

    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function setText(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function showToast(message, type = "primary") {
    const toastEl = document.getElementById("appToast");
    const toastMessage = document.getElementById("appToastMessage");

    if (!toastEl || !toastMessage || typeof bootstrap === "undefined") {
        alert(message);
        return;
    }

    const colorMap = {
        primary: "text-bg-primary",
        success: "text-bg-success",
        danger: "text-bg-danger",
        warning: "text-bg-warning",
        info: "text-bg-info",
        secondary: "text-bg-secondary"
    };

    toastEl.className = "toast align-items-center border-0";
    toastEl.classList.add(colorMap[type] || colorMap.primary);

    toastMessage.textContent = message;

    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, {
        delay: 2600
    });

    toast.show();
}