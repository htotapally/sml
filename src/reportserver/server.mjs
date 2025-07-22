import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const PORT = 3001;
const app = express();

app.use(cors());

const username = "admin"
const password = "admin"
const provider =  "db"


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function fetchCsrfToken() {
  const accessToken = await fetchAccessToken();

  const response1 = await fetch(
      "http://192.168.1.170:8088/api/v1/security/csrf_token",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        redirect: "follow",
      }
    );
    const csrf = await response1.json()
    const csrftoken = csrf.result;
    return csrftoken
}

async function fetchAccessToken() {
  console.log("FetchAccessToken")
  try {
    const body = {
      username: username,
      password: password,
      provider: provider,
      refresh: true,
    };

    const response = await fetch(
      "http://192.168.1.170:8088/api/v1/security/login",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const jsonResponse = await response.json();
    return jsonResponse?.access_token;
  } catch (e) {
    console.error(e);
  }
}


async function fetchAccessTokenWithCsrf() {

  try {
    const body = {
      username: "admin",
      password: "admin",
      provider: "db",
      // refresh: true,
      // csrf_token: csrftoken
    };

    const response = await fetch(
      "http://192.168.1.170:8088/api/v1/security/login",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "http://192.168.1.153:3000"
        },
      }
    );

    const jsonResponse = await response.json();
    console.log(jsonResponse)
    return jsonResponse?.access_token;
  } catch (e) {
    console.error(e);
  }
}

async function fetchGuestToken(dashboardId) {
  const csrfToken = await fetchCsrfToken();

  try {
    const body = {
      resources: [
        {
          type: "dashboard",
          id: dashboardId
        },
      ],
      rls: [],
      user: {
        username: "hara",
        first_name: "Hara",
        last_name: "Totapally",
      },

      // "type": "guest",
      // "csrf-token": csrfToken,
      // "aud": "http://0.0.0.0:8080/",
    };

    const accessToken = await fetchAccessToken()
    const response = await fetch(
      "http://192.168.1.170:8088/api/v1/security/guest_token",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          // "X-CSRFToken": csrfToken,
          // "X-CSRF-TOKEN": csrfToken,
          // "csrf-token": csrfToken
        },
        // redirect: "follow",
      }
    );
    console.log("Got response back from the server")
    const jsonResponse = await response.json();
    return jsonResponse?.token;
  } catch (error) {
    console.error(error);
  }
}

app.get("/guest-token", async (req, res) => {
  const dashboardId = req.query.dashboardId
  // console.log(req)
  console.log('Dashboard id: ' + dashboardId)
  const token = await fetchGuestToken(dashboardId);
  console.log("token received :", token);
  res.json({ token });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});
