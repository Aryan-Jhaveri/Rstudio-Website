from flask import Flask, render_template
import pandas as pd
from datetime import datetime
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)

@app.route('/')
def index():
    # Event processing logic
    url = "https://experiencebu.brocku.ca/events.rss"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'xml')
    events = soup.find_all('item')

    data = {
        'Title': [],
        'Link': [],
        'Start': [],
        'descriptions': [],
        'End': [],
        'Status': [],
        'Enclosure': []
    }

    for event in events:
        data['Title'].append(event.find('title').text)
        data['Link'].append(event.find('link').text)
        data['Start'].append(event.find('start').text)
        data['descriptions'].append(event.find('description').text)
        data['End'].append(event.find('end').text)
        data['Status'].append(event.find('status', {'xmlns': 'events'}).text)
        data['Enclosure'].append(event.find('enclosure')['url'])

    df = pd.DataFrame(data)
    df = df.dropna(subset=['Start', 'End'])

    for i, description in enumerate(df['descriptions']):
        html_content = BeautifulSoup(description, 'html.parser')
        text_content = html_content.get_text()
        df.at[i, 'descriptions'] = text_content

    df['Start'] = pd.to_datetime(df['Start']).dt.tz_localize('GMT').dt.tz_convert('EST')
    df['End'] = pd.to_datetime(df['End']).dt.tz_localize('GMT').dt.tz_convert('EST')

    selected_week = pd.date_range(datetime.now().date(), datetime.now().date() + pd.DateOffset(days=6))
    selected_data = df[(df['Start'] >= selected_week[0]) & (df['End'] <= selected_week[-1])]

    selected_data['Start'] = selected_data['Start'].dt.strftime('%d-%m-%Y %I:%M %p')
    selected_data['End'] = selected_data['End'].dt.strftime('%d-%m-%Y %I:%M %p')

    return render_template('index.html', data=selected_data.to_dict(orient='records'))

if __name__ == '__main__':
    app.run(debug=True)
