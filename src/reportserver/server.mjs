import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { config } from "dotenv";
config()

const PORT = process.env.SERVERPORT

const app = express();

app.use(cors());

const username = process.env.SSUSERNAME
const password = process.env.SSPASSWORD
const provider = process.env.SSPROVIDER

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function fetchCsrfToken() {
  const accessToken = await fetchAccessToken();

  const host = process.env.SSHOST
  const response = await fetch(
    host + "/api/v1/security/csrf_token", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      redirect: "follow",
    }
  );

  const csrf = await response.json()
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

    const host = process.env.SSHOST
    const response = await fetch(
      host + "/api/v1/security/login",
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
        username: username,
        // first_name: "Hara",
        // last_name: "Totapally",
      },
    };

    const host = process.env.SSHOST
    const accessToken = await fetchAccessToken()
    const response = await fetch(
      host + "/api/v1/security/guest_token",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    const jsonResponse = await response.json();
    return jsonResponse?.token;
  } catch (error) {
    console.error(error);
  }
}

app.get("/guest-token", async (req, res) => {
  const dashboardId = req.query.dashboardId
  console.log('Dashboard id: ' + dashboardId)
  const token = await fetchGuestToken(dashboardId);
  res.json({ token });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});
