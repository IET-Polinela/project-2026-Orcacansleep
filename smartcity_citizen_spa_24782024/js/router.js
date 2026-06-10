function getLoginRoute() {
    return `
        <div class="row justify-content-center mt-5">
            <div class="col-lg-4 col-md-6">
                <div class="card shadow border-0 auth-card">
                    <div class="card-header bg-primary text-white text-center py-4">
                        <i class="bi bi-buildings-fill fs-2"></i>
                        <h4 class="mb-0 mt-2 fw-bold">Silent Hill Citizen Portal</h4>
                        <small class="opacity-75">Sistem Pelaporan Warga</small>
                    </div>

                    <div class="card-body p-4">
                        <form id="loginForm">
                            <div class="mb-3">
                                <label for="loginUsername" class="form-label fw-semibold">
                                    <i class="bi bi-person me-1"></i>Username
                                </label>
                                <input
                                    type="text"
                                    id="loginUsername"
                                    class="form-control form-control-lg"
                                    placeholder="Masukkan username"
                                    autocomplete="username"
                                    required>
                            </div>

                            <div class="mb-4">
                                <label for="loginPassword" class="form-label fw-semibold">
                                    <i class="bi bi-lock me-1"></i>Password
                                </label>
                                <input
                                    type="password"
                                    id="loginPassword"
                                    class="form-control form-control-lg"
                                    placeholder="Masukkan password"
                                    autocomplete="current-password"
                                    required>
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg w-100">
                                <i class="bi bi-box-arrow-in-right me-2"></i>Login
                            </button>
                        </form>
                    </div>
                </div>

                <p class="text-center text-muted text-small mt-3">
                    Portal pelaporan warga Silent Hill berbasis REST API.
                </p>
            </div>
        </div>
    `;
}

function getDashboardRoute() {
    const isAdmin = isAdminUser();

    return `
        <div class="row g-3">

            <aside class="col-12 col-lg-3">
                <div class="card shadow-sm border-0 mb-3">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">
                            <i class="bi bi-list-ul me-2"></i>Menu
                        </h5>

                        <div class="d-grid gap-2">
                            ${
                                isAdmin
                                    ? `
                                        <button id="adminReportBtn" class="btn btn-primary menu-button">
                                            <i class="bi bi-shield-check me-2"></i>Laporan Masuk
                                        </button>
                                    `
                                    : `
                                        <button id="myReportBtn" class="btn btn-primary menu-button">
                                            <i class="bi bi-file-earmark-text me-2"></i>Laporan Saya
                                        </button>

                                        <button id="feedBtn" class="btn btn-outline-primary menu-button">
                                            <i class="bi bi-broadcast me-2"></i>Feed Kota
                                        </button>
                                    `
                            }

                            <button id="refreshBtn" class="btn btn-outline-secondary menu-button">
                                <i class="bi bi-arrow-clockwise me-2"></i>Muat Ulang
                            </button>

                            <button id="logoutBtn" class="btn btn-outline-danger menu-button">
                                <i class="bi bi-box-arrow-right me-2"></i>Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">
                            <i class="bi bi-bar-chart me-2"></i>Ringkasan Status
                        </h5>

                        <hr class="mt-0">

                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span><i class="bi bi-pencil text-secondary me-1"></i>Draft</span>
                            <span id="draftCount" class="badge bg-secondary fs-6 status-badge">0</span>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span><i class="bi bi-hourglass-split text-warning me-1"></i>Diproses</span>
                            <span id="reportedCount" class="badge bg-warning text-dark fs-6 status-badge">0</span>
                        </div>

                        <div class="d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-check-circle text-success me-1"></i>Selesai</span>
                            <span id="resolvedCount" class="badge bg-success fs-6 status-badge">0</span>
                        </div>
                    </div>
                </div>
            </aside>

            <section class="col-12 col-lg-6">
                <div class="card shadow-sm border-0 mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center dashboard-header">
                            <div>
                                <h4 class="mb-1 fw-bold">Silent Hill Citizen Portal</h4>
                                <small id="dashboardInfo" class="text-muted">
                                    Sistem pelaporan warga berbasis REST API
                                </small>
                            </div>

                            ${
                                isAdmin
                                    ? ``
                                    : `
                                        <button id="btnOpenModal" class="btn btn-success">
                                            <i class="bi bi-plus-circle me-2"></i>Tambah Laporan
                                        </button>
                                    `
                            }
                        </div>
                    </div>
                </div>

                <div id="listContainer">
                    <div class="card shadow-sm border-0">
                        <div class="card-body text-center py-5 text-muted">
                            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                            Memuat laporan...
                        </div>
                    </div>
                </div>

                <div id="paginationContainer" class="mt-3"></div>
            </section>

            <aside class="col-12 col-lg-3">
                <div class="card shadow-sm border-0 mb-3">
                    <div class="card-body">
                        <h5 class="fw-bold mb-2">
                            <i class="bi bi-info-circle me-2"></i>Status Sistem
                        </h5>

                        <p class="text-muted mb-3 small">
                            ${
                                isAdmin
                                    ? "Admin hanya dapat mengubah status laporan yang sudah diajukan."
                                    : "Pantau laporan warga dan perkembangan penanganan secara realtime."
                            }
                        </p>

                        <hr>

                        <h6 class="fw-semibold mb-2">Keterangan Progress</h6>

                        <div class="small">
                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-secondary me-2">DRAFT</span>
                                25% – Belum diajukan
                            </div>

                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-warning text-dark me-2">REPORTED</span>
                                50% – Menunggu
                            </div>

                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-info me-2">VERIFIED</span>
                                75% – Diverifikasi
                            </div>

                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-primary me-2">IN_PROGRESS</span>
                                90% – Diproses
                            </div>

                            <div class="d-flex align-items-center">
                                <span class="badge bg-success me-2">RESOLVED</span>
                                100% – Selesai
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <h6 class="fw-bold mb-2">
                            <i class="bi bi-shield-check me-2"></i>Aturan Laporan
                        </h6>

                        <ul class="small text-muted mb-0 ps-3">
                            ${
                                isAdmin
                                    ? `
                                        <li>Admin tidak dapat tambah laporan.</li>
                                        <li>Admin tidak dapat edit atau hapus laporan.</li>
                                        <li>Admin hanya mengubah status laporan.</li>
                                    `
                                    : `
                                        <li>Draft masih dapat diedit.</li>
                                        <li>Draft milik sendiri dapat dihapus.</li>
                                        <li>Feed kota menampilkan laporan publik.</li>
                                    `
                            }
                        </ul>
                    </div>
                </div>
            </aside>

        </div>
    `;
}

function handleRouting() {
    const hash = window.location.hash || "#login";

    if (hash !== "#login" && !isAuthenticated()) {
        window.location.hash = "#login";
        return;
    }

    if (hash === "#login" && isAuthenticated()) {
        window.location.hash = "#dashboard";
        return;
    }

    const appContent = document.getElementById("app-content");

    if (!appContent) return;

    if (hash === "#dashboard") {
        appContent.innerHTML = getDashboardRoute();
    } else {
        appContent.innerHTML = getLoginRoute();
    }

    updateNavbar(hash);

    if (hash === "#login") {
        setupLoginForm();
        setupLoginNotice();
        return;
    }

    if (hash === "#dashboard") {
        setupDashboardPage();
    }
}

function setupDashboardPage() {
    setupLogoutButton();
    setupDashboardButtons();

    if (typeof loadDashboardData === "function") {
        loadDashboardData(isAdminUser() ? "admin_reports" : "my_reports", 1);
    }
}

function setupLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", function () {
        logoutUser();
    });
}

function setupDashboardButtons() {
    const modalBtn = document.getElementById("btnOpenModal");
    const myReportBtn = document.getElementById("myReportBtn");
    const feedBtn = document.getElementById("feedBtn");
    const refreshBtn = document.getElementById("refreshBtn");

    if (modalBtn) {
        modalBtn.addEventListener("click", function () {
            prepareCreateReportModal();
        });
    }

    if (myReportBtn) {
        myReportBtn.addEventListener("click", function () {
            loadDashboardData("my_reports", 1);
        });
    }

    if (feedBtn) {
        feedBtn.addEventListener("click", function () {
            loadDashboardData("feed", 1);
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
            loadDashboardData(currentTab, currentPage);
            showToast("Data dashboard dimuat ulang.", "info");
        });
    }

    setupModalForm();
}

function updateNavbar(hash) {
    const navMenu = document.getElementById("nav-menu");

    if (!navMenu) return;

    if (hash === "#dashboard") {
        const username = getCurrentUsername();
        const roleLabel = isAdminUser() ? "Admin" : "Citizen";

        navMenu.innerHTML = `
            <span class="navbar-text text-white">
                <i class="bi bi-person-check-fill me-1"></i>${escapeHTML(username)}
                <span class="badge bg-secondary ms-2">${roleLabel}</span>
            </span>
        `;

        return;
    }

    navMenu.innerHTML = "";
}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);