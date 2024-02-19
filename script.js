// Fetch data from the RSS feed
async function fetchData() {
    try {
        const url = "https://experiencebu.brocku.ca/events.rss";
        const response = await fetch(url);
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const events = xmlDoc.querySelectorAll("item");

        const data = [];
        events.forEach((event) => {
            const eventData = {
                Title: getValue(event, "title"),
                Link: getValue(event, "link"),
                Start: getValue(event, "start"),
                Description: getValue(event, "description"),
                End: getValue(event, "end"),
                Enclosure: getValue(event.querySelector("enclosure"), "url"),
            };
            data.push(eventData);
        });

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

// Helper function to get value from an XML element
function getValue(parentElement, tagName) {
    const element = parentElement.querySelector(tagName);
    return element ? element.textContent : null;
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
