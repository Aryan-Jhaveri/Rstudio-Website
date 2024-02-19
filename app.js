// Assuming you have jQuery included in your project
// and have included the necessary XML and ShinyJS libraries

// Define UI for application
const ui = '<div>' +
  '<h1>Brock University Events</h1>' +
  '<button id="processBtn">Process Events</button>' +
  '<table id="table"></table>' +
'</div>';

// Define server logic
const server = function() {
  // Reactive values to store processed data
  const processedData = new ReactiveVar(null);

  // Event listener for button click
  $('#processBtn').on('click', function() {
    // This block will be executed when the button is clicked
    
    const url = "https://experiencebu.brocku.ca/events.rss";

    // Suppress warnings when reading the XML
    const page = read_xml(url);

    // Define namespace
    const ns = xml_ns(page);
    attr(ns, "events", "http://purl.org/NET/c4dm/event.owl#");

    // Extract event details
    const events = xml_find_all(page, "//item");

    // Extract data from each event
    // Initialize Descriptions column
    const data = {
      Title: xml_text(xml_find_all(events, ".//title")),
      Link: xml_text(xml_find_all(events, ".//link")),
      Start: xml_text(xml_find_first(events, ".//*[local-name()='start']", ns)),
      descriptions: xml_find_all(events, ".//description").map(xml_text),
      End: xml_text(xml_find_first(events, ".//*[local-name()='end']", ns)),
    };

    // Remove rows with missing Start or End values
    const validDataIndices = data.Start.map((start, index) => start && data.End[index]);
    const validData = {
      Title: data.Title[validDataIndices],
      Link: data.Link[validDataIndices],
      Start: data.Start[validDataIndices],
      descriptions: data.descriptions[validDataIndices],
      End: data.End[validDataIndices],
    };

    for (let i = 0; i < validData.descriptions.length; i++) {
      // Parse HTML content
      const html_content = read_html(validData.descriptions[i]);

      // Extract text from HTML
      const text_content = html_text(html_content);

      // Print or store the extracted text
      // console.log(`Converted text from row ${i + 1}:\n${text_content}\n`);

      // If you want to replace the original HTML content with the text
      validData.descriptions[i] = text_content;
    }

    // Convert date-time columns to JavaScript Date objects
    validData.Start = new Date(validData.Start);
    validData.End = new Date(validData.End);

    // Save processed data to reactive values
    processedData.set(validData);

    // Render the table
    renderTable(validData);
  });
};

// Run the application
shinyjs.ready(function() {
  // Your initialization code here
  shinyjs.setHtml('#shiny-container', ui);
  server();
});
