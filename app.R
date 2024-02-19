# Required Libraries
library(shiny)
library(rvest)
library(dplyr)
library(xml2)
library(lubridate)

# Define UI for application
ui <- fluidPage(
  titlePanel("Brock University Events"),
  actionButton("processBtn", "Process Events"),
  tableOutput("table")
)

# Define server logic
server <- function(input, output) {
  
  # Reactive values to store processed data
  processedData <- reactiveVal(NULL)
  
  observeEvent(input$processBtn, {
    # This block will be executed when the button is clicked
    
    url <- "https://experiencebu.brocku.ca/events.rss"
    
    # Suppress warnings when reading the XML
    page <- suppressWarnings(read_xml(url))
    
    # Define namespace
    ns <- xml_ns(page)
    attr(ns, "events") <- "http://purl.org/NET/c4dm/event.owl#"
    
    # Extract event details
    events <- xml_find_all(page, "//item")
    
    # Extract data from each event
    # Initialize Descriptions column
    data <- tibble(
      Title = xml_text(xml_find_all(events, ".//title")),
      Link = xml_text(xml_find_all(events, ".//link")),
      Start = xml_text(xml_find_first(events, ".//*[local-name()='start']", ns)),
      descriptions = xml_find_all(events, ".//description") %>% xml_text(),
      End = xml_text(xml_find_first(events, ".//*[local-name()='end']", ns)),
    )
    # Remove rows with missing Start or End values
    data <- data[complete.cases(data$Start, data$End), ]
    
    for (i in seq_along(data$descriptions)) {
      # Parse HTML content
      html_content <- read_html(data$descriptions[i])
      
      # Extract text from HTML
      text_content <- html_text(html_content)
      
      # Print or store the extracted text
      # cat("Converted text from row", i, ":\n", text_content, "\n\n")
      
      # If you want to replace the original HTML content with the text, uncomment the line below
      data$descriptions[i] <- text_content
    }
    
    # Convert date-time columns to POSIXct
    data$Start <- as.POSIXct(data$Start, format = "%a, %d %b %Y %H:%M:%S", tz = "GMT")
    data$End <- as.POSIXct(data$End, format = "%a, %d %b %Y %H:%M:%S", tz = "GMT")
    
    # Convert timestamps to Eastern Time (EST)
    data$Start <- with_tz(data$Start, tzone = "EST")
    data$End <- with_tz(data$End, tzone = "EST")
    
    # Save processed data to reactive values
    processedData(data)
  })
  
  # Render the table only when the button is clicked
  output$table <- renderTable({
    data <- processedData()
    if (!is.null(data)) {
      # Format Start and End columns as time values
      data$Start <- format(data$Start, "%d-%m-%Y %I:%M %p")
      data$End <- format(data$End, "%d-%m-%Y %I:%M %p")
    }
    return(data)
  })
}

# Run the application
shinyApp(ui = ui, server = server)
