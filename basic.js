$(document).ready(function() {

    getLocationF();

    function getLocationF() {
        $.getJSON("https://ipapi.co/json/", function(ip) {
            console.log(ip);
            $("#ip-address").html("Your IP : " + ip.ip + "," + " " + ip.org + " " + ip.asn);
            $("#location-data").html(ip.latitude + "," + ip.longitude + " " + ip.city + ", " + ip.region + " " + ip.postal + " " + ip.country_name);
            $("#population").html("Population Country : " + ip.country_population + " ");

            // Get country code from IP data
            var countryCode = ip.country;
            getGDP(countryCode);
            
            getWeatherF(ip.latitude, ip.longitude); // Pass latitude and longitude to the weather function
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

            $("#temperature").html("Temperature: " + temperature + "°C");
            $("#weather").html("Weather: " + weatherDescription);
        });
    }

});
