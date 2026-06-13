/* ============================================================
   API.JS - VERSI AMAN
   Tujuan:
   - Tidak error walaupun file api.js tidak sengaja terpanggil 2 kali.
   - Tetap menyediakan function global yang dipakai auth.js, app.js, router.js.
============================================================ */

(function () {
    "use strict";

    const BASE_URL = "http://103.151.63.84:8007";

    window.API_BASE_URL = window.API_BASE_URL || BASE_URL;

    function getAccessToken() {
        return localStorage.getItem("access_token");
    }

    function getRefreshToken() {
        return localStorage.getItem("refresh_token");
    }

    function getCurrentUsername() {
        return localStorage.getItem("username") || "Warga";
    }

    function getCurrentRole() {
        return localStorage.getItem("role") || "citizen";
    }

    function isAdminUser() {
        return localStorage.getItem("is_admin") === "true";
    }

    function isCitizenUser() {
        return localStorage.getItem("is_member") === "true" && !isAdminUser();
    }

    function saveAuthData(accessToken, refreshToken, username) {
        if (accessToken) {
            localStorage.setItem("access_token", accessToken);
        }

        if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
        }

        if (username) {
            localStorage.setItem("username", username);
        }
    }

    function saveProfileData(profile) {
        const safeProfile = profile || {};

        localStorage.setItem("username", safeProfile.username || "Warga");
        localStorage.setItem("role", safeProfile.role || "citizen");
        localStorage.setItem("is_admin", safeProfile.is_admin ? "true" : "false");
        localStorage.setItem("is_member", safeProfile.is_member ? "true" : "false");
    }

    function clearAuthData() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("is_member");
    }

    function isAuthenticated() {
        return Boolean(getAccessToken());
    }

    async function parseResponseJSON(response) {
        try {
            return await response.json();
        } catch (error) {
            return {};
        }
    }

    async function refreshAccessToken() {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${window.API_BASE_URL}/api/token/refresh/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            });

            if (response.status !== 200) {
                clearAuthData();
                return false;
            }

            const data = await parseResponseJSON(response);

            if (!data.access) {
                clearAuthData();
                return false;
            }

            localStorage.setItem("access_token", data.access);

            if (data.refresh) {
                localStorage.setItem("refresh_token", data.refresh);
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    async function requestAPI(endpoint, method = "GET", bodyData = null, allowRefresh = true) {
        const headers = {
            "Content-Type": "application/json"
        };

        const accessToken = getAccessToken();

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const config = {
            method,
            headers
        };

        if (bodyData !== null) {
            config.body = JSON.stringify(bodyData);
        }

        const response = await fetch(`${window.API_BASE_URL}${endpoint}`, config);

        const isAuthEndpoint =
            endpoint.includes("/api/token/") ||
            endpoint.includes("/api/register/");

        if (response.status === 401 && allowRefresh && !isAuthEndpoint) {
            const refreshed = await refreshAccessToken();

            if (refreshed) {
                return await requestAPI(endpoint, method, bodyData, false);
            }
        }

        return response;
    }

    async function fetchCurrentProfile() {
        const response = await requestAPI("/api/me/", "GET");

        if (response.status === 401) {
            redirectToLogin("Sesi login berakhir. Silakan login kembali.");
            throw new Error("Unauthorized.");
        }

        if (response.status !== 200) {
            throw new Error("Gagal mengambil profil pengguna.");
        }

        const profile = await parseResponseJSON(response);
        saveProfileData(profile);

        return profile;
    }

    function redirectToLogin(message = null) {
        clearAuthData();

        if (message) {
            sessionStorage.setItem("login_notice", message);
        }

        window.location.hash = "#login";
    }

    window.getAccessToken = getAccessToken;
    window.getRefreshToken = getRefreshToken;
    window.getCurrentUsername = getCurrentUsername;
    window.getCurrentRole = getCurrentRole;
    window.isAdminUser = isAdminUser;
    window.isCitizenUser = isCitizenUser;
    window.saveAuthData = saveAuthData;
    window.saveProfileData = saveProfileData;
    window.clearAuthData = clearAuthData;
    window.isAuthenticated = isAuthenticated;
    window.requestAPI = requestAPI;
    window.parseResponseJSON = parseResponseJSON;
    window.fetchCurrentProfile = fetchCurrentProfile;
    window.redirectToLogin = redirectToLogin;
})();
