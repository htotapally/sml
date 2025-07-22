import React, { useContext, useEffect, useState } from 'react'
import { embedDashboard } from "@superset-ui/embedded-sdk";

import { ThemeContext } from './ThemeContext'

function ReportsPage({ setCurrentPage }) {
  const { 
    user, 
    token, 
    BackendURL,
    dashboardId,
    supersetDomain} = useContext(ThemeContext);

  const getToken = async () => {
    console.log('Getting Token')
    const params = {
      dashboardId: dashboardId,
    }

    const url = new URL(BackendURL + '/guest-token')
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    const response = await fetch(url)
    const data = await response.json();
    const token = data.token;
    console.log("Received guest token:", token);
    return token;
  };

  useEffect(() => {

    console.log("Reports page has been loaded")

    if (document.getElementById("dashboard")) {
      const element = document.getElementById("dashboard")
      console.log(element.children[0])
      element.style.width = "100%";
      element.style.height = "100%";
    }

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
      let iframeElement = document.querySelector('iframe');
      iframeElement.style.height = '900px'
      iframeElement.style.width = '1600px'
      console.log(iframeElement)
    }
  }, []);

  return (
       <div id="dashboard"></div>
  );
}

export default ReportsPage;
