function setupLoginForm() {

    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("loginUsername").value;

        const password =
            document.getElementById("loginPassword").value;

        const btnLogin = form.querySelector("button[type='submit']");
        btnLogin.disabled = true;
        btnLogin.textContent = "Memproses...";

        try {

            const response = await requestAPI(
                "/api/token/",
                "POST",
                {
                    username,
                    password
                }
            );

            const data = await response.json();

            if (response.status === 200) {

                localStorage.setItem(
                    "access_token",
                    data.access
                );

                localStorage.setItem(
                    "refresh_token",
                    data.refresh
                );

                localStorage.setItem(
                    "username",
                    username
                );

                window.location.hash = "#dashboard";

            } else {

                alert("Username atau Password salah.");

                btnLogin.disabled = false;
                btnLogin.textContent = "Login";

            }

        } catch (error) {

            console.error(error);

            alert("Gagal terhubung ke server.");

            btnLogin.disabled = false;
            btnLogin.textContent = "Login";

        }

    });

}