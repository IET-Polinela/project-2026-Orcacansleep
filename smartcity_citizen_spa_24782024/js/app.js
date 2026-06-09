// ============================================================
// STATE GLOBAL
// ============================================================
let currentTab   = "my_reports";
let currentPage  = 1;
let allReports   = [];
let totalPages   = 1;

// Step 5 – variabel global untuk tracking mode edit/create
let editingReportId = null;

// ============================================================
// STEP 3 – Fetching Paginated List & Render Progress Bar
// ============================================================
async function loadDashboardData(
    tab  = currentTab,
    page = currentPage
) {

    currentTab  = tab;
    currentPage = page;

    // Perbarui state tombol sidebar agar aktif sesuai tab
    const myReportBtn = document.getElementById("myReportBtn");
    const feedBtn     = document.getElementById("feedBtn");

    if (myReportBtn && feedBtn) {
        if (tab === "my_reports") {
            myReportBtn.classList.replace("btn-outline-primary", "btn-primary");
            feedBtn.classList.replace("btn-primary", "btn-outline-primary");
        } else {
            feedBtn.classList.replace("btn-outline-primary", "btn-primary");
            myReportBtn.classList.replace("btn-primary", "btn-outline-primary");
        }
    }

    try {

        // Tembak endpoint dengan parameter tab dan halaman
        const response = await requestAPI(
            `/api/report/?tab=${tab}&page=${page}`,
            "GET"
        );

        if (response.status !== 200) {
            throw new Error("API Error");
        }

        // INSTRUKSI 1: Ekstraksi Data Paginasi (Destructuring)
        // 1. Simpan array laporan ke variabel global allReports
        // 2. Ambil total jumlah data dari response.data.count (default 0)
        // 3. Hitung totalPages dengan membagi total data dengan 10
        const data = await response.json();

        allReports = data.results || [];

        totalPages = Math.ceil(
            (data.count || 0) / 10
        );

        // INSTRUKSI 2: Pemicu Pembaruan UI (Sinkronisasi Antarmuka)
        // Panggil 2 fungsi secara berurutan agar layar langsung diperbarui
        renderList();
        renderPagination();

        // Step 4 – Kalkulasi Rekap Status di Sidebar
        loadSummaryStats();

        updateDashboardInfo();

    } catch (error) {

        console.error(error);

        const listContainer =
            document.getElementById("listContainer");

        if (listContainer) {
            listContainer.innerHTML = `
                <div class="alert alert-danger d-flex align-items-center gap-2">
                    <i class="bi bi-exclamation-triangle-fill fs-5"></i>
                    <div>Gagal memuat data laporan. Pastikan server berjalan dan token masih valid.</div>
                </div>
            `;
        }

        const paginationContainer =
            document.getElementById("paginationContainer");

        if (paginationContainer) {
            paginationContainer.innerHTML = "";
        }

    }

}

// ============================================================
// STEP 4 – Kalkulasi Rekap Status di Sidebar
// Menggunakan trik Bypass Pagination dengan page_size besar
// ============================================================
async function loadSummaryStats() {

    try {

        const response = await requestAPI(
            "/api/report/?tab=my_reports&page_size=1000",
            "GET"
        );

        if (response.status !== 200) {
            throw new Error("Gagal mengambil data statistik");
        }

        const data = await response.json();

        const reports = data.results || [];

        // Gunakan .filter().length untuk menghitung masing-masing status
        const draft = reports.filter(
            report => report.status === "DRAFT"
        ).length;

        const processed = reports.filter(
            report =>
                report.status === "REPORTED" ||
                report.status === "VERIFIED"
        ).length;

        const resolved = reports.filter(
            report => report.status === "RESOLVED"
        ).length;

        const draftCount    = document.getElementById("draftCount");
        const reportedCount = document.getElementById("reportedCount");
        const resolvedCount = document.getElementById("resolvedCount");

        if (draftCount)    draftCount.textContent    = draft;
        if (reportedCount) reportedCount.textContent = processed;
        if (resolvedCount) resolvedCount.textContent = resolved;

    } catch (error) {

        console.error("Summary Error:", error);

    }

}

// ============================================================
// UPDATE INFO HEADER DASHBOARD
// ============================================================
function updateDashboardInfo() {

    const info = document.getElementById("dashboardInfo");

    if (!info) return;

    info.innerHTML = `
        <i class="bi bi-circle-fill text-success me-1" style="font-size:0.5rem;vertical-align:middle;"></i>
        ${currentTab === "feed" ? "Feed Kota Silent Hill" : "Laporan Warga Saya"}
        &nbsp;•&nbsp; Halaman ${currentPage}
        &nbsp;•&nbsp; ${allReports.length} data ditampilkan
    `;

}

// ============================================================
// RENDER LIST – Mengubah array JSON menjadi Bootstrap Cards
// ============================================================
function renderList() {

    const container = document.getElementById("listContainer");

    if (!container) return;

    if (allReports.length === 0) {

        container.innerHTML = `
            <div class="card shadow-sm border-0">
                <div class="card-body text-center py-5">
                    <i class="bi bi-cloud-fog2 fs-1 text-secondary"></i>
                    <h5 class="mt-3">Silent Hill Masih Sepi...</h5>
                    <p class="text-muted mb-0">Belum ada laporan yang ditemukan.</p>
                </div>
            </div>
        `;

        return;

    }

    container.innerHTML = allReports.map(report => {

        // Tentukan progress bar dan badge berdasarkan status laporan
        let progress      = 25;
        let badge         = "secondary";
        let progressClass = "bg-secondary";
        let statusLabel   = report.status;

        if (report.status === "REPORTED") {
            progress      = 50;
            badge         = "warning";
            progressClass = "bg-warning";
            statusLabel   = "Diajukan";
        }

        if (report.status === "VERIFIED") {
            progress      = 75;
            badge         = "info";
            progressClass = "bg-info";
            statusLabel   = "Diverifikasi";
        }

        if (report.status === "RESOLVED") {
            progress      = 100;
            badge         = "success";
            progressClass = "bg-success";
            statusLabel   = "Selesai";
        }

        if (report.status === "DRAFT") {
            statusLabel = "Draft";
        }

        // Tombol aksi: hanya tampil pada laporan milik sendiri yang berstatus DRAFT
        // Sesuai aturan bisnis: DRAFT bisa diedit/diajukan, REPORTED ke atas tidak bisa diubah
        const isDraft = report.status === "DRAFT";
        const isOwner = report.is_owner === true || currentTab === "my_reports";

        const actionButtons = (isDraft && isOwner) ? `
            <div class="mt-3 d-flex gap-2">
                <button
                    class="btn btn-sm btn-outline-primary"
                    onclick="editDraft(${report.id})">
                    <i class="bi bi-pencil me-1"></i>Edit Draft
                </button>
                <button
                    class="btn btn-sm btn-primary"
                    onclick="submitDraft(${report.id})">
                    <i class="bi bi-send me-1"></i>Ajukan
                </button>
            </div>
        ` : "";

        // Pada tab Feed, nama pelapor sudah disamarkan menjadi "Warga Anonim" dari sisi serializer
        const reporterDisplay = report.reporter || "Warga Anonim";

        return `
            <div class="card shadow-sm mb-3 border-0 card-report">
                <div class="card-body">

                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1 me-2">
                            <h5 class="fw-bold mb-1">${report.title}</h5>
                            <small class="text-muted">
                                <i class="bi bi-tag me-1"></i>${report.category || "Umum"}
                                &nbsp;|&nbsp;
                                <i class="bi bi-geo-alt me-1"></i>${report.location}
                            </small>
                        </div>
                        <span class="badge bg-${badge} text-${badge === 'warning' ? 'dark' : 'white'} align-self-start">
                            ${statusLabel}
                        </span>
                    </div>

                    <p class="mt-3 mb-2 text-secondary">${report.description}</p>

                    <!-- Progress Bar Interaktif -->
                    <div class="progress mb-3" style="height:8px;" title="Progress: ${progress}%">
                        <div
                            class="progress-bar ${progressClass}"
                            role="progressbar"
                            style="width:${progress}%"
                            aria-valuenow="${progress}"
                            aria-valuemin="0"
                            aria-valuemax="100">
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="bi bi-person-circle me-1"></i>${reporterDisplay}
                        </small>
                        <small class="text-muted">
                            <i class="bi bi-hash"></i>${report.id}
                            &nbsp;|&nbsp;
                            <i class="bi bi-clock me-1"></i>${formatDate(report.updated_at)}
                        </small>
                    </div>

                    ${actionButtons}

                </div>
            </div>
        `;

    }).join("");

}

// ============================================================
// RENDER PAGINATION
// ============================================================
function renderPagination() {

    const container = document.getElementById("paginationContainer");

    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = `<nav><ul class="pagination pagination-sm justify-content-center mb-0">`;

    // Tombol Previous
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="loadDashboardData('${currentTab}', ${currentPage - 1})">
                <i class="bi bi-chevron-left"></i>
            </button>
        </li>
    `;

    for (let page = 1; page <= totalPages; page++) {
        html += `
            <li class="page-item ${page === currentPage ? 'active' : ''}">
                <button
                    class="page-link"
                    onclick="loadDashboardData('${currentTab}', ${page})">
                    ${page}
                </button>
            </li>
        `;
    }

    // Tombol Next
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="loadDashboardData('${currentTab}', ${currentPage + 1})">
                <i class="bi bi-chevron-right"></i>
            </button>
        </li>
    `;

    html += `</ul></nav>`;

    container.innerHTML = html;

}

// ============================================================
// STEP 5 – Report Management via Modal Form
// ============================================================

// Fungsi edit draft: ambil data lama, isi ke form modal, tampilkan modal
async function editDraft(id) {

    try {

        const response = await requestAPI(`/api/report/${id}/`, "GET");

        if (response.status !== 200) {
            throw new Error("Gagal mengambil data laporan");
        }

        const report = await response.json();

        // Isi field form modal dengan data laporan lama
        document.getElementById("reportTitle").value       = report.title       || "";
        document.getElementById("reportCategory").value    = report.category    || "Jalan Rusak";
        document.getElementById("reportLocation").value    = report.location    || "";
        document.getElementById("reportDescription").value = report.description || "";

        // Set ID laporan yang sedang diedit
        editingReportId = id;

        // Update label modal agar jelas ini mode edit
        const modalLabel = document.getElementById("reportModalLabel");
        if (modalLabel) {
            modalLabel.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Edit Draft Laporan #${id}`;
        }

        // Tampilkan modal
        const modal = new bootstrap.Modal(
            document.getElementById("reportModal")
        );
        modal.show();

    } catch (error) {

        console.error(error);
        alert("Gagal memuat data draft untuk diedit.");

    }

}

// Fungsi untuk mengajukan draft secara langsung dari kartu (tanpa buka modal)
async function submitDraft(id) {

    if (!confirm("Ajukan laporan ini? Status akan berubah menjadi REPORTED.")) return;

    try {

        const response = await requestAPI(
            `/api/report/${id}/`,
            "PATCH",
            { status: "REPORTED" }
        );

        if (response.status === 200) {
            loadDashboardData(currentTab, currentPage);
        } else {
            alert("Gagal mengajukan laporan.");
        }

    } catch (error) {

        console.error(error);
        alert("Gagal terhubung ke server.");

    }

}

// Setup event listener tombol Simpan Draft dan Ajukan di dalam modal
function setupModalForm() {

    const btnDraft  = document.getElementById("btnDraft");
    const btnSubmit = document.getElementById("btnSubmit");

    if (!btnDraft || !btnSubmit) return;

    // Tombol Simpan Draft – simpan dengan status DRAFT
    btnDraft.addEventListener("click", async function () {
        await handleModalSubmit("DRAFT");
    });

    // Tombol Ajukan – simpan dengan status REPORTED
    btnSubmit.addEventListener("click", async function () {
        await handleModalSubmit("REPORTED");
    });

    // Reset state editingReportId dan form ketika modal ditutup
    const reportModal = document.getElementById("reportModal");
    if (reportModal) {
        reportModal.addEventListener("hidden.bs.modal", function () {
            editingReportId = null;
            document.getElementById("reportForm").reset();
            const modalLabel = document.getElementById("reportModalLabel");
            if (modalLabel) {
                modalLabel.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Form Laporan Warga`;
            }
        });
    }

}

// Fungsi inti submit modal: menentukan POST atau PUT berdasarkan editingReportId
async function handleModalSubmit(status) {

    const title       = document.getElementById("reportTitle").value.trim();
    const category    = document.getElementById("reportCategory").value;
    const location    = document.getElementById("reportLocation").value.trim();
    const description = document.getElementById("reportDescription").value.trim();

    if (!title || !location || !description) {
        alert("Harap isi semua field sebelum menyimpan.");
        return;
    }

    const payload = { title, category, location, description, status };

    try {

        let response;

        if (editingReportId === null) {

            // CREATE – laporan baru (POST)
            response = await requestAPI("/api/report/", "POST", payload);

        } else {

            // UPDATE – edit draft lama (PUT)
            response = await requestAPI(
                `/api/report/${editingReportId}/`,
                "PUT",
                payload
            );

        }

        // Jika server membalas 201 Created (POST) atau 200 OK (PUT)
        if (response.status === 201 || response.status === 200) {

            // Tutup modal
            const modalEl    = document.getElementById("reportModal");
            const modalInst  = bootstrap.Modal.getInstance(modalEl);
            if (modalInst) modalInst.hide();

            // Reset form dan state
            document.getElementById("reportForm").reset();
            editingReportId = null;

            // Muat ulang data terbaru tanpa reload halaman
            loadDashboardData(currentTab, currentPage);

        } else {

            const errData = await response.json().catch(() => ({}));
            console.error("Server error:", errData);
            alert("Gagal menyimpan laporan. Periksa data yang diisi.");

        }

    } catch (error) {

        console.error(error);
        alert("Gagal terhubung ke server.");

    }

}

// ============================================================
// HELPER – Format tanggal ISO menjadi tampilan lokal
// ============================================================
function formatDate(isoString) {

    if (!isoString) return "-";

    const date = new Date(isoString);

    return date.toLocaleDateString("id-ID", {
        day:   "2-digit",
        month: "short",
        year:  "numeric"
    });

}