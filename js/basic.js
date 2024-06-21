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

            // Get country code from IP data
            var countryCode = ip.country;
            getGDP(countryCode);
            
            getWeatherF(ip.latitude, ip.longitude); // Pass latitude and longitude to the weather function
            displaySeason(ip.country_name); // Call function to display current season based on country

            // Fetch gold prices
            fetchGoldPrices();

            // Fetch earthquake data
            fetchEarthquakeData(ip.latitude, ip.longitude, ip.country_name);

            // Get air quality data using latitude and longitude
            getAirQuality(ip.latitude, ip.longitude);

            // Get country code from IP data
            var countryCode = ip.country;
            getGDP(countryCode);

            // Fetch and display government system
            getGovernmentSystem(ip.country_name);

              // Get country code from IP data
              var countryCode = ip.country;
              getCountryEconomicStatus(countryCode);


        });
    }
});



//////////////////////////////////////////////////////////////////////////
    
// Function to get GDP data of a country using country code
function getGDP(countryCode) {
    // Get the current year and subtract one to get the previous year
    var currentYear = new Date().getFullYear();
    var previousYear = currentYear - 2;

    $.getJSON(`https://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`, function(data) {
        if (data[1] && data[1].length > 0) {
            // Find the GDP value for the previous year
            var gdpData = data[1].find(entry => entry.date == previousYear);
            if (gdpData && gdpData.value) {
                var gdp = parseFloat(gdpData.value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                $("#gdp").html(`GDP Country (${previousYear}) : $${gdp}`);
            } else {
                $("#gdp").html(`GDP Country (${previousYear}) : Data not available for this country`);
            }
        } else {
            $("#gdp").html(`GDP Country (${previousYear}) : Data not available for this country`);
        }
    });
}

//////////////////////////////////////////////////////////////////////////

   // Function to get weather data using latitude and longitude
function getWeatherF(latitude, longitude) {
    var apiKey = '74cc8a3c199f63bb2998825eb67ca8db'; // Replace 'YOUR_WEATHER_API_KEY' with your actual API key
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    $.getJSON(apiUrl, function(weatherData) {
        var temperature = weatherData.main.temp;
        var weatherDescription = weatherData.weather[0].description;

        // Determine the category based on the temperature
        var category = getCategory(temperature);

        $("#temperature").html("Temperature: " + temperature + "°C");
        $("#weather").html("Weather: " + weatherDescription);
        $("#category").html("Category: " + category);
    });
}

// Function to determine the category based on temperature
function getCategory(temperature) {
    if (temperature < 0) {
        return "Very Cold";
    } else if (temperature >= 0 && temperature < 15) {
        return "Cold";
    } else if (temperature >= 15 && temperature < 20) {
        return "Cool";
    } else if (temperature >= 20 && temperature < 25) {
        return "Normal/Comfortable";
    } else if (temperature >= 25 && temperature < 30) {
        return "Warm";
    } else if (temperature >= 30 && temperature < 35) {
        return "Hot";
    } else {
        return "Very Hot";
    }
}



//////////////////////////////////////////////////////////////////////////

  // Function to display current season based on location
  function displaySeason(countryName) {
    var now = new Date();
    var month = now.getMonth() + 1; // Months are zero indexed, so add 1

    var season;
    if (countryName === "Indonesia") {
        if (month >= 12 || month <= 2) {
            season = "Rainy Season";
        } else if (month >= 6 && month <= 9) {
            season = "Dry Season ";
        } else {
            season = "Transition Season";
        }
        $("#season").html("Season: " + season);
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
        $("#season").html("Season: " + season);
    } else if (countryName === "Africa") {
        if (month >= 6 && month <= 8) {
            season = "Winter";
        } else if (month >= 9 && month <= 11) {
            season = "Spring";
        } else {
            season = "Summer";
        }
        $("#season").html("Season: " + season);
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
        $("#season").html("Season: " + season);
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
        $("#season").html("Season: " + season);
    } else if (countryName === "Antarctica") {
        if (month >= 3 && month <= 10) {
            season = "Summer";
        } else {
            season = "Winter";
        }
        $("#season").html("Season: " + season);
    } else {
        $("#season").html("Unknown Location");
    }
}


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
