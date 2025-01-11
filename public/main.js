function extractFields(description) {
  const fields = [
    "ALERT LEVEL",
    "LOCATION",
    "COUNCIL AREA",
    "STATUS",
    "TYPE",
    "FIRE",
    "SIZE",
    "RESPONSIBLE AGENCY",
    "UPDATED",
  ];

  return fields.reduce((acc, field) => {
    const match = description.match(new RegExp(`${field}: ([^<]*)`));
    acc[field.toLowerCase().replace(/ /g, "")] = match ? match[1].trim() : "N/A";
    return acc;
  }, {});
}

function populateFireInfoTable(data) {
  const fireInfoTableContainer = document.getElementById("fireInfoTableContainer");
  let tableHTML = "";

  data.features.forEach((feature) => {
    const { title, category, description } = feature.properties;
    const {
      alertlevel,
      location,
      councilarea,
      status,
      type,
      fire,
      size,
      responsibleagency,
      updated,
    } = extractFields(description);

    const iconUrl = getIconUrl(category);

    tableHTML += `
      <article class="feature-card compact">
        <div class="compact-header">
          <span id="feature-card-header-span">
            <img src="${iconUrl}" alt="${alertlevel}" class="cardIcon">
            ${status}
          </span>
          <p class="compact-card-heading">${title}</p>
        </div>
        <div class="card-content">
          <p>${location}</p>
          <div class="three-column-grid">
            <p>${councilarea}</p>
            <p>${type}</p>
            <p>${size}</p>
          </div>
        </div>
        <div>
          <p class="align-bottom">${responsibleagency} Updated ${updated}</p>
        </div>
      </article>
    `;
  });

  fireInfoTableContainer.innerHTML = tableHTML;
}

function getIconUrl(category) {
  if (category.includes("Advice")) {
    return "/Images/advice.png";
  } else if (category.includes("Watch and Act")) {
    return "/Images/watch-and-act.png";
  } else if (category.includes("Emergency Warning")) {
    return "/Images/emergency-warning.png";
  } else {
    return "/Images/other.png";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const heroLogo = document.querySelector(".hero .logo");
  const navLogo = document.querySelector(".nav-logo");

  function toggleNavLogo() {
    const heroLogoRect = heroLogo.getBoundingClientRect();
    navLogo.classList.toggle("visible", heroLogoRect.bottom < 0);
  }

  window.addEventListener("scroll", toggleNavLogo);
  toggleNavLogo(); // Initial check
});

document.addEventListener("DOMContentLoaded", () => {
  const BFDPContent = document.getElementById("BFDPContent");

  function isBushfireDangerPeriod() {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is zero-based
    return month >= 10 || month <= 3;
  }

  const inDangerPeriod = isBushfireDangerPeriod();
  const statusText = inDangerPeriod
    ? "We are currently in the bushfire danger period. If you would like to light a fire any larger than a cooking fire you must;"
    : "We are not currently in the bushfire danger period. If you would like to light a fire any larger than a cooking fire you must;";

  const tableHTML = `
    <p>${statusText}</p>
    <table>
      <tr>
        <td>Not light your fire on days of total fire ban or high fire danger</td>
        <td><input type="checkbox" checked disabled></td>
      </tr>
      <tr>
        <td>Notify your neighbours</td>
        <td><input type="checkbox" checked disabled></td>
      </tr>
      <tr>
        <td>Notify the RFS of your burn</td>
        <td><input type="checkbox" checked disabled></td>
      </tr>
      <tr>
        <td>Have been issued a fire permit</td>
        <td><input type="checkbox" ${inDangerPeriod ? "checked" : ""} disabled></td>
      </tr>
    </table>
  `;

  BFDPContent.innerHTML = tableHTML;
});

document.addEventListener("DOMContentLoaded", () => {
  const fireDangerTableContainer = document.getElementById("fireDangerTableContainer");
  const fireDangerRatingCell = document.getElementById("fireDangerRatingCell");
  const incidentCountCell = document.getElementById("incidentCountCell");
  const fireMessagesDiv = document.getElementById("fireMessages"); // Select the <div> element

  // Fetch the fire danger rating messages from the JSON file
  fetch("/Content/AFDRSMessages.json")
    .then((response) => response.json())
    .then((fireDangerRatings) => {
      // Fetch the XML data for the fire danger rating
      fetch(
        "https://prod-23.australiaeast.logic.azure.com:443/workflows/5db5283afc564a449079c0d2c1fe3622/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=WFE08wwCYaxwAvCQrRnLrUrVPbhC8VzyiPx9IZuHHkg"
      )
        .then((response) => response.text())
        .then((data) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, "application/xml");
          const districts = xmlDoc.getElementsByTagName("District");

          const southernRangesDistrict = Array.from(districts).find(
            (district) => district.getElementsByTagName("Name")[0].textContent === "Southern Ranges"
          );

          if (southernRangesDistrict) {
            let dangerLevelToday =
              southernRangesDistrict.getElementsByTagName("DangerLevelToday")[0].textContent;
            dangerLevelToday = dangerLevelToday.trim().toUpperCase(); // Trim and convert to uppercase

            const ratingInfo = fireDangerRatings.FireDangerRatings.find(
              (rating) => rating.Rating === dangerLevelToday
            );

            if (!ratingInfo) {
              console.error(`No rating information found for danger level: ${dangerLevelToday}`);
              return;
            }

            // Construct style string conditionally
            const styleString = `
              font-weight: bold;
              ${ratingInfo.color ? `color: ${ratingInfo.color};` : ""}
              ${ratingInfo["background-color"] ? `background-color: ${ratingInfo["background-color"]};` : ""}
            `;

            // Set the fire danger rating cell content and style
            fireDangerRatingCell.textContent = dangerLevelToday;
            fireDangerRatingCell.setAttribute("style", styleString);

            // Create the old table structure
            const oldTable = document.createElement("table");
            oldTable.innerHTML = `
              <tr>
                <th colspan="2" style="${styleString}">
                  Today's Fire Danger Rating
                </th>
              </tr>
              <tr>
                <td>
                  <table>
                    <tr></tr>
                    <tr>
                      <td>${dangerLevelToday}</td>
                    </tr>
                    <tr></tr>
                    <tr>
                      <td>${ratingInfo.FireBehaviour}</td>
                    </tr>
                  </table>
                </td>
                <td>
                  <ul>
                    ${ratingInfo.SupportingMessages.map((message) => `<li>${message}</li>`).join("")}
                  </ul>
                </td>
              </tr>
            `;

            fireDangerTableContainer.appendChild(oldTable);

            // Inject the matching keyMessage into the fireMessages div
            const keyMessage = ratingInfo.KeyMessage;
            if (keyMessage) {
              fireMessagesDiv.textContent = keyMessage;
            }
          } else {
            console.error("Southern Ranges district not found in the XML data.");
          }
        })
        .catch((error) => console.error("Error fetching the XML data:", error));
    })
    .catch((error) => console.error("Error fetching the JSON data:", error));
});