import { useEffect } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";
import "./App.css";

const BackendURL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_BACKEND_URL_PROD ////----URLs placed in .env files ----////
    : process.env.REACT_APP_BACKEND_URL_DEV; ////-----backend URL depending if project is running on localhost or server ----///

function App() {
  console.log(BackendURL)
  const getToken = async () => {
    console.log('Getting Token')
    // const dashboardId = "288a77c9-6452-4ab0-8cc9-2d98ad8ee10c"
    // const dashboardId = "1bcb91ee-3441-4e56-8900-d23e2498f888"
    const dashboardId = "00b809e7-324b-4204-affb-abc41af6e71c"
    const params = {
        dashboardId: dashboardId,
    }

    const url = new URL(`${BackendURL}/guest-token`)
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    
    const response = await fetch(url) ///-----connect to your backend URL endpoint ----///
    const data = await response.json();
    const token = data.token;
    console.log("Received guest token:", token);
    return token;
  };

  const dashboardId = "00b809e7-324b-4204-affb-abc41af6e71c" // "1bcb91ee-3441-4e56-8900-d23e2498f888"
  const supersetDomain = "http://192.168.1.170:8088" ///-------your superset acc domain ----////
  useEffect(() => {
    const embed = async () => {
      await embedDashboard({
        id: dashboardId,
        supersetDomain: supersetDomain,
        mountPoint: document.getElementById("dashboard"),
        fetchGuestToken: (dashboardId) => getToken(dashboardId),
        dashboardUiConfig: {
          hideTitle: true,
          hideChartControls: true,
          hideTab: true,
        },
      });
    };

    if (document.getElementById("dashboard")) {
      embed();
    }
  }, []);

  return (
    <div className="App">
      <div className="header">
        <h1>Application_Title</h1>
      </div>
      <div id="dashboard"></div>
    </div>
  );
}

export default App;
