$(document).ready(function() {

    getLocationF();

    function getLocationF() {
        $.getJSON("https://ipapi.co/json/", function(ip) {
            console.log(ip);
            $("#ip-address").html("Your IP : " + ip.ip + "," + " " + ip.org + " " + ip.asn);
            $("#location-data").html(ip.latitude + "," + ip.longitude + " " + ip.city + ", " + ip.region + " " + ip.postal + " " + ip.country_name);
            $("#population").html("Population Country : " + ip.country_population + " ");
            $("#currency_name").html("Currency : " + ip.currency_name + " ");

            // Get country code from IP data
            var countryCode = ip.country;
            getGDP(countryCode);
            
            getWeatherF(ip.latitude, ip.longitude); // Pass latitude and longitude to the weather function
            displaySeason(); // Call function to display current season

             // Fetch gold prices
            fetchGoldPrices();
        });
    }
    
    // Function to get GDP data of a country using country code
    function getGDP(countryCode) {
        $.getJSON(`https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`, function(data) {
            var gdp = "Not Available";
            if (data[1] && data[1][0] && data[1][0].value) {
                gdp = data[1][0].value;
            }
            $("#gdp").html("GDP Country : " + gdp);
        });
    }

    // Function to get weather data using latitude and longitude
    function getWeatherF(latitude, longitude) {
        var apiKey = '74cc8a3c199f63bb2998825eb67ca8db'; // Replace 'YOUR_WEATHER_API_KEY' with your actual API key
        var apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        $.getJSON(apiUrl, function(weatherData) {
            var temperature = weatherData.main.temp;
            var weatherDescription = weatherData.weather[0].description;

            $("#temperature").html("Temperature : " + temperature + "°C");
            $("#weather").html("Weather : " + weatherDescription);
        });
    }

    // Function to display current season
    function displaySeason() {
        var now = new Date();
        var month = now.getMonth() + 1; // Months are zero indexed, so add 1
        
        var season;
        if (month >= 3 && month <= 5) {
            season = "Spring";
        } else if (month >= 6 && month <= 8) {
            season = "Summer";
        } else if (month >= 9 && month <= 11) {
            season = "Autumn";
        } else {
            season = "Winter";
        }
        
        $("#season").html("Season : " + season);
    }

});

  // JavaScript to display current date, time, and day
  $(document).ready(function() {
    // Get current date
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1; // Months are zero based
    var year = currentDate.getFullYear();
    var formattedDate = day + '/' + month + '/' + year;

    // Get current time
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var seconds = currentDate.getSeconds();
    var formattedTime = hours + ':' + minutes + ':' + seconds;

    // Get current day
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayOfWeek = days[currentDate.getDay()];

    // Display date, time, and day
    $("#current-date").html("Date : " + formattedDate);
    $("#current-time").html("Time : " + formattedTime);
    $("#current-day").html("Day : " + dayOfWeek);
});



// Function to get air quality data using latitude and longitude
function getAirQuality(latitude, longitude) {
    var apiKey = 'a01ca450-9bc6-4163-84dc-e37f7128b4f2'; // Ganti dengan kunci API AirVisual Anda
    var apiUrl = `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${apiKey}`;

    $.getJSON(apiUrl, function(airData) {
        var airQualityIndex = airData.data.current.pollution.aqius;
        var airQualityCategory = getAirQualityCategory(airQualityIndex);

        $("#air-quality-index").html("Air Quality Index : " + airQualityIndex);
        $("#air-quality-category").html("Air Quality Category : " + airQualityCategory);
    });
}

// Function to determine air quality category based on air quality index (AQI)
function getAirQualityCategory(aqi) {
    if (aqi <= 50) {
        return "Good";
    } else if (aqi <= 100) {
        return "Moderate";
    } else if (aqi <= 150) {
        return "Unhealthy for Sensitive Groups";
    } else if (aqi <= 200) {
        return "Unhealthy";
    } else if (aqi <= 300) {
        return "Very Unhealthy";
    } else {
        return "Hazardous";
    }
}

// Panggil fungsi getLocationF di dalam $(document).ready
$(document).ready(function() {
    getLocationF();
});

// Update getLocationF function to call getAirQuality
function getLocationF() {
    $.getJSON("https://ipapi.co/json/", function(ip) {
        console.log(ip);

        // Get air quality data using latitude and longitude
        getAirQuality(ip.latitude, ip.longitude);

        // Get country code from IP data
        var countryCode = ip.country;
        getGDP(countryCode);

        getWeatherF(ip.latitude, ip.longitude); // Pass latitude and longitude to the weather function
        displaySeason(); // Call function to display current season
    });
}

  // Function to fetch gold prices
  function fetchGoldPrices() {
    var apiKey = 'goldapi-cnvkiwslub8f06p-io';
    var apiUrl = 'https://www.goldapi.io/api/XAU/USD';

    $.ajax({
        url: apiUrl,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', apiKey);
        },
        success: function(data) {
            var goldPrice = data.price;
            $("#gold-price").html("Gold Price (per ounce) : $" + goldPrice.toFixed(2));
        },
        error: function(xhr, status, error) {
            console.error("Error fetching gold prices:", error);
        }
    });
}

