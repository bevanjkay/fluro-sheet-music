export const login = async (username: string, password: string) => {
    console.log("Attempting to login with email", username);
    const response = await fetch("https://api.fluro.io/token/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
        }),
    })
    const data = await response.json()
    return data
};

export const refresh = async (refreshToken) => {
    console.log("Received refresh token", refreshToken);
    const response = await fetch("https://api.fluro.io/token/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            refreshToken,
        }),
    })
    const data = await response.json()
    return data
}

export const getUserSession = async (user) => {
    try {
        const response = await fetch("https://api.fluro.io/session", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            }
        });
        const data = await response.json();
        return data;
    } catch (e) {
        console.error("Error fetching user session", e);
        throw e;
    }
};