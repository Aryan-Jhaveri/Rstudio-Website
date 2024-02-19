# Events Data Processing Shiny App

This Shiny app processes events data from an XML source and displays the results.

## Usage

1. Enter the XML URL in the provided text box.
2. Select a week using the date input.
3. Click the "Process Events" button.
4. View the processed events in the table.

## Repository Structure

- `app.R`: Main R script containing the Shiny app code.
- `README.md`: Documentation for the Shiny app.

## How to Run

To run the Shiny app locally:

1. Install required packages by running `install.packages(c("shiny", "purrr", "lubridate", "rvest", "dplyr"))`.
2. Open the `app.R` file in RStudio.
3. Click the "Run App" button in RStudio.

