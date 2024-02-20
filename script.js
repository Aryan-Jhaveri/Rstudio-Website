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
                // Convert and store the 'start' and 'end' elements to EST
                Start: convertToEST(getValue(event, "start")),
                End: convertToEST(getValue(event, "end")),
                // Extract and store the text content of 'description' element
                Description: getValue(event, "description"),
                // Extract and store the 'url' attribute from 'enclosure' element (or null if 'enclosure' does not exist)
                Enclosure: enclosureElement ? `<img src="${enclosureElement.getAttribute("url")}" alt="Event Image">` : null,
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

// Helper function to convert time to Eastern Standard Time (EST)
// Helper function to convert time to Eastern Standard Time (EST) and format it
function convertToEST(dateTimeString) {
    // Assuming dateTimeString is in ISO format
    const utcDateTime = new Date(dateTimeString);
    const estDateTime = new Date(utcDateTime.toLocaleString("en-US", { timeZone: "America/New_York" }));

    // Format the date in a more readable format
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short' };
    const formattedDateTime = estDateTime.toLocaleString("en-US", options);

    return formattedDateTime;
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

    // Initialize datepicker for start and end date selection
    $("#startDate, #endDate").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function () {
            // Redraw the DataTable when a date is selected
            table.draw();
        }
    });

    // Add custom filtering based on selected start and end dates
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            const startDate = $("#startDate").datepicker("getDate");
            const endDate = $("#endDate").datepicker("getDate");

            const eventStartDate = new Date(data[1]); // Assuming 'Start' column is at index 1
            const eventEndDate = new Date(data[2]);   // Assuming 'End' column is at index 2

            return (startDate === null || eventStartDate >= startDate) &&
                   (endDate === null || eventEndDate <= endDate);
        }
    );

    // Handle date range selection and redraw DataTable
    $("#applyFilter").on("click", function () {
        table.draw();
    });

    // Clear date range filter
    $("#clearFilter").on("click", function () {
        $("#startDate, #endDate").val("");
        table.draw();
    });
}

// Trigger displayData on page load
$(document).ready(function () {
    displayData();
});
