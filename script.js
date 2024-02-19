// Fetch data from the RSS feed
async function fetchData() {
    try {
        const url = "https://experiencebu.brocku.ca/events.rss";
        const response = await fetch(url);
        const xmlText = await response.text();

        // Parse XML content
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // Select all 'item' elements from the XML
        const events = xmlDoc.querySelectorAll("item");

        // Process each 'item' element and extract relevant data
        const data = [];
        events.forEach((event) => {
            // Check if 'enclosure' element exists
            const enclosureElement = event.querySelector("enclosure");

            const eventData = {
                // Extract and store the text content of 'title' element
                Title: getValue(event, "title"),
                // Extract and store the text content of 'link' element
                Link: getValue(event, "link"),
                // Extract and store the text content of 'start' element
                Start: getValue(event, "start"),
                // Extract and store the text content of 'description' element
                Description: getValue(event, "description"),
                // Extract and store the text content of 'end' element
                End: getValue(event, "end"),
                // Extract and store the 'url' attribute from 'enclosure' element (or null if 'enclosure' does not exist)
                Enclosure: enclosureElement ? enclosureElement.getAttribute("url") : null,
            };
            data.push(eventData);
        });

        return data;
    } catch (error) {
        // Log any errors that occur during data fetching
        console.error("Error fetching data:", error);
        return [];
    }
}

// Helper function to get value from an XML element
function getValue(parentElement, tagName) {
    // Select the child element with the specified tagName
    const element = parentElement.querySelector(tagName);

    // Return the text content of the element, or null if the element does not exist
    return element ? element.textContent : null;
}

// Display data in DataTable
async function displayData() {
    // Call fetchData to retrieve data
    const data = await fetchData();

    // Initialize DataTable with retrieved data
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
