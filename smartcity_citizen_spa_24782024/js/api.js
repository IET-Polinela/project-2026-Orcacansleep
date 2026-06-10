const API_BASE_URL = "http://127.0.0.1:8000";

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
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("username", username);
}

function saveProfileData(profile) {
    localStorage.setItem("username", profile.username || "Warga");
    localStorage.setItem("role", profile.role || "citizen");
    localStorage.setItem("is_admin", profile.is_admin ? "true" : "false");
    localStorage.setItem("is_member", profile.is_member ? "true" : "false");
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

async function requestAPI(endpoint, method = "GET", bodyData = null) {
    const headers = {
        "Content-Type": "application/json"
    };

    const accessToken = getAccessToken();

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const config = {
        method,
        headers
    };

    if (bodyData !== null) {
        config.body = JSON.stringify(bodyData);
    }

    return await fetch(`${API_BASE_URL}${endpoint}`, config);
}

async function parseResponseJSON(response) {
    try {
        return await response.json();
    } catch (error) {
        return {};
    }
}

async function fetchCurrentProfile() {
    const response = await requestAPI("/api/me/", "GET");

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