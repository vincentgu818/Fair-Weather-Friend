# Fair Weather Friend

Fair Weather Friend compares the weather forecast with weather-related criteria provided by the user and generates a heatmap of matching hourly intervals. The more brightly colored an interval is the more of the user's criteria that hour's forecast matches. The app is most useful to users who have a keen interest in specific weather conditions (e.g. event planners, photographers, athletes) or who live in regions with erratic weather.

## Live Site

A live site running the app can be accessed at:
https://vincentgu818.github.io/Fair-Weather-Friend/

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need API keys from the two weather APIs. They can be acquired by signing up for accounts here:
* https://darksky.net/dev/docs
* https://openweathermap.org/api

Once acquired, please replace the given ones with your own in the callAPIs method on lines 104 and 118.

### Installing

Step 1

Clone the repository at https://github.com/vincentgu818/Fair-Weather-Friend/

Step 2

Edit index.html, main.css and app.js according to your developmental intentions.

Step 3

Open index.html in a browser to test your changes.

## Approach Taken

The user input is volunteered to make up an object of parameters in up to six dimensions of weather. Meanwhile, weather forecast data is collected on those six dimensions for the following 120 hours from Dark Sky and Open Weather Maps. The object of user parameters is then compared with hourly forecast data to populate a heatmap. The more user parameters are satisfied the greener the cell. For example, if an hour's forecast satisfies the user's parameters for wind, cloud cover and precipitation but not temperature (3 of 4), the cell is given a 0.75*255 value for green as its background color. A "tooltip" containing the exact values for each of the criteria the user was interested in is displayed if the user hovers over each cell of the heatmap.

## Unsolved Problems

### Universal Locations

The app is limited to 13 hard-coded locations. The app may be further developed to be used for any user-inputted zip code. This would require some way to look up latitude and longitude coordinates for a given zip code. The developer began searching for an API that would assist with this, but did not succeed.

### Weather Data Quality/Availability

Several fields of weather data are available or have a different meaning in the Dark Sky API but not in the Open Weather Map one. Currently, the app either ignores or tries to make adjustments for the disparity between the two APIs. No apparent solution is known at this time.

## Built With

* Ajax is used to call the weather APIs.
* jQuery is used to dynamically manipulate the DOM of the heatmap.
* Tooltips are used to display the weather details as the user hovers over the heatmap.

## Authors

* **Vincent Gu** - *Initial work* - [vincentgu818](https://github.com/vincentgu818)

## Acknowledgments

* This app was brought to you by all those times I've opened the New England forecast looking for a decent time to go outside.
