$(document).ready(function() {

    getLocationF();

    function getLocationF() {
        $.getJSON("https://ipapi.co/json/", function(ip) {
            console.log(ip);
            $("#ip-address").html("Your IP : " + ip.ip + "," + " " + ip.org + " " + ip.asn);
            $("#location-data").html(ip.latitude + "," + ip.longitude  +  " " + ip.city + ", " + ip.region + " " + ip.postal + " " + ip.country_name);
            var formattedPopulation = ip.country_population.toLocaleString(); // Menambahkan tiga titik sebagai pemisah ribuan
            $("#population").html("Population Country : " + formattedPopulation + " ");
            $("#currency_name").html("Currency : " + ip.currency_name + " ");
            
            // Create Google Maps link
            var mapsLink = "https://www.google.com/maps?authuser=0&q=" + ip.latitude + "," + ip.longitude;
            $("#maps-link").html('Location : <a href="' + mapsLink + '" target="_blank">View on Google Maps</a>');

            var countryCode = ip.country;
            var countryName = ip.country_name;
            var latitude = ip.latitude;
            var longitude = ip.longitude;

            getGDP(countryCode);
            getWeatherF(latitude, longitude); // Pass latitude and longitude to the weather function
            displaySeason(countryName); // Call function to display current season based on country

            // Fetch gold prices
            fetchGoldPrices();

            // Fetch earthquake data
            fetchEarthquakeData(latitude, longitude, countryName);

            // Get air quality data using latitude and longitude
            getAirQuality(latitude, longitude);

            // Fetch and display government system
            getGovernmentSystem(countryName);

            // Get country economic status
            getCountryEconomicStatus(countryCode);
              
            // Fetch and display economic system
            getEconomicSystem(countryName);

            getUnemploymentRate(countryCode);
        });
    }
});


//////////////////////////////////////////////////////////////////////////
    
// Function to get GDP data of a country using country code
function getGDP(countryCode) {
    // Get the current year and subtract two to get the previous year
    var currentYear = new Date().getFullYear();
    var previousYear = currentYear - 2;

    $.getJSON(`https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`, function(data) {
        if (data[1] && data[1].length > 0) {
            // Find the GDP value for the previous year
            var gdpData = data[1].find(entry => entry.date == previousYear);
            if (gdpData && gdpData.value) {
                var gdp = parseFloat(gdpData.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                var gdpPerCapita = parseFloat(gdpData.value / 1000000).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                var evolution = getEvolution(gdpPerCapita);
                $("#gdp").html(`GDP Country (${previousYear}) : $${gdp}<br>${evolution}`);
            } else {
                $("#gdp").html(`GDP Country (${previousYear}) : Data not available for this country`);
            }
        } else {
            $("#gdp").html(`GDP Country (${previousYear}) : Data not available for this country`);
        }
    });
}

// Function to get the evolution description based on GDP per capita
function getEvolution(gdpPerCapita) {
    if (gdpPerCapita < 1000) {
        return "Government Evolution: Focus on basic infrastructure development, poverty alleviation programs, and improving basic healthcare.";
    } else if (gdpPerCapita >= 1000 && gdpPerCapita < 10000) {
        return "Government Evolution: Major investments in infrastructure, policy reforms to support SMEs, enhancement of social welfare programs, and initiation of environmental policies.";
    } else if (gdpPerCapita >= 10000 && gdpPerCapita < 30000) {
        return "Government Evolution: Investment in research and development (R&D), international trade policies, development of stricter and sustainable environmental policies, and enhancement of universal social and healthcare programs.";
    } else if (gdpPerCapita >= 30000) {
        return "Government Evolution: Major investments in higher education and scientific research, development of policies to support the digital economy and Industry 4.0, very strict and sustainable environmental policies, and enhancement of advanced and efficient public services.";
    } else {
        return "Government Evolution: Data not available or invalid.";
    }
}


//////////////////////////////////////////////////////////////////////////

   // Function to get weather data using latitude and longitude
   function getWeatherF(latitude, longitude) {
    var apiKey = '74cc8a3c199f63bb2998825eb67ca8db'; // Replace with your actual API key
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    $.getJSON(apiUrl, function(weatherData) {
        var temperature = weatherData.main.temp;
        var humidity = weatherData.main.humidity;
        var windSpeed = weatherData.wind.speed;
        var weatherDescription = weatherData.weather[0].description;
        var rainfall = weatherData.rain ? weatherData.rain['1h'] || 0 : 0;

        // Determine the categories
        var temperatureCategory = categorizeTemperature(temperature);
        var humidityCategory = categorizeHumidity(humidity);
        var windSpeedCategory = categorizeWindSpeed(windSpeed);
        var rainfallCategory = categorizeRainfall(rainfall);

        $("#temperature").html("Temperature: " + temperature + "°C (" + temperatureCategory + ")");
        $("#weather").html("Weather: " + weatherDescription);
        $("#category").html("Humidity: " + humidity + "% (" + humidityCategory + ")<br>" +
                            "Wind Speed: " + windSpeed + " m/s (" + windSpeedCategory + ")<br>" +
                            "Rainfall: " + rainfall + " mm (" + rainfallCategory + ")");
    });
}

// Function to categorize temperature
function categorizeTemperature(temp) {
    if (temp < 0) {
        return 'Very Cold';
    } else if (temp >= 0 && temp < 10) {
        return 'Cold';
    } else if (temp >= 10 && temp < 20) {
        return 'Cool';
    } else if (temp >= 20 && temp < 30) {
        return 'Warm';
    } else if (temp >= 30 && temp < 40) {
        return 'Hot';
    } else {
        return 'Very Hot';
    }
}

// Function to categorize humidity
function categorizeHumidity(humidity) {
    if (humidity < 20) {
        return 'Very Dry';
    } else if (humidity >= 20 && humidity < 40) {
        return 'Dry';
    } else if (humidity >= 40 && humidity < 60) {
        return 'Normal';
    } else if (humidity >= 60 && humidity < 80) {
        return 'Humid';
    } else {
        return 'Very Humid';
    }
}

// Function to categorize wind speed
function categorizeWindSpeed(windSpeed) {
    if (windSpeed < 5) {
        return 'Calm';
    } else if (windSpeed >= 5 && windSpeed < 15) {
        return 'Breezy';
    } else if (windSpeed >= 15 && windSpeed < 30) {
        return 'Windy';
    } else if (windSpeed >= 30 && windSpeed < 50) {
        return 'Very Windy';
    } else {
        return 'Stormy';
    }
}

// Function to categorize rainfall
function categorizeRainfall(rainfall) {
    if (rainfall === 0) {
        return 'No Rain';
    } else if (rainfall > 0 && rainfall <= 2.5) {
        return 'Light Rain';
    } else if (rainfall > 2.5 && rainfall <= 7.5) {
        return 'Moderate Rain';
    } else if (rainfall > 7.5 && rainfall <= 15) {
        return 'Heavy Rain';
    } else {
        return 'Very Heavy Rain';
    }
}

//////////////////////////////////////////////////////////////////////////

 // Function to determine current period of the day
function getCurrentPeriod(hours) {
    if (hours >= 6 && hours < 10) {
      return "Morning";
    } else if (hours >= 10 && hours < 14) {
      return "Midday";
    } else if (hours >= 14 && hours < 17) {
      return "Afternoon";
    } else if (hours >= 17 && hours < 18) {
      return "Evening";
    } else if (hours >= 18 && hours < 19) {
      return "Dusk";
    } else if (hours >= 19 && hours < 24) {
      return "Night";
    } else if (hours >= 0 && hours < 3) {
      return "Early Morning";
    } else {
      return "Dawn";
    }
  }
  
  // Function to display current season based on location
  function displaySeason(countryName) {
    var now = new Date();
    var month = now.getMonth() + 1; // Months are zero indexed, so add 1
  
    var season;
    if (countryName === "Indonesia") {
      if (month >= 12 || month <= 2) {
        season = "Rainy Season";
      } else if (month >= 6 && month <= 9) {
        season = "Dry Season";
      } else {
        season = "Transition Season";
      }
    } else if (countryName === "Asia" || countryName === "Europe") {
      if (month >= 3 && month <= 5) {
        season = "Spring";
      } else if (month >= 6 && month <= 8) {
        season = "Summer";
      } else if (month >= 9 && month <= 11) {
        season = "Autumn";
      } else {
        season = "Winter";
      }
    } else if (countryName === "Africa") {
      if (month >= 6 && month <= 8) {
        season = "Winter";
      } else if (month >= 9 && month <= 11) {
        season = "Spring";
      } else {
        season = "Summer";
      }
    } else if (countryName === "North America" || countryName === "South America") {
      if (month >= 3 && month <= 5) {
        season = "Spring";
      } else if (month >= 6 && month <= 8) {
        season = "Summer";
      } else if (month >= 9 && month <= 11) {
        season = "Autumn";
      } else {
        season = "Winter";
      }
    } else if (countryName === "Australia" || countryName === "Oceania") {
      if (month >= 3 && month <= 5) {
        season = "Autumn";
      } else if (month >= 6 && month <= 8) {
        season = "Winter";
      } else if (month >= 9 && month <= 11) {
        season = "Spring";
      } else {
        season = "Summer";
      }
    } else if (countryName === "Antarctica") {
      if (month >= 3 && month <= 10) {
        season = "Summer";
      } else {
        season = "Winter";
      }
    } else {
      season = "Unknown Location";
    }
    $("#season").html("Season: " + season);
  }
  
  // JavaScript to display current date, time, day, and period of the day
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
  
    // Determine the current period of the day
    var currentPeriod = getCurrentPeriod(hours);
  
    // Display date, time, day, and period of the day
    $("#current-date").html("Date: " + formattedDate);
    $("#current-time").html("Time: " + formattedTime);
    $("#current-day").html("Day: " + dayOfWeek);
    $("#current-period").html("Current Period: " + currentPeriod);
  
    // Example: display season for Indonesia
    displaySeason("Indonesia");
  });
  

//////////////////////////////////////////////////////////////////////////

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


//////////////////////////////////////////////////////////////////////////

// Function to fetch gold prices
function fetchGoldPrices() {
    var apiKey = 'goldapi-cnvkiwslub8f06p-io';
    var apiUrl = 'https://www.goldapi.io/api/XAU/USD';
    var exchangeRateUrl = 'https://api.exchangerate-api.com/v4/latest/USD'; // URL untuk mendapatkan nilai tukar USD ke IDR

    $.ajax({
        url: apiUrl,
        type: 'GET',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('x-access-token', apiKey);
        },
        success: function(data) {
            var goldPricePerOunce = data.price;
            var goldPricePerGram = goldPricePerOunce / 31.1035; // Konversi ke per gram
            
            // Memperbarui harga emas dalam dolar
            $("#gold-price-usd").html("Gold Price (per gram, USD) : $" + goldPricePerGram.toFixed(2));
            
            // Mengambil nilai tukar dari USD ke IDR
            $.ajax({
                url: exchangeRateUrl,
                type: 'GET',
                success: function(rateData) {
                    var exchangeRate = rateData.rates.IDR; // Mendapatkan nilai tukar dari USD ke IDR
                    var goldPricePerGramIDR = goldPricePerGram * exchangeRate; // Mengonversi harga emas dari dolar ke rupiah
                    $("#gold-price-idr").html("Gold Price (per gram, IDR) : Rp " + goldPricePerGramIDR.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")); // Menampilkan harga emas dalam rupiah dengan titik nol
                },
                error: function(xhr, status, error) {
                    console.error("Error fetching exchange rate:", error);
                }
            });
        },
        error: function(xhr, status, error) {
            console.error("Error fetching gold prices:", error);
        }
    });
}

//////////////////////////////////////////////////////////////////////////

function fetchEarthquakeData(latitude, longitude, userCountryName) {
    const usgsApiUrl = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`;
    const bmkgApiUrl = `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.xml`;

    // Fetch USGS data
    $.get(usgsApiUrl, function(usgsData) {
        // Fetch BMKG data
        $.ajax({
            url: bmkgApiUrl,
            method: 'GET',
            dataType: 'xml',
            success: function(bmkgData) {
                displayEarthquakeData(usgsData, bmkgData, latitude, longitude, userCountryName);
            }
        });
    });
}

function displayEarthquakeData(usgsData, bmkgData, latitude, longitude, userCountryName) {
    const usgsEarthquakes = usgsData.features;

    // Parse BMKG XML data
    const bmkgEarthquakes = [];
    $(bmkgData).find('gempa').each(function() {
        const time = $(this).find('DateTime').text();
        const magnitude = parseFloat($(this).find('Magnitude').text());
        const coordinates = [
            parseFloat($(this).find('Lintang').text().replace(' LS', '')) * (($(this).find('Lintang').text().includes('LS')) ? -1 : 1),
            parseFloat($(this).find('Bujur').text().replace(' BT', '')) * (($(this).find('Bujur').text().includes('BT')) ? -1 : 1)
        ];
        const place = $(this).find('Wilayah').text();

        bmkgEarthquakes.push({
            time: new Date(time).getTime(),
            magnitude: magnitude,
            coordinates: coordinates,
            place: place,
            source: 'BMKG'
        });
    });

    // Combine and sort by time
    const combinedEarthquakes = usgsEarthquakes.map(eq => ({
        time: eq.properties.time,
        magnitude: eq.properties.mag,
        coordinates: eq.geometry.coordinates,
        place: eq.properties.place,
        source: 'USGS'
    })).concat(bmkgEarthquakes).sort((a, b) => b.time - a.time);

    if (combinedEarthquakes.length === 0) {
        $('#earthquake-data').html('<p>No recent earthquakes found.</p>');
        return;
    }

    // Find the most recent earthquake
    const latestEarthquake = combinedEarthquakes[0];

    const place = latestEarthquake.place;
    const magnitude = latestEarthquake.magnitude;
    const time = new Date(latestEarthquake.time).toLocaleString();
    const coordinates = latestEarthquake.coordinates;
    const distance = calculateDistance(latitude, longitude, coordinates[0], coordinates[1]);
    const countryName = (latestEarthquake.source === 'USGS') ? extractCountryFromPlace(place) : userCountryName;

    const earthquakeHtml = `
        <a class="list-group-item list-group-item-action flex-column align-items-start">
            <div class="d-flex w-100 justify-content-between">
                <h3>Earthquake :</h3>
                <small class="mb-1">Magnitude: ${magnitude}</small>
                <small>${time}</small>
            </div>
            <small class="mb-1">${place}</small>
            <small>Distance: ${distance.toFixed(2)} km</small><br>
            <small>Country: ${countryName}</small><br>
            <small>Source: ${latestEarthquake.source}</small>
        </a>`;

    $('#earthquake-data').html(earthquakeHtml);
}

function extractCountryFromPlace(place) {
    // Extract country from the place string. This is a simple heuristic and might need improvement.
    const parts = place.split(',');
    return parts.length > 1 ? parts[parts.length - 1].trim() : 'Unknown';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

//////////////////////////////////////////////////////////////////////////

async function checkInternetSpeed() {
    const statusElement = document.getElementById('status');
    const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif'; // URL of the test image
    const imageSize = 512000; // Size of the image in bytes (512 KB)

    try {
        statusElement.textContent = "Checking internet speed...";
        const startTime = new Date().getTime();

        const response = await fetch(testImageUrl, { method: 'GET', cache: 'no-cache' });
        if (!response.ok) throw new Error('Network response was not ok');

        await response.blob();

        const endTime = new Date().getTime();
        const duration = (endTime - startTime) / 1000; // Duration in seconds
        const bitsLoaded = imageSize * 8;
        const speedBps = bitsLoaded / duration; // Speed in bits per second
        const speedKbps = speedBps / 1024; // Speed in kilobits per second
        const speedMbps = speedKbps / 1024; // Speed in megabits per second

        statusElement.textContent = `Detected internet speed: ${speedMbps.toFixed(2)} Mbps`;
    } catch (error) {
        statusElement.textContent = "Failed to check internet speed.";
        console.error('Error checking internet speed:', error);
    }
}

window.addEventListener('load', checkInternetSpeed);

//////////////////////////////////////////////////////////////////////////

// Function to translate the page
function translatePage() {
    const language = document.getElementById('languageSelect').value;
    const content = document.getElementById('content').innerText;

    // API URL for Google Translate
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${language}&dt=t&q=${encodeURIComponent(content)}`;

    // Fetch the translation
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const translatedText = data[0].map(item => item[0]).join('');
            document.getElementById('content').innerText = translatedText;
        })
        .catch(error => console.error('Error:', error));
}

//////////////////////////////////////////////////////////////////////////

function getGovernmentSystem(countryName) {
    var apiUrl = "https://raw.githubusercontent.com/alfatah/alfatah.github.io/master/API/systemGovernment.json";

    // Lakukan request GET menggunakan AJAX untuk mengambil data dari API
    $.ajax({
        url: apiUrl,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            // Cari sistem pemerintahan berdasarkan nama negara
            var governmentSystem = data.countries.find(country => country.name === countryName);

            if (governmentSystem) {
                var governmentHtml = "Government System : " + governmentSystem.government;

                // Cari halaman Wikipedia berdasarkan nama negara
                var wikiUrl = "https://en.wikipedia.org/wiki/" + countryName.replace(/\s+/g, '_');

                // Tambahkan link Wikipedia jika halaman ditemukan
                governmentHtml += ' (<a href="' + wikiUrl + '" target="_blank">Wikipedia</a>)';

                $("#government-system").html(governmentHtml);
            } else {
                $("#government-system").html("Government System : Data not found");
            }
        },
        error: function() {
            $("#government-system").html("Failed to fetch data from the API");
        }
    });
}


//////////////////////////////////////////////////////////////////////////

async function getCountryEconomicStatus(countryCode) {
    const response = await fetch(`https://api.worldbank.org/v2/country/${countryCode}?format=json`);
    const data = await response.json();
    const country = data[1][0];

    const economicStatus = categorizeEconomicStatus(country.incomeLevel.value);
    displayCountryEconomicStatus(country.name, economicStatus);
}

function categorizeEconomicStatus(incomeLevel) {
    if (incomeLevel === "High income") {
        return "High-Income Country";
    } else if (incomeLevel === "Upper middle income") {
        return "Upper-Middle-Income Developing Country";
    } else if (incomeLevel === "Lower middle income") {
        return "Lower-Middle-Income Developing Country";
    } else if (incomeLevel === "Low income") {
        return "Low-Income Country";
    }
    return "Unknown";
}

function displayCountryEconomicStatus(countryName, economicStatus) {
    const outputDiv = document.getElementById('output');
    const countryDiv = document.createElement('div');
    countryDiv.innerHTML = `Economic Status : ${economicStatus}`;
    outputDiv.appendChild(countryDiv);
}

async function main() {
    getLocationF();
}

main();


//////////////////////////////////////////////////////////////////////////

function getEconomicSystem(countryName) {
    const apiUrl = "https://raw.githubusercontent.com/alfatah/alfatah.github.io/master/API/economicSystem.json";

    // Lakukan request GET menggunakan fetch untuk mengambil data dari API
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Cari sistem ekonomi berdasarkan nama negara
            const economicSystem = data.countries.find(country => country.name === countryName);
            
            if (economicSystem) {
                const economicHtml = `Economic System : ${economicSystem.economic_system}`;
                $("#economic-system").html(economicHtml);
            } else {
                $("#economic-system").html("Economic System: Data not found");
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            $("#economic-system").html("Failed to fetch data from the API");
        });
}



//////////////////////////////////////////////////////////////////////////

async function getUnemploymentRate(countryCode) {
    if (!countryCode) {
        alert('Country code not found.');
        return;
    }

    const apiUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/SL.UEM.TOTL.ZS?format=json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        displayData(data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        document.getElementById('unemploymentData').innerHTML = '<p>Failed to fetch data.</p>';
    }
}

function displayData(data) {
    const unemploymentDataDiv = document.getElementById('unemploymentData');
    const unemploymentCategoryDiv = document.getElementById('unemploymentCategory');
    
    if (data.length > 1 && data[1].length > 0) {
        let latestData = null;
        for (let i = 0; i < data[1].length; i++) {
            if (data[1][i].value !== null) {
                latestData = data[1][i];
                break;
            }
        }

        if (latestData) {
            const year = latestData.date;
            const value = latestData.value;
            unemploymentDataDiv.innerHTML = `The unemployment rate in ${year} is ${value.toFixed(2)}%.`;
            classifyUnemploymentRate(value, unemploymentCategoryDiv);
        } else {
            unemploymentDataDiv.innerHTML = 'Unemployment rate data is not available.';
        }
    } else {
        unemploymentDataDiv.innerHTML = 'Data not available.';
    }
}

function classifyUnemploymentRate(rate, categoryDiv) {
    let category;
    if (rate < 2) {
        category = "Very Low: Less than 2% <br> This indicates a very robust labor market with minimal unemployment.";
    } else if (rate >= 2 && rate <= 5) {
        category = "Low: Between 2% to 5% <br> This is still considered a low unemployment rate with a majority of the workforce employed.";
    } else if (rate > 5 && rate <= 10) {
        category = "Moderate: Between 5% to 10% <br> This range is common in many countries, reflecting a mix of available jobs and individuals seeking employment.";
    } else if (rate > 10 && rate <= 20) {
        category = "High: Between 10% to 20% <br> This indicates a high level of unemployment, often occurring in unstable economic conditions or during economic crises.";
    } else {
        category = "Very High: More than 20% <br> This signifies an extremely high unemployment rate, typically associated with severe economic crises.";
    }
    categoryDiv.innerHTML = `Unemployment Rate Category :<br>${category}`;
}


//////////////////////////////////////////////////////////////////////////