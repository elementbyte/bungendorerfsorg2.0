document.addEventListener("DOMContentLoaded", () => {
  const membershipCalendar = document.getElementById("membershipCalendar");
  const communityEventsCalendar = document.getElementById("communityEventsCalendar");
  const modal = document.getElementById("eventModal");
  const modalContent = document.getElementById("modalEventContent");
  const closeButton = document.getElementById("eventModalClose");

  // Fetch events data from the URL
  fetch(
    "https://prod-12.australiaeast.logic.azure.com:443/workflows/a975849d90b74eed9c08c780967fc18d/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=zRG6Cx6kxtdPpmuM4m5cSyhItIAAZhs-NqAa6WIF6Ts"
  )
    .then((response) => response.json())
    .then((data) => {
      const events = data.value;

      // Filter and display Membership events
      const membershipEvents = events.filter((event) =>
        event.categories.includes("Public - Training")
      );
      displayEvents(membershipEvents, membershipCalendar);

      // Filter and display Community Events
      const communityEvents = events.filter((event) =>
        event.categories.includes("Public - Community Engagement")
      );
      displayEvents(communityEvents, communityEventsCalendar);
    })
    .catch((error) => console.error("Error fetching events:", error));

  // When the user clicks on the close button, close the modal
  closeButton.onclick = () => modal.removeAttribute("open");

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.removeAttribute("open");
    }
  };
});

function displayEvents(events, container) {
  container.innerHTML = ""; // Clear any existing content

  events.forEach((event) => {
    const eventElement = document.createElement("div");
    eventElement.className = "event";

    const titleElement = document.createElement("div");
    titleElement.className = "event-title";
    titleElement.textContent = event.subject;
    titleElement.style.cursor = "pointer";

    // Convert start and end times to Bungendore, NSW, Australia time zone
    const startDate = luxon.DateTime.fromISO(event.start.dateTime || event.start, { zone: "utc" }).setZone("Australia/Sydney");
    const endDate = luxon.DateTime.fromISO(event.end.dateTime || event.end, { zone: "utc" }).setZone("Australia/Sydney");

    const dateTimeElement = document.createElement("div");
    dateTimeElement.className = "event-date-time";
    dateTimeElement.textContent = event.isAllDay
      ? `Date: ${startDate.toLocaleString(luxon.DateTime.DATE_MED)}`
      : `Date: ${startDate.toLocaleString(luxon.DateTime.DATETIME_MED)} - ${endDate.toLocaleString(luxon.DateTime.DATETIME_MED)}`;

    eventElement.appendChild(titleElement);
    eventElement.appendChild(dateTimeElement);

    if (event.location) {
      const locationElement = document.createElement("div");
      locationElement.className = "event-location";
      locationElement.textContent = `Location: ${event.location.displayName}`;
      eventElement.appendChild(locationElement);
    }

    // Add click event to title to show modal with event details
    titleElement.addEventListener("click", () => showModal(event));

    container.appendChild(eventElement);
  });
}

function showModal(event) {
  const modal = document.getElementById("eventModal");
  const modalContent = document.getElementById("modalEventContent");

  // Clear previous content
  modalContent.innerHTML = "";

  // Add event details to modal
  const titleElement = document.createElement("h2");
  titleElement.textContent = event.subject;
  modalContent.appendChild(titleElement);

  const startDate = luxon.DateTime.fromISO(event.start.dateTime || event.start, { zone: "utc" }).setZone("Australia/Sydney");
  const endDate = luxon.DateTime.fromISO(event.end.dateTime || event.end, { zone: "utc" }).setZone("Australia/Sydney");

  const dateTimeElement = document.createElement("p");
  dateTimeElement.textContent = event.isAllDay
    ? `Date: ${startDate.toLocaleString(luxon.DateTime.DATE_MED)}`
    : `Date: ${startDate.toLocaleString(luxon.DateTime.DATETIME_MED)} - ${endDate.toLocaleString(luxon.DateTime.DATETIME_MED)}`;
  modalContent.appendChild(dateTimeElement);

  if (event.location) {
    const locationElement = document.createElement("p");
    locationElement.textContent = `Location: ${event.location.displayName}`;
    modalContent.appendChild(locationElement);
  }

  if (event.body) {
    const descriptionElement = document.createElement("div");
    descriptionElement.innerHTML = DOMPurify.sanitize(event.body);
    modalContent.appendChild(descriptionElement);
  }

  // Show the modal
  modal.setAttribute("open", "");
}