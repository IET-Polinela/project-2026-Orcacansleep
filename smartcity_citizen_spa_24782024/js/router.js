const routes = {

    '#login': `
        <div class="row justify-content-center mt-5">
            <div class="col-lg-4 col-md-6">
                <div class="card shadow border-0">
                    <div class="card-header bg-primary text-white text-center py-4">
                        <i class="bi bi-buildings-fill fs-2"></i>
                        <h4 class="mb-0 mt-2 fw-bold">Silent Hill Citizen Portal</h4>
                        <small class="opacity-75">Sistem Pelaporan Warga</small>
                    </div>
                    <div class="card-body p-4">
                        <form id="loginForm">
                            <div class="mb-3">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-person me-1"></i>Username
                                </label>
                                <input
                                    type="text"
                                    id="loginUsername"
                                    class="form-control form-control-lg"
                                    placeholder="Masukkan username"
                                    required>
                            </div>
                            <div class="mb-4">
                                <label class="form-label fw-semibold">
                                    <i class="bi bi-lock me-1"></i>Password
                                </label>
                                <input
                                    type="password"
                                    id="loginPassword"
                                    class="form-control form-control-lg"
                                    placeholder="Masukkan password"
                                    required>
                            </div>
                            <button
                                type="submit"
                                class="btn btn-primary btn-lg w-100">
                                <i class="bi bi-box-arrow-in-right me-2"></i>Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,

    '#dashboard': `
        <div class="row g-3">

            <!-- Sidebar Kiri -->
            <aside class="col-12 col-lg-3">

                <div class="card shadow-sm border-0 mb-3">
                    <div class="card-body">
                        <h5 class="fw-bold mb-3">
                            <i class="bi bi-list-ul me-2"></i>Menu
                        </h5>
                        <div class="d-grid gap-2">
                            <button id="myReportBtn" class="btn btn-primary">
                                <i class="bi bi-file-earmark-text me-2"></i>Laporan Saya
                            </button>
                            <button id="feedBtn" class="btn btn-outline-primary">
                                <i class="bi bi-broadcast me-2"></i>Feed Kota
                            </button>
                            <button id="logoutBtn" class="btn btn-outline-danger">
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
                            <span id="draftCount" class="badge bg-secondary fs-6">0</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span><i class="bi bi-hourglass-split text-warning me-1"></i>Diproses</span>
                            <span id="reportedCount" class="badge bg-warning text-dark fs-6">0</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-check-circle text-success me-1"></i>Selesai</span>
                            <span id="resolvedCount" class="badge bg-success fs-6">0</span>
                        </div>
                    </div>
                </div>

            </aside>

            <!-- Konten Utama -->
            <section class="col-12 col-lg-6">

                <div class="card shadow-sm border-0 mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 class="mb-1 fw-bold">Silent Hill Citizen Portal</h4>
                                <small id="dashboardInfo" class="text-muted">
                                    Sistem pelaporan warga berbasis REST API
                                </small>
                            </div>
                            <button id="btnOpenModal" class="btn btn-success">
                                <i class="bi bi-plus-circle me-2"></i>Tambah Laporan
                            </button>
                        </div>
                    </div>
                </div>

                <div id="listContainer">
                    <div class="text-center py-5 text-muted">
                        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                        Memuat laporan...
                    </div>
                </div>

                <div id="paginationContainer" class="mt-3"></div>

            </section>

            <!-- Sidebar Kanan -->
            <aside class="col-12 col-lg-3">

                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <h5 class="fw-bold mb-2">
                            <i class="bi bi-info-circle me-2"></i>Status Sistem
                        </h5>
                        <p class="text-muted mb-3 small">
                            Pantau laporan warga dan perkembangan penanganan secara realtime.
                        </p>
                        <hr>
                        <h6 class="fw-semibold mb-2">Keterangan Progress</h6>
                        <div class="small">
                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-secondary me-2">DRAFT</span>25% – Belum diajukan
                            </div>
                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-warning text-dark me-2">REPORTED</span>50% – Menunggu
                            </div>
                            <div class="d-flex align-items-center mb-1">
                                <span class="badge bg-info me-2">VERIFIED</span>75% – Diverifikasi
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-success me-2">RESOLVED</span>100% – Selesai
                            </div>
                        </div>
                    </div>
                </div>

            </aside>

        </div>
    `

};

// ============================================================
// SETUP LOGOUT BUTTON
// ============================================================
function setupLogoutButton() {

    const logoutBtn = document.getElementById("logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", function () {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");

        window.location.hash = "#login";

    });

}

// ============================================================
// SETUP DASHBOARD BUTTONS (tab, modal trigger)
// ============================================================
function setupDashboardButtons() {

    // Tombol buka modal tambah laporan baru
    const modalBtn = document.getElementById("btnOpenModal");

    if (modalBtn) {
        modalBtn.addEventListener("click", function () {

            // Pastikan mode edit di-reset saat buka modal untuk laporan baru
            editingReportId = null;

            const modalLabel = document.getElementById("reportModalLabel");
            if (modalLabel) {
                modalLabel.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Form Laporan Warga`;
            }

            document.getElementById("reportForm").reset();

            const modal = new bootstrap.Modal(
                document.getElementById("reportModal")
            );
            modal.show();

        });
    }

    // Tombol tab Laporan Saya
    const myReportBtn = document.getElementById("myReportBtn");

    if (myReportBtn) {
        myReportBtn.addEventListener("click", function () {
            if (typeof loadDashboardData === "function") {
                loadDashboardData("my_reports", 1);
            }
        });
    }

    // Tombol tab Feed Kota
    const feedBtn = document.getElementById("feedBtn");

    if (feedBtn) {
        feedBtn.addEventListener("click", function () {
            if (typeof loadDashboardData === "function") {
                loadDashboardData("feed", 1);
            }
        });
    }

    // Setup event listener tombol modal form (Step 5)
    if (typeof setupModalForm === "function") {
        setupModalForm();
    }

}

// ============================================================
// ROUTING UTAMA
// ============================================================
function handleRouting() {

    const hash = window.location.hash || "#login";

    // Cek proteksi: jika bukan di halaman login, pastikan token ada
    if (hash !== "#login") {
        const token = localStorage.getItem("access_token");
        if (!token) {
            window.location.hash = "#login";
            return;
        }
    }

    document.getElementById("app-content").innerHTML =
        routes[hash] || routes["#login"];

    // Update navbar info user
    updateNavbar(hash);

    if (hash === "#login" && typeof setupLoginForm === "function") {
        setupLoginForm();
    }

    if (hash === "#dashboard") {
        setupLogoutButton();
        setupDashboardButtons();

        if (typeof loadDashboardData === "function") {
            loadDashboardData("my_reports", 1);
        }
    }

}

// Tampilkan username di navbar saat login
function updateNavbar(hash) {

    const navMenu = document.getElementById("nav-menu");

    if (!navMenu) return;

    if (hash === "#dashboard") {
        const username = localStorage.getItem("username") || "Warga";
        navMenu.innerHTML = `
            <span class="navbar-text text-white">
                <i class="bi bi-person-check-fill me-1"></i>${username}
            </span>
        `;
    } else {
        navMenu.innerHTML = "";
    }

}

window.addEventListener("hashchange", handleRouting);
window.addEventListener("DOMContentLoaded", handleRouting);