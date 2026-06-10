function setupLoginForm() {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("loginUsername");
        const passwordInput = document.getElementById("loginPassword");
        const btnLogin = form.querySelector("button[type='submit']");

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showToast("Username dan password wajib diisi.", "warning");
            return;
        }

        setButtonLoading(btnLogin, true, "Memproses...");

        try {
            const response = await requestAPI(
                "/api/token/",
                "POST",
                { username, password }
            );

            const data = await parseResponseJSON(response);

            if (response.status === 200 && data.access && data.refresh) {
                saveAuthData(data.access, data.refresh, username);
                await fetchCurrentProfile();

                showToast("Login berhasil. Dashboard dimuat.", "success");

                setTimeout(function () {
                    window.location.hash = "#dashboard";
                }, 300);

                return;
            }

            showToast("Username atau password salah.", "danger");
            setButtonLoading(btnLogin, false, "Login");

        } catch (error) {
            console.error("Login error:", error);
            showToast("Gagal terhubung ke server.", "danger");
            setButtonLoading(btnLogin, false, "Login");
        }
    });
}

function setupLoginNotice() {
    const notice = sessionStorage.getItem("login_notice");

    if (!notice) return;

    sessionStorage.removeItem("login_notice");
    showToast(notice, "warning");
}

function logoutUser() {
    clearAuthData();
    showToast("Logout berhasil.", "success");
    window.location.hash = "#login";
}

function setButtonLoading(button, isLoading, loadingText = "Memproses...") {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ${loadingText}
        `;
        return;
    }

    button.disabled = false;
    button.innerHTML = button.dataset.originalText || loadingText;
}