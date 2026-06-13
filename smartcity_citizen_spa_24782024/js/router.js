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
    const username = escapeHTML(getCurrentUsername());
    const roleLabel = isAdmin ? "Admin" : "Citizen";

    return `
        <div class="row g-3 dashboard-layout">

            <aside class="col-12 col-xl-3 col-lg-3 dashboard-sidebar">
                <div class="card shadow-sm border-0 mb-3 sidebar-user-card">
                    <div class="card-body">
                        <div class="d-flex align-items-center gap-3">
                            <div class="user-avatar">
                                <i class="bi bi-person-fill"></i>
                            </div>
                            <div class="min-w-0">
                                <small class="text-muted d-block">Masuk sebagai</small>
                                <h6 class="mb-1 fw-bold text-truncate">${username}</h6>
                                <span class="badge bg-secondary role-badge">${roleLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm border-0 mb-3 sidebar-menu-card">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3 sidebar-title">
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

                <div class="card shadow-sm border-0 summary-panel-card">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3 sidebar-title">
                            <i class="bi bi-bar-chart me-2"></i>Ringkasan Status
                        </h5>

                        <hr class="mt-0">

                        <div class="summary-row">
                            <span><i class="bi bi-pencil text-secondary me-1"></i>Draft</span>
                            <span id="draftCount" class="badge bg-secondary fs-6 status-badge">0</span>
                        </div>

                        <div class="summary-row">
                            <span><i class="bi bi-hourglass-split text-warning me-1"></i>Diproses</span>
                            <span id="reportedCount" class="badge bg-warning text-dark fs-6 status-badge">0</span>
                        </div>

                        <div class="summary-row mb-0">
                            <span><i class="bi bi-check-circle text-success me-1"></i>Selesai</span>
                            <span id="resolvedCount" class="badge bg-success fs-6 status-badge">0</span>
                        </div>
                    </div>
                </div>
            </aside>

            <section class="col-12 col-xl-6 col-lg-6 dashboard-main">
                <div class="card shadow-sm border-0 mb-3 dashboard-hero-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start dashboard-header gap-3">
                            <div>
                                <span class="hero-kicker">Silent Hill Services</span>
                                <h4 class="mb-1 fw-bold">Citizen Report Center</h4>
                                <small id="dashboardInfo" class="text-muted">
                                    Sistem pelaporan warga berbasis REST API
                                </small>
                            </div>

                            ${
                                isAdmin
                                    ? ``
                                    : `
                                        <button id="btnOpenModal" class="btn btn-success hero-action-btn">
                                            <i class="bi bi-plus-circle me-2"></i>Tambah Laporan
                                        </button>
                                    `
                            }
                        </div>

                        <div class="hero-stat-grid mt-3">
                            <div class="hero-stat-card total">
                                <span>Total</span>
                                <strong id="totalCountHero">0</strong>
                            </div>
                            <div class="hero-stat-card draft">
                                <span>Draft</span>
                                <strong id="draftCountHero">0</strong>
                            </div>
                            <div class="hero-stat-card process">
                                <span>Diproses</span>
                                <strong id="reportedCountHero">0</strong>
                            </div>
                            <div class="hero-stat-card done">
                                <span>Selesai</span>
                                <strong id="resolvedCountHero">0</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm border-0 mb-3 feat-filter-card" id="featSearchFilterPanel">
                    <div class="card-body py-3">
                        <div class="row g-2 align-items-end">
                            <div class="col-12 col-md-7">
                                <label for="featSearchInput" class="form-label fw-semibold mb-1">
                                    <i class="bi bi-search me-1"></i>Cari Laporan
                                </label>

                                <div class="feat-search-wrap">
                                    <i class="bi bi-search feat-search-icon"></i>

                                    <input
                                        type="text"
                                        id="featSearchInput"
                                        class="form-control feat-search-input"
                                        placeholder="Cari judul, lokasi, kategori, atau deskripsi..."
                                        autocomplete="off">

                                    <button
                                        type="button"
                                        id="featClearSearchBtn"
                                        class="feat-clear-search"
                                        aria-label="Hapus pencarian">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="col-12 col-md-5">
                                <label for="featStatusFilter" class="form-label fw-semibold mb-1">
                                    <i class="bi bi-funnel me-1"></i>Filter Status
                                </label>

                                <select id="featStatusFilter" class="form-select feat-status-filter">
                                    <option value="ALL">Semua Status</option>
                                    <option value="DRAFT">Draft</option>
                                    <option value="REPORTED">Reported</option>
                                    <option value="VERIFIED">Verified</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved</option>
                                </select>
                            </div>
                        </div>

                        <small id="featFilterCounter" class="feat-filter-counter">
                            Menampilkan 0 dari 0 laporan
                        </small>
                    </div>
                </div>

                <div id="listContainer">
                    <div class="card shadow-sm border-0 skeleton-card">
                        <div class="card-body">
                            <div class="skeleton-line w-50"></div>
                            <div class="skeleton-line w-75"></div>
                            <div class="skeleton-line w-100"></div>
                        </div>
                    </div>
                </div>

                <div id="paginationContainer" class="mt-3"></div>
            </section>

            <aside class="col-12 col-xl-3 col-lg-3 dashboard-aside">
                <div class="card shadow-sm border-0 mb-3 status-guide-card">
                    <div class="card-body">
                        <h5 class="fw-bold mb-2 sidebar-title">
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

                        <div class="progress-guide small">
                            <div><span class="badge bg-secondary me-2">DRAFT</span>25% – Belum diajukan</div>
                            <div><span class="badge bg-warning text-dark me-2">REPORTED</span>50% – Menunggu</div>
                            <div><span class="badge bg-info me-2">VERIFIED</span>75% – Diverifikasi</div>
                            <div><span class="badge bg-primary me-2">IN_PROGRESS</span>90% – Diproses</div>
                            <div><span class="badge bg-success me-2">RESOLVED</span>100% – Selesai</div>
                        </div>
                    </div>
                </div>

                <div class="card shadow-sm border-0 rule-card">
                    <div class="card-body">
                        <h6 class="fw-bold mb-2 sidebar-title">
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