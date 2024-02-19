// Fetch data from the RSS feed
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

function getValue(parentElement, tagName) {
    // Select the child element with the specified tagName
    const element = parentElement.querySelector(tagName);

    // Check if the element exists and has a text content
    if (element && element.textContent) {
        return element.textContent;
    } else {
        // If the element does not exist or has no text content, return null
        return null;
    }
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
