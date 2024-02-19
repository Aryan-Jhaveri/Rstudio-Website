# Install and load required packages
if (!requireNamespace("shiny", quietly = TRUE)) {
  install.packages("shiny")
}
install.packages(c("purrr", "lubridate", "rvest", "dplyr"))

library(shiny)
library(xml2)
library(tidyverse)
library(lubridate)
library(rvest)
library(httr)  # Add this line

# Function to process events data
process_events_data <- function(xml_url) {
  # Download XML content
  xml_content <- content(GET(xml_url), as = "text", encoding = "UTF-8")
  
  # Replace relative namespace URIs with absolute URIs
  xml_content_fixed <- gsub('xmlns="events"', 'xmlns="https://example.com/events"', xml_content)
  
  # Parse XML data
  xml_file <- read_xml(xml_content_fixed, encoding = "UTF-8")
  
  # Extract item nodes
  items <- xml_find_all(xml_file, ".//item")
  
  # Define a function to extract data from an item node
  extract_item_data <- function(item) {
    data <- list(
      title = xml_text(xml_find_first(item, ".//title")),
      description = xml_text(xml_find_first(item, ".//description")),
      category = xml_text(xml_find_first(item, ".//category")),
      start = xml_text(xml_find_first(item, ".//start")),
      end = xml_text(xml_find_first(item, ".//end")),
      location = xml_text(xml_find_first(item, ".//location")),
      status = xml_text(xml_find_first(item, ".//status"))
    )
    return(data)
  }
  
  # Map over items and extract data
  items_data <- map_df(items, extract_item_data)
  
  return(items_data)
}

# Define UI
ui <- fluidPage(
  titlePanel("Events Data Processing"),
  textInput("xml_url", "Enter XML URL:", "https://experiencebu.brocku.ca/events.rss"),
  dateInput("selected_week", "Select Week:", value = Sys.Date(), weekstart = 0),
  actionButton("process_button", "Process Events"),
  tableOutput("result_output")
)

# Define server logic
server <- function(input, output) {
  processed_events <- eventReactive(input$process_button, {
    xml_url <- input$xml_url
    
    # Use tryCatch for error handling
    result <- tryCatch(
      {
        # Process events data
        events_data <- process_events_data(xml_url)
        
        # Filter events for the selected week
        selected_week <- input$selected_week
        start_of_week <- selected_week - (lubridate::wday(selected_week) - 1)
        end_of_week <- start_of_week + 6
        events_data %>%
          filter(between(as.Date(start), start_of_week, end_of_week))
      },
      error = function(e) {
        # Log the error message to console
        cat("Error in process_events_data:", conditionMessage(e), "\n")
        # Return NULL to indicate failure
        NULL
      }
    )
    
    return(result)
  })
  
  output$result_output <- renderTable({
    if (!is.null(processed_events())) {
      processed_events()
    }
  })
}

# Run the application
shinyApp(ui, server)
