// Fetch data from the RSS feed
async function fetchData() {
    const url = "https://experiencebu.brocku.ca/events.rss";
    const response = await fetch(url);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const events = xmlDoc.querySelectorAll("item");

    const data = [];
    events.forEach((event) => {
        const eventData = {
            Title: event.querySelector("title").textContent,
            Link: event.querySelector("link").textContent,
            Start: event.querySelector("start").textContent,
            Description: event.querySelector("description").textContent,
            End: event.querySelector("end").textContent,
            Enclosure: event.querySelector("enclosure").getAttribute("url"),
        };
        data.push(eventData);
    });

    return data;
}

// Display data in DataTable
async function displayData() {
    const data = await fetchData();
    const table = $("#eventsTable").DataTable({
        data: data,
        columns: [
            { data: "Title" },
            { data: "Start" },
            { data: "End" },
            { data: "Link" },
            { data: "Enclosure" },
        ],
        // Add other DataTable configurations here
    });
}

// Trigger displayData on page load
$(document).ready(function () {
    displayData();
});
