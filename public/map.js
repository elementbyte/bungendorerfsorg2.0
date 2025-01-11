function initMap() {
  const map = L.map("map", {
    center: [-35.25870948687002, 149.4431761913284], // Centered on New South Wales, Australia
    zoom: 10,
    zoomControl: false, // Disable the zoom control
  });

  // Fetch the Mapbox token from an external URL using a POST request
  fetch(
    "https://prod-13.eastasia.logic.azure.com:443/workflows/a1e2c15b9b8c4bc09f218255271f73b4/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=59cN9YlOmJPsmVOoixCmKXD2ZDhmk4ZjGEE-IXL1hOQ",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-ID": "Get-Mapbox-Token", // Custom header to identify the request
      },
      body: JSON.stringify({ request: "mapbox-token" }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const accessToken = data.token;

      // Define navigation guidance light and dark mode tile layers using Mapbox
      const lightTileLayer = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/navigation-guidance-day-v4/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
        {
          attribution:
            '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors',
        }
      );

      const darkTileLayer = L.tileLayer(
        `https://api.mapbox.com/styles/v1/mapbox/navigation-guidance-night-v4/tiles/{z}/{x}/{y}?access_token=${accessToken}`,
        {
          attribution:
            '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors',
        }
      );

      // Function to set the appropriate tile layer based on the color scheme
      function setTileLayer() {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          darkTileLayer.addTo(map);
        } else {
          lightTileLayer.addTo(map);
        }
      }

      // Set the initial tile layer
      setTileLayer();

      // Listen for changes in the color scheme preference
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setTileLayer);

      // Define custom icons with error handling
      function createIcon(iconUrl) {
        try {
          return L.icon({
            iconUrl: iconUrl,
            iconSize: [32, 32], // size of the icon
            iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -32], // point from which the popup should open relative to the iconAnchor
          });
        } catch (error) {
          console.error("Error creating icon:", error);
          return L.divIcon({
            html: '<i class="fa fa-fire" style="font-size: 32px; color: grey;"></i>',
            iconSize: [32, 32],
            className: "custom-div-icon",
          });
        }
      }

      // Fallback icon in case custom icons fail
      const defaultIcon = L.divIcon({
        html: '<i class="fa fa-fire" style="font-size: 32px; color: grey;"></i>',
        iconSize: [32, 32],
        className: "custom-div-icon",
      });

      const icons = {
        advice: createIcon("/Images/advice.png") || defaultIcon,
        watchAndAct: createIcon("/Images/watch-and-act.png") || defaultIcon,
        emergencyWarning: createIcon("/Images/emergency-warning.png") || defaultIcon,
        other: createIcon("/Images/other.png") || defaultIcon,
      };

      // Create a feature group to hold the markers
      const markers = L.featureGroup().addTo(map);

      // Fetch GeoJSON data and add markers to the map
      const targetUrl =
        "https://prod-16.australiaeast.logic.azure.com:443/workflows/0e1db2551604467787d10a1079e2ca00/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=PPxJa5-zzi3BE7-vp98G6nDRymYIoRgvKw4lZU44Cv4";

      fetch(targetUrl, {
        method: "GET",
        headers: {
          "X-Request-ID": "Get-Fire-Incidents", // Custom header to identify the request
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const categoryCounts = {
            Other: 0,
            Advice: 0,
            "Watch and Act": 0,
            "Emergency Warning": 0,
          };

          // Check if the current URL is localhost:3000
          const isTest =
            (window.location.hostname === "localhost" && window.location.port === "3000") ||
            window.location.href ===
              "https://lively-flower-0577f4700-livedev.eastasia.5.azurestaticapps.net/";

          // Filter features that contain "COUNCIL AREA: Queanbeyan-Palerang" or "COUNCIL AREA: ACT" in the description
          const filteredFeatures = isTest
            ? data.features
            : data.features.filter(
                (feature) =>
                  feature.properties &&
                  feature.properties.description &&
                  (feature.properties.description.includes("COUNCIL AREA: Queanbeyan-Palerang") ||
                    feature.properties.description.includes("COUNCIL AREA: ACT"))
              );

          // Populate the table with filtered features
          populateFireInfoTable({ features: filteredFeatures });

          L.geoJSON(
            { features: filteredFeatures },
            {
              pointToLayer: function (feature, latlng) {
                // Determine the icon based on the warning type
                const icon = getIconForFeature(feature, icons, categoryCounts);
                const marker = L.marker(latlng, { icon: icon });
                markers.addLayer(marker); // Add marker to the feature group
                return marker;
              },

              // Create a nice card for each clicked feature
              onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.title) {
                  // Deconstruct the description into key-value pairs
                  const description = feature.properties.description;
                  const {
                    alertLevel,
                    location,
                    councilArea,
                    status,
                    type,
                    fire,
                    size,
                    responsibleAgency,
                    updated,
                  } = extractFields(description);

                  // Define a mapping of alert levels to icon URLs
                  const alertLevelIcons = {
                    "Not Applicable": "/Images/other.png",
                    Advice: "/Images/advice.png",
                    "Watch and Act": "/Images/watch-and-act.png",
                    "Emergency Warning": "/Images/emergency-warning.png",
                  };

                  // Get the icon URL for the alert level
                  const alertIconUrl =
                    alertLevelIcons[alertLevel] || alertLevelIcons["Not Applicable"];

                  // Check if the image exists
                  const img = new Image();
                  img.src = alertIconUrl;
                  img.onerror = function () {
                    console.error(`Image not found: ${alertIconUrl}`);
                    img.src = alertLevelIcons["Not Applicable"]; // Fallback to default icon
                  };

                  // Create a nicely formatted card
                  const cardHTML = `
                    <article class="feature-card compact">
                      <div class="compact-header">
                        <span id="feature-card-header-span">
                          <img src="${alertIconUrl}" alt="${alertLevel}" class="cardIcon"> ${status}
                        </span>
                        <p>${feature.properties.title}</p>
                      </div>
                      <div class="card-content">
                        <p>${location}</p>
                        <div class="three-column-grid">
                          <p>${councilArea}</p>
                          <p>${type}</p>
                          <p>${size}</p>
                        </div>
                      </div>
                      <div>
                        <p class="align-bottom">${responsibleAgency} Updated ${updated}</p>
                      </div>
                    </article>
                  `;
                  // Bind the formatted card to the popup
                  layer.bindPopup(cardHTML);
                }
              },
            }
          ).addTo(map);

          // Create a mini table in the incidentCountCell
          const incidentCountCell = document.getElementById("incidentCountCell");
          let tableHTML = "<table>";

          if (categoryCounts["Emergency Warning"] > 0) {
            tableHTML += `
              <tr>
                <td><img src="${icons.emergencyWarning.options.iconUrl}" alt="Emergency Warning" /></td>
                <td>${categoryCounts["Emergency Warning"]}</td>
              </tr>
            `;
          }
          if (categoryCounts["Watch and Act"] > 0) {
            tableHTML += `
              <tr>
                <td><img src="${icons.watchAndAct.options.iconUrl}" alt="Watch and Act" /></td>
                <td>${categoryCounts["Watch and Act"]}</td>
              </tr>
            `;
          }
          if (categoryCounts["Advice"] > 0) {
            tableHTML += `
              <tr>
                <td><img src="${icons.advice.options.iconUrl}" alt="Advice" /></td>
                <td>${categoryCounts["Advice"]}</td>
              </tr>
            `;
          }
          if (categoryCounts["Other"] > 0) {
            tableHTML += `
              <tr>
                <td><img src="${icons.other.options.iconUrl}" alt="Other" /></td>
                <td>${categoryCounts["Other"]}</td>
              </tr>
            `;
          }

          tableHTML += "</table>";
          incidentCountCell.innerHTML = tableHTML;

          // Ensure the station marker is included in the bounds calculation
          const stationIcon = L.icon({
            iconUrl: "/Images/station.png",
            iconSize: [32, 32], // size of the icon
            iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -16], // point from which the popup should open relative to the iconAnchor
            className: "station-icon", // custom class for additional styling
          });

          const stationMarker = L.marker(
            [-35.26165168903826, 149.43974909148088],
            { icon: stationIcon }
          );

          // Get the station card content
          const stationCardContent = document.getElementById("stationCard").innerHTML;

          stationMarker.bindPopup(stationCardContent);

          markers.addLayer(stationMarker); // Add the station marker to the markers layer group

          // Check if there are any markers before fitting bounds
          if (markers.getLayers().length > 0) {
            // Fit the map view to the bounds of the markers with 10% padding
            map.fitBounds(markers.getBounds(), {
              padding: [map.getSize().x * 0.1, map.getSize().y * 0.1], // 10% padding on each side
            });
          } else {
            console.log("No markers to fit bounds to.");
          }
        })
        .catch((error) => console.error("Error fetching the GeoJSON data:", error));
    })
    .catch((error) => console.error("Error fetching Mapbox token:", error));
}

// Ensure the map is initialized after the DOM content is loaded
document.addEventListener("DOMContentLoaded", initMap);

// Helper function to get the appropriate icon for a feature and update category counts
function getIconForFeature(feature, icons, categoryCounts) {
  let icon;
  if (feature.properties.category.includes("Advice")) {
    icon = icons.advice;
    categoryCounts["Advice"]++;
  } else if (feature.properties.category.includes("Watch and Act")) {
    icon = icons.watchAndAct;
    categoryCounts["Watch and Act"]++;
  } else if (feature.properties.category.includes("Emergency Warning")) {
    icon = icons.emergencyWarning;
    categoryCounts["Emergency Warning"]++;
  } else {
    icon = icons.other;
    categoryCounts["Other"]++;
  }
  return icon;
}