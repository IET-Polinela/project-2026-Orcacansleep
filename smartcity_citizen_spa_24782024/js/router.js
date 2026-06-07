const routes = {

    '#login': `
        <div class="row justify-content-center mt-5">

            <div class="col-lg-4">

                <div class="card shadow">

                    <div class="card-body">

                        <h3 class="text-center mb-4">
                            Login Warga
                        </h3>

                        <form id="loginForm">

                            <div class="mb-3">
                                <label class="form-label">Username</label>

                                <input
                                    type="text"
                                    id="loginUsername"
                                    class="form-control"
                                    required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Password</label>

                                <input
                                    type="password"
                                    id="loginPassword"
                                    class="form-control"
                                    required>
                            </div>

                            <button
                                type="submit"
                                class="btn btn-primary w-100">

                                Login

                            </button>

                        </form>

                    </div>

                </div>

            </div>

        </div>
    `,

    '#dashboard': `
        <div class="row">

            <aside class="col-12 col-lg-3 mb-3">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <h5>Menu</h5>

                        <hr>

                        <button class="btn btn-primary w-100 mb-2">
                            Laporan Saya
                        </button>

                    </div>

                </div>

            </aside>

            <section class="col-12 col-lg-6 mb-3">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <h4>Dashboard Citizen</h4>

                        <p>
                            Selamat datang di Portal Warga.
                        </p>

                    </div>

                </div>

            </section>

            <aside class="col-12 col-lg-3">

                <div class="card shadow-sm">

                    <div class="card-body">

                        <h5>Status</h5>

                        <p>
                            Belum ada notifikasi.
                        </p>

                    </div>

                </div>

            </aside>

        </div>
    `
};

function handleRouting() {

    const hash =
        window.location.hash || '#login';

    document.getElementById('app-content').innerHTML =
        routes[hash] || routes['#login'];

    if (
        hash === '#login' &&
        typeof setupLoginForm === 'function'
    ) {
        setupLoginForm();
    }

}

window.addEventListener('hashchange', handleRouting);
window.addEventListener('DOMContentLoaded', handleRouting);