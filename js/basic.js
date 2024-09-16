$(document).ready(function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('location').innerText = "Geolocation is not supported by this browser.";
    }

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        document.getElementById('location').innerText = `Latitude, Longitude: ${latitude}, ${longitude}`;
        const mapsLink = `https://www.google.com/maps?authuser=0&q=${latitude},${longitude}`;
        document.getElementById('maps-link').innerHTML = `Location: <a href="${mapsLink}" target="_blank">View on Google Maps</a>`;

        getLocationF(latitude, longitude);
    }

    function showError(error) {
        const errorMessages = {
            1: "User denied the request for Geolocation.",
            2: "Location information is unavailable.",
            3: "The request to get user location timed out.",
            0: "An unknown error occurred."
        };
        document.getElementById('location').innerText = errorMessages[error.code] || "An unknown error occurred.";
    }

    function getLocationF(latitude, longitude) {
        $.getJSON("https://ipapi.co/json/", function(ip) {
            $("#ip-address").html(`Your IP: ${ip.ip}, ${ip.org}, ${ip.asn}`);

            // Provider information based on ASN
            const providerInfo = getProviderInfo(ip.asn);
            $("#provider-info").html(providerInfo);

            // Display location data
            const locationData = `${ip.latitude},${ip.longitude}, ${ip.timezone}, ${ip.city}, ${ip.region}, ${ip.postal}, ${ip.country_name}`;
            $("#location-data").html(locationData);

            // Display formatted population and currency
            const formattedPopulation = Number(ip.country_population).toLocaleString();
            $("#population").html(`Country Population: ${formattedPopulation}`);
            $("#currency_name").html(`Currency: ${ip.currency_name}`);

            // Get population features
            const populationFeatures = getCountryFeaturesByPopulation(ip.country_population);
            $("#population-features").html(`Category: ${populationFeatures.category}<br>Description: ${populationFeatures.description}`);

            // Display Country Calling Code
            $("#country-code").html(`Country Calling Code: ${ip.country_calling_code}`);

            // Call functions with latitude, longitude, and country code
            getGDP(ip.country);
            getWeatherF(latitude, longitude);
            displaySeason(ip.country_name);
            fetchGoldPrices();
            fetchEarthquakeData(latitude, longitude, ip.country_name);
            getAirQuality(latitude, longitude);
            getGovernmentSystem(ip.country_name);
            getCountryEconomicStatus(ip.country);
            getUnemploymentRate(ip.country);
            fetchHolidays(ip.country);
            getWeatherAndUVIndex(latitude, longitude);
        });
    }

    // Helper function for provider info based on ASN
    function getProviderInfo(asn) {
        const providers = {
            'AS4761': {
                url: "https://www.indosatooredoo.com/",
                name: "Indosat Ooredoo Hutchison",
                additionalUrl: "https://bima.tri.co.id/",
                additionalName: "Tri"
            },
            'AS5413': { url: "https://www.xl.co.id/", name: "XL Axiata" },
            'AS9583': { url: "https://my.telkomsel.com/web", name: "Telkom Indonesia (IndiHome)" },
            'AS134453': { url: "https://www.smartfren.com/", name: "Smartfren" }
        };
        const provider = providers[asn] || { name: `ASN: ${asn}`, description: "Information not available" };

        return `
            Provider: <a href="${provider.url || '#'}" target="_blank">${provider.name || provider.description}</a>
            ${provider.additionalUrl ? `<br><a href="${provider.additionalUrl}" target="_blank">${provider.additionalName}</a>` : ''}
        `;
    }

    // Add external helper functions for GDP, weather, season, etc. here...
});



//////////////////////////////////////////////////////////////////////////
    
// Function to get GDP data of a country using country code
function getGDP(countryCode) {
    // Get the current year and subtract two to get the previous year
    var currentYear = new Date().getFullYear();
    var previousYear = currentYear - 1;

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
    // Remove commas and convert to a float for numerical comparison
    gdpPerCapita = parseFloat(gdpPerCapita.replace(/,/g, ''));

    if (isNaN(gdpPerCapita)) {
        return "Government Evolution: Data not available or invalid.";
    }

    let grade = "";
    if (gdpPerCapita < 1000) {
        grade = "Grade: Low Income";
        return `${grade}. Government Evolution: At this stage, the focus is on basic infrastructure development, poverty alleviation programs, and improving basic healthcare services.`;
    } else if (gdpPerCapita >= 1000 && gdpPerCapita < 5000) {
        grade = "Grade: Lower-Middle Income";
        return `${grade}. Government Evolution: Significant investments in infrastructure, policy reforms to support small and medium enterprises (SMEs), enhancement of social welfare programs, and initiation of environmental policies are emphasized.`;
    } else if (gdpPerCapita >= 5000 && gdpPerCapita < 15000) {
        grade = "Grade: Upper-Middle Income";
        return `${grade}. Government Evolution: Investment in research and development (R&D), formulation of international trade policies, stricter and sustainable environmental policies, and enhancement of universal social and healthcare programs are key priorities.`;
    } else if (gdpPerCapita >= 15000) {
        grade = "Grade: High Income";
        return `${grade}. Government Evolution: Major investments are made in higher education and scientific research, development of policies to support the digital economy and Industry 4.0, implementation of very strict and sustainable environmental policies, and enhancement of advanced and efficient public services.`;
    } else {
        return "Government Evolution: Data not available or invalid.";
    }
}

//////////////////////////////////////////////////////////////////////////

// Function to get weather data and UV index using latitude and longitude
function getWeatherF(latitude, longitude, plantingDate) {
    const apiKey = '74cc8a3c199f63bb2998825eb67ca8db'; // Replace with your actual API key
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    // Fetch weather data
    $.getJSON(apiUrl)
    .done(function (weatherData) {
        try {
            const temperature = weatherData.main.temp;
            const humidity = weatherData.main.humidity;
            const windSpeed = weatherData.wind.speed;
            const weatherDescription = weatherData.weather[0].description;
            const rainfall = weatherData.rain ? (weatherData.rain['1h'] || 0) : 0;
            const visibility = weatherData.visibility / 1000; // Visibility in km

            // Determine the categories
            const temperatureCategory = categorizeTemperature(temperature);
            const humidityCategory = categorizeHumidity(humidity);
            const windSpeedCategory = categorizeWindSpeed(windSpeed);
            const rainfallCategory = categorizeRainfall(rainfall);
            const weatherCategory = categorizeWeather(weatherDescription, visibility);

            // Check outdoor temperature comfort
            const comfortMessage = checkOutdoorTemperature(temperature, humidity);

            // Display the weather data with categories
            $("#temperature").html(`Temperature: ${temperature}°C (${temperatureCategory})`);
            $("#weather").html(`Weather: ${weatherDescription} (${weatherCategory})`);
            $("#category").html(`Humidity: ${humidity}% (${humidityCategory})<br>` +
                                `Wind Speed: ${windSpeed} m/s (${windSpeedCategory})<br>` +
                                `Rainfall: ${rainfall} mm (${rainfallCategory})<br>` +
                                `Visibility: ${visibility} km`);

            // Display comfort message
            $("#comfortMessage").html(`Comfort Message: ${comfortMessage}`);

            // Get and display agricultural information based on the climate and planting date
            const climateInfo = getAgricultureInfo(temperature, humidity, plantingDate);

            // Format the main crops data to display the name and planting/harvest times
            const mainCropsInfo = climateInfo.mainCrops.map(crop => `${crop.name} (Planting: ${crop.planting}, Harvest: ${crop.harvest})`).join("<br>");

            // Display the agriculture information in the HTML
            $("#agriculture").html(`Agriculture in this climate:<br>` +
                                `Main Crops:<br> ${mainCropsInfo}<br>` +
                                `Hydroponic Crops: ${climateInfo.hydroponicCrops.join(", ")}<br>` +
                                `Influence: ${climateInfo.influence}`);

            // Get and display livestock information based on the climate
            const livestockInfo = getLivestockInfo(temperature, humidity);

        // Display the livestock information in the HTML
        $("#livestock").html(`Livestock in this climate:<br>` +
                             `Animal: ${livestockInfo.animal}<br>` +
                             `Ideal Temperature: ${livestockInfo.idealTemperature}°C<br>` +
                             `Ideal Humidity: ${livestockInfo.idealHumidity}%<br>` +
                             `Impact: ${livestockInfo.impact}<br>` +
                             `Breeding Season: ${livestockInfo.breedingSeason}<br>` +
                             `Birthing Season: ${livestockInfo.birthingSeason}`);

            // Fetch and display UV index
            const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
            $.getJSON(uvUrl)
            .done(function (uvData) {
                const uvIndex = uvData.value;
                const uvInfo = categorizeUV(uvIndex);
                $("#uvIndex").html(`UV Index: ${uvIndex} (${uvInfo.category})<br>${uvInfo.advice}`);
            })
            .fail(function () {
                $("#uvIndex").html("Error retrieving UV index.");
            });

        } catch (error) {
            console.error("Error processing weather data:", error);
            $("#temperature").html("Error retrieving weather data.");
            $("#weather").html("Error retrieving weather data.");
            $("#category").html("Error retrieving weather data.");
            $("#agriculture").html("Error retrieving agriculture data.");
            $("#livestock").html("Error retrieving livestock data.");
            $("#comfortMessage").html("Error retrieving comfort message.");
            $("#uvIndex").html("Error retrieving UV index.");
        }
    })
    .fail(function () {
        console.error("Error fetching data from the API.");
        $("#temperature").html("Error retrieving weather data.");
        $("#weather").html("Error retrieving weather data.");
        $("#category").html("Error retrieving weather data.");
        $("#agriculture").html("Error retrieving agriculture data.");
        $("#livestock").html("Error retrieving livestock data.");
        $("#comfortMessage").html("Error retrieving comfort message.");
        $("#uvIndex").html("Error retrieving UV index.");
    });
}

// Function to get the current hour
function getCurrentHour() {
    const now = new Date();
    return now.getHours();
}

// Function to categorize UV index with more than 12 ranges and provide health advice
function categorizeUV(uvIndex) {
    let category;
    let advice;
    
    // Get the current hour
    const hour = getCurrentHour();

    // If the time is before 7 AM or after 6 PM, UV radiation is considered non-existent
    if (hour < 7 || hour > 18) {
        return {
            category: "No UV",
            advice: "There is no UV radiation at this time. You can safely stay outside."
        };
    }

    // Categorize UV index if within UV active hours
    if (uvIndex < 1) {
        category = "Minimal";
        advice = "No protection needed. You can safely stay outside.";
    } else if (uvIndex < 2) {
        category = "Very Low";
        advice = "Low risk. Little precautions needed, but wear sunglasses on bright days.";
    } else if (uvIndex < 3) {
        category = "Low";
        advice = "Minimal risk. Wear sunglasses on bright days.";
    } else if (uvIndex < 4) {
        category = "Moderate Low";
        advice = "Moderate risk. Wear sunglasses and use sunscreen.";
    } else if (uvIndex < 5) {
        category = "Moderate";
        advice = "Moderate risk. Wear protective clothing, sunglasses, and use sunscreen.";
    } else if (uvIndex < 6) {
        category = "Moderate High";
        advice = "Moderate to high risk. Limit sun exposure and wear protective clothing.";
    } else if (uvIndex < 7) {
        category = "High Low";
        advice = "High risk. Avoid prolonged sun exposure. Wear protective clothing and sunscreen.";
    } else if (uvIndex < 8) {
        category = "High";
        advice = "High risk. Limit time in the sun, especially between 10 AM and 4 PM.";
    } else if (uvIndex < 9) {
        category = "Very High Low";
        advice = "Very high risk. Avoid sun exposure during midday hours.";
    } else if (uvIndex < 10) {
        category = "Very High";
        advice = "Very high risk. Seek shade and wear protective clothing.";
    } else if (uvIndex < 11) {
        category = "Very High Extreme";
        advice = "Extreme risk. Avoid being outside during midday hours.";
    } else if (uvIndex < 12) {
        category = "Extreme Low";
        advice = "Extreme risk. Stay indoors and avoid direct sun exposure.";
    } else if (uvIndex < 13) {
        category = "Extreme";
        advice = "Extreme risk. Take all precautions, including wearing sunglasses, sunscreen, and protective clothing.";
    } else {
        category = "Beyond Extreme";
        advice = "Dangerous levels of UV radiation. Stay indoors and avoid sun exposure completely.";
    }

    return { category: category, advice: advice };
}

// Additional helper functions
// Function to categorize temperature
function categorizeTemperature(temp) {
    if (temp < 0) {
        return 'Very Cold';
    } else if (temp < 10) {
        return 'Cold';
    } else if (temp < 20) {
        return 'Cool';
    } else if (temp < 30) {
        return 'Warm';
    } else if (temp < 40) {
        return 'Hot';
    } else {
        return 'Very Hot';
    }
}

// Function to categorize humidity
function categorizeHumidity(humidity) {
    if (humidity < 20) {
        return 'Very Dry';
    } else if (humidity < 40) {
        return 'Dry';
    } else if (humidity < 60) {
        return 'Normal';
    } else if (humidity < 80) {
        return 'Humid';
    } else {
        return 'Very Humid';
    }
}

// Function to categorize wind speed
function categorizeWindSpeed(windSpeed) {
    if (windSpeed < 5) {
        return 'Calm';
    } else if (windSpeed < 15) {
        return 'Breezy';
    } else if (windSpeed < 30) {
        return 'Windy';
    } else if (windSpeed < 50) {
        return 'Very Windy';
    } else {
        return 'Stormy';
    }
}

// Function to categorize rainfall
function categorizeRainfall(rainfall) {
    if (rainfall === 0) {
        return 'No Rain';
    } else if (rainfall <= 2.5) {
        return 'Light Rain';
    } else if (rainfall <= 7.5) {
        return 'Moderate Rain';
    } else if (rainfall <= 15) {
        return 'Heavy Rain';
    } else {
        return 'Very Heavy Rain';
    }
}

// Function to categorize weather based on description and visibility
function categorizeWeather(description, visibility) {
    if (description.includes('fog')) {
        return `Fog (Visibility: < 1 km)`;
    } else if (description.includes('smog')) {
        return `Smog (Visibility: Very Low)`;
    } else if (description.includes('smoke')) {
        return `Smoke (Visibility: Varies)`;
    } else if (description.includes('clouds')) {
        return `Cloudy (Cloud Cover: Varies)`;
    } else if (description.includes('dust')) {
        return `Dust Storm (Visibility: Very Low)`;
    } else if (description.includes('rain') && visibility < 2) {
        return `Heavy Rain (Visibility: Low)`;
    } else if (description.includes('snow') && visibility < 2) {
        return `Heavy Snow (Visibility: Low)`;
    } else if (visibility < 1) {
        return `Very Poor Visibility`;
    } else {
        return `Clear or Partially Cloudy`;
    }
}

// Function to check outdoor temperature comfort based on humidity
function checkOutdoorTemperature(temp, humidity) {
    if (temp > 30 && humidity > 70) {
        return "It's very hot and humid outside. Stay hydrated and cool.";
    } else if (temp < 10 && humidity < 30) {
        return "It's cold and dry outside. Dress warmly and stay hydrated.";
    } else {
        return "Weather conditions are moderate.";
    }
}

// Function to get agricultural information based on temperature, humidity, planting date, and harvest season
function getAgricultureInfo(temperature, humidity, plantingDate) {
    let result = {};

    if (temperature >= 20 && temperature <= 35 && humidity >= 60) {
        result = {
            name: "Tropical",
            mainCrops: [
                { name: "Rice", planting: "March-May", harvest: "July-November" },
                { name: "Corn", planting: "March-May", harvest: "August-October" },
                { name: "Bananas", planting: "Year-round", harvest: "Year-round" },
                { name: "Palm Oil", planting: "May-June", harvest: "September-November" },
                { name: "Cocoa", planting: "March-May", harvest: "October-December" },
                { name: "Coffee", planting: "March-May", harvest: "September-December" }
            ],
            hydroponicCrops: ["Lettuce", "Spinach", "Basil", "Cucumbers", "Tomatoes", "Peppers"],
            influence: "Warm temperatures and high humidity allow for continuous farming. However, high humidity can lead to fungal diseases, so proper crop management is crucial."
        };
    } else if (temperature >= 10 && temperature <= 30 && humidity >= 40 && humidity < 60) {
        result = {
            name: "Subtropical",
            mainCrops: [
                { name: "Wheat", planting: "September-November", harvest: "April-June" },
                { name: "Oranges", planting: "March-April", harvest: "October-January" },
                { name: "Olives", planting: "October-November", harvest: "September-November" },
                { name: "Cotton", planting: "March-May", harvest: "September-November" },
                { name: "Tea", planting: "Year-round", harvest: "Year-round" }
            ],
            hydroponicCrops: ["Lettuce", "Herbs", "Peppers", "Strawberries"],
            influence: "Moderate humidity and temperatures allow for a wide variety of crops. Drought-resistant crops are recommended during dry spells."
        };
    } else if (temperature >= 5 && temperature <= 45 && humidity < 40) {
        result = {
            name: "Desert",
            mainCrops: [
                { name: "Dates", planting: "April-June", harvest: "September-December" },
                { name: "Wheat (with irrigation)", planting: "October-December", harvest: "March-May" },
                { name: "Certain vegetables", planting: "Year-round", harvest: "Year-round" }
            ],
            hydroponicCrops: ["Lettuce", "Tomatoes", "Cucumbers", "Peppers"],
            influence: "Low humidity and high temperatures require effective irrigation. Humidity control is essential in greenhouses to prevent plant stress."
        };
    } else if (temperature >= -20 && temperature <= 35 && humidity >= 40 && humidity < 60) {
        result = {
            name: "Continental",
            mainCrops: [
                { name: "Wheat", planting: "September-November", harvest: "June-August" },
                { name: "Corn", planting: "April-June", harvest: "August-October" },
                { name: "Soybeans", planting: "April-June", harvest: "September-November" },
                { name: "Potatoes", planting: "March-May", harvest: "August-October" }
            ],
            hydroponicCrops: ["Leafy Greens", "Herbs", "Tomatoes", "Strawberries"],
            influence: "Moderate humidity combined with long, harsh winters shortens the growing season. Fertile soil and humidity management are key for successful yields."
        };
    } else if (temperature >= -50 && temperature <= 10 && humidity >= 60) {
        result = {
            name: "Arctic",
            mainCrops: [
                { name: "Greenhouse vegetables", planting: "Year-round", harvest: "Year-round" }
            ],
            hydroponicCrops: ["Leafy Greens", "Herbs"],
            influence: "High humidity and extremely cold temperatures limit traditional farming. Greenhouses and hydroponics are vital for successful crop growth."
        };
    } else {
        result = {
            name: "Unknown",
            mainCrops: ["Unknown"],
            hydroponicCrops: ["Unknown"],
            influence: "No information is available for this climate and humidity combination."
        };
    }

    return result;
}


// Function to get livestock information based on climate
function getLivestockInfo(temperature, humidity) {
    if (temperature >= 10 && temperature <= 25 && humidity >= 50 && humidity <= 70) {
        return {
            animal: "Cattle, Goats, Sheep",
            idealTemperature: "10-25",
            idealHumidity: "50-70",
            impact: "Cattle, Goats, and Sheep are comfortable within this temperature and humidity range. Conditions outside this range can affect their health and productivity.",
            breedingSeason: "Spring to early summer",
            birthingSeason: "Spring to early summer"
        };
    } else if (temperature >= 18 && temperature <= 24 && humidity >= 50 && humidity <= 60) {
        return {
            animal: "Chickens, Rabbits",
            idealTemperature: "18-24",
            idealHumidity: "50-60",
            impact: "Chickens and Rabbits require stable temperature and humidity. Improper conditions can lead to health problems and decreased productivity.",
            breedingSeason: "Spring and summer",
            birthingSeason: "Spring and summer"
        };
    } else if (temperature >= 15 && temperature <= 25 && humidity > 70 && humidity <= 80) {
        return {
            animal: "Ducks",
            idealTemperature: "15-25",
            idealHumidity: "70-80",
            impact: "Ducks need a cool, humid environment to prevent stress and maintain health.",
            breedingSeason: "Spring to summer",
            birthingSeason: "Spring to summer"
        };
    } else if (temperature >= 15 && temperature <= 25 && humidity >= 40 && humidity < 50) {
        return {
            animal: "Turkeys",
            idealTemperature: "15-25",
            idealHumidity: "40-50",
            impact: "Turkeys prefer moderate temperatures and humidity. They are more tolerant of a wider range of humidity but require moderate temperatures for optimal health.",
            breedingSeason: "Spring",
            birthingSeason: "Summer"
        };
    } else if (temperature >= 16 && temperature <= 24 && humidity >= 40 && humidity <= 60) {
        return {
            animal: "Pigs",
            idealTemperature: "16-24",
            idealHumidity: "40-60",
            impact: "Pigs prefer cooler temperatures and moderate humidity levels. Extreme temperatures or humidity can cause stress and affect their growth and health.",
            breedingSeason: "Year-round",
            birthingSeason: "Year-round"
        };
    } else if (temperature >= 20 && temperature <= 30 && humidity > 60 && humidity <= 70) {
        return {
            animal: "Pigeons",
            idealTemperature: "20-30",
            idealHumidity: "60-70",
            impact: "Pigeons thrive in warmer temperatures with moderate humidity. They require good ventilation and can tolerate a range of humidity levels, but prefer conditions that are neither too dry nor too wet.",
            breedingSeason: "Spring to summer",
            birthingSeason: "Spring to summer"
        };
    } else if (temperature >= 10 && temperature <= 30 && humidity >= 40 && humidity <= 60) {
        return {
            animal: "Horses",
            idealTemperature: "10-30",
            idealHumidity: "40-60",
            impact: "Horses are adaptable to a range of temperatures from cool to warm and prefer moderate humidity. They need protection from extreme weather conditions to maintain health and performance.",
            breedingSeason: "Spring to early summer",
            birthingSeason: "Spring to early summer"
        };
    } else if (temperature >= 18 && temperature <= 28 && humidity >= 50 && humidity <= 65) {
        return {
            animal: "Quails",
            idealTemperature: "18-28",
            idealHumidity: "50-65",
            impact: "Quails prefer warm temperatures and moderate humidity. They thrive in environments that are neither too cold nor too hot and require good ventilation to stay healthy.",
            breedingSeason: "Spring to summer",
            birthingSeason: "Spring to summer"
        };
    } else if (temperature >= 25 && temperature <= 30 && humidity > 80 && humidity <= 90) {
        return {
            animal: "Catfish",
            idealTemperature: "25-30",
            idealHumidity: "80-90",
            impact: "Catfish thrive in warm water temperatures with high humidity. They require clean water and stable conditions to maintain good health and growth.",
            breedingSeason: "Spring to summer",
            birthingSeason: "Spring to summer"
        };
    } else if (temperature >= 15 && temperature <= 35 && humidity >= 50 && humidity <= 70) {
        return {
            animal: "Beekeeping",
            idealTemperature: "15-35",
            idealHumidity: "50-70",
            impact: "Bees prefer warm temperatures and moderate humidity for optimal honey production. They are active in temperatures above 15°C and need access to flowers and clean water.",
            breedingSeason: "Spring to summer",
            birthingSeason: "Spring to summer"
        };
    } else if (temperature >= 30 && temperature <= 50 && humidity >= 10 && humidity <= 30) {
        return {
            animal: "Camels",
            idealTemperature: "30-50",
            idealHumidity: "10-30",
            impact: "Camels are well-adapted to hot, dry climates. They can survive and remain productive in conditions that are too harsh for most other livestock.",
            breedingSeason: "Winter",
            birthingSeason: "Spring"
        };
    } else if (temperature >= 22 && temperature <= 28 && humidity >= 70 && humidity <= 90) {
        return {
            animal: "Ornamental Fish",
            idealTemperature: "22-28",
            idealHumidity: "70-90",
            impact: "Ornamental fish thrive in warm water temperatures with high humidity, suitable for maintaining aquarium environments. Water quality and stable conditions are crucial for their health.",
            breedingSeason: "Varies by species",
            birthingSeason: "Varies by species"
        };
    } else if (temperature >= 20 && temperature <= 40 && humidity >= 30 && humidity <= 50) {
        return {
            animal: "Ostriches",
            idealTemperature: "20-40",
            idealHumidity: "30-50",
            impact: "Ostriches thrive in warm, dry climates with moderate humidity. They can tolerate a range of temperatures but require stable conditions for optimal health and egg production.",
            breedingSeason: "Spring to summer",
            birthingSeason: "Spring to summer"
        };
    } else {
        return {
            animal: "Unknown",
            idealTemperature: "Unknown",
            idealHumidity: "Unknown",
            impact: "No information is available for this combination of temperature and humidity.",
            breedingSeason: "Unknown",
            birthingSeason: "Unknown"
        };
    }
}


// Function to check outdoor temperature comfort
function checkOutdoorTemperature(temperature, humidity) {
    const minComfortTemp = 18;  // Adjusted for a slightly warmer comfort range
    const maxComfortTemp = 27;  // Adjusted for a slightly warmer comfort range

    if (temperature > maxComfortTemp) {
        if (humidity > 75) {
            return "The temperature and humidity are very high. The risk of dehydration and heat stroke is greatly increased. It is highly recommended to stay indoors, drink plenty of water, and avoid heavy physical activities.";
        } else if (humidity > 65) {
            return "The temperature and humidity are high. The risk of dehydration and heat stroke is increased. Drink plenty of water and avoid direct sunlight.";
        } else if (humidity > 50) {
            return "High temperature with moderate humidity. There is a risk of heat exhaustion and dehydration. Make sure to stay hydrated and wear light clothing.";
        } else {
            return "High temperature with low humidity. The risk of dehydration is high. Drink plenty of water and avoid direct sunlight.";
        }
    }

    if (temperature < minComfortTemp) {
        if (humidity > 80) {
            return "Low temperature with very high humidity. The risk of hypothermia and cold is increased. Wear warm, waterproof clothing and avoid prolonged exposure outside.";
        } else if (humidity > 70) {
            return "Low temperature with high humidity. The risk of hypothermia is increased. Wear warm clothing and ensure to stay dry.";
        } else if (humidity > 50) {
            return "Low temperature with moderate humidity. There is a risk of cold and hypothermia. Wear warm clothing and avoid prolonged exposure outside.";
        } else {
            return "Low temperature with low humidity. The risk of dry skin and hypothermia. Wear layered clothing and avoid prolonged exposure outside.";
        }
    }

    return "The outdoor temperature is comfortable and within the ideal range.";
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
    var features;
    if (countryName === "Indonesia") {
      if (month >= 12 || month <= 2) {
        season = "Rainy Season";
        features = "High rainfall, increased humidity, and potential flooding.";
      } else if (month >= 6 && month <= 9) {
        season = "Dry Season";
        features = "Low rainfall, high temperatures, and dry conditions.";
      } else {
        season = "Transition Season";
        features = "Fluctuating weather patterns with occasional rain.";
      }
    } else if (countryName === "Asia" || countryName === "Europe") {
      if (month >= 3 && month <= 5) {
        season = "Spring";
        features = "Mild temperatures, blooming flowers, and rejuvenating plant life.";
      } else if (month >= 6 && month <= 8) {
        season = "Summer";
        features = "Hot temperatures, longer days, and increased outdoor activities.";
      } else if (month >= 9 && month <= 11) {
        season = "Autumn";
        features = "Cooler temperatures, falling leaves, and harvest season.";
      } else {
        season = "Winter";
        features = "Cold temperatures, snow in some regions, and shorter days.";
      }
    } else if (countryName === "Africa") {
      if (month >= 6 && month <= 8) {
        season = "Winter";
        features = "Mild temperatures, dry conditions, and shorter days.";
      } else if (month >= 9 && month <= 11) {
        season = "Spring";
        features = "Rising temperatures, blooming flowers, and occasional rain.";
      } else {
        season = "Summer";
        features = "Hot temperatures and sometimes heavy rainfall in certain regions.";
      }
    } else if (countryName === "North America" || countryName === "South America") {
      if (month >= 3 && month <= 5) {
        season = "Spring";
        features = "Mild temperatures, blossoming flowers, and new plant growth.";
      } else if (month >= 6 && month <= 8) {
        season = "Summer";
        features = "Hot temperatures, longer daylight hours, and summer vacations.";
      } else if (month >= 9 && month <= 11) {
        season = "Autumn";
        features = "Cooling temperatures, vibrant foliage, and harvest time.";
      } else {
        season = "Winter";
        features = "Cold temperatures, possible snow, and holiday season.";
      }
    } else if (countryName === "Australia" || countryName === "Oceania") {
      if (month >= 3 && month <= 5) {
        season = "Autumn";
        features = "Cooling temperatures, changing leaf colors, and harvest time.";
      } else if (month >= 6 && month <= 8) {
        season = "Winter";
        features = "Cooler temperatures, shorter days, and snow in some areas.";
      } else if (month >= 9 && month <= 11) {
        season = "Spring";
        features = "Warming temperatures, blooming flowers, and new life.";
      } else {
        season = "Summer";
        features = "Hot temperatures, beach weather, and longer days.";
      }
    } else if (countryName === "Antarctica") {
      if (month >= 3 && month <= 10) {
        season = "Summer";
        features = "Relatively warmer temperatures, 24-hour daylight, and ice melting.";
      } else {
        season = "Winter";
        features = "Extremely cold temperatures, 24-hour darkness, and heavy snowfall.";
      }
    } else {
      season = "Unknown Location";
      features = "No seasonal information available.";
    }
  
    $("#season").html("Season: " + season + "<br>Features: " + features);
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
  
  });
  

//////////////////////////////////////////////////////////////////////////

// Function to get air quality data using latitude and longitude
function getAirQuality(latitude, longitude) {
    var apiKey = 'a01ca450-9bc6-4163-84dc-e37f7128b4f2'; // Ganti dengan kunci API AirVisual Anda
    var apiUrl = `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${apiKey}`;

    $.getJSON(apiUrl)
        .done(function(airData) {
            var airQualityIndex = airData.data.current.pollution.aqius;
            var airQualityCategory = getAirQualityCategory(airQualityIndex);
            var healthRecommendations = getHealthRecommendations(airQualityIndex);

            $("#air-quality-index").html("Air Quality Index: " + airQualityIndex);
            $("#air-quality-category").html("Air Quality Category: " + airQualityCategory);
            $("#health-recommendations").html("Health Recommendations: " + healthRecommendations);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Error fetching air quality data: " + textStatus, errorThrown);
            $("#air-quality-index").html("Error fetching air quality data");
            $("#air-quality-category").html("");
            $("#health-recommendations").html("");
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

// Function to provide health recommendations based on air quality category
function getHealthRecommendations(aqi) {
    if (aqi <= 50) {
        return "Air quality is good. No health risks.";
    } else if (aqi <= 100) {
        return "Air is acceptable, but sensitive groups should limit prolonged outdoor activities.";
    } else if (aqi <= 150) {
        return "Sensitive groups should reduce prolonged or heavy outdoor exertion.";
    } else if (aqi <= 200) {
        return "Everyone should reduce outdoor activities. Sensitive groups should avoid outdoor exertion.";
    } else if (aqi <= 300) {
        return "Avoid all outdoor exertion. Stay indoors with clean air.";
    } else {
        return "Stay indoors, avoid physical activities outdoors. Use air purifiers if available.";
    }
}

// Function to get the user's location and fetch air quality data
function getLocationF() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            getAirQuality(latitude, longitude);
        }, function(error) {
            console.error("Geolocation error: " + error.message);
            $("#air-quality-index").html("Unable to retrieve location.");
            $("#air-quality-category").html("");
            $("#health-recommendations").html("");
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
        $("#air-quality-index").html("Geolocation is not supported by this browser.");
        $("#air-quality-category").html("");
        $("#health-recommendations").html("");
    }
}

// Call the getLocationF function inside $(document).ready
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
    const usgsApiUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
    const bmkgApiUrl = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.xml";

    // Fetch USGS data
    $.get(usgsApiUrl, function(usgsData) {
        // Fetch BMKG data
        $.ajax({
            url: bmkgApiUrl,
            method: 'GET',
            dataType: 'xml',
            success: function(bmkgData) {
                displayEarthquakeData(usgsData, bmkgData, latitude, longitude, userCountryName);
            },
            error: function() {
                console.error("Failed to fetch BMKG data");
                displayEarthquakeData(usgsData, null, latitude, longitude, userCountryName);
            }
        });
    }).fail(function() {
        console.error("Failed to fetch USGS data");
        // Optionally, handle the case where both data sources fail.
    });
}

function displayEarthquakeData(usgsData, bmkgData, latitude, longitude, userCountryName) {
    const usgsEarthquakes = usgsData.features;

    // Parse BMKG XML data if available
    const bmkgEarthquakes = [];
    if (bmkgData) {
        $(bmkgData).find('gempa').each(function() {
            const time = $(this).find('DateTime').text();
            const magnitude = parseFloat($(this).find('Magnitude').text());
            const latText = $(this).find('Lintang').text();
            const lonText = $(this).find('Bujur').text();
            const coordinates = [
                parseFloat(latText.replace(' LS', '').replace(' LU', '')) * (latText.includes('LS') ? -1 : 1),
                parseFloat(lonText.replace(' BT', '').replace(' BB', '')) * (lonText.includes('BT') ? -1 : 1)
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
    }

    // Combine and sort by time
    const combinedEarthquakes = usgsEarthquakes.map(eq => ({
        time: eq.properties.time,
        magnitude: eq.properties.mag,
        coordinates: [eq.geometry.coordinates[1], eq.geometry.coordinates[0]], // Adjust coordinate order
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

async function getUnemploymentRate(countryCode) {
    if (!countryCode) {
        alert('Country code not provided.');
        return;
    }

    const apiUrl = `https://api.worldbank.org/v2/country/${countryCode}/indicator/SL.UEM.TOTL.ZS?format=json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        if (data && data[1] && Array.isArray(data[1])) {
            displayData(data[1]);
        } else {
            throw new Error('Unexpected data format.');
        }
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
        document.getElementById('unemploymentData').innerHTML = '<p>Failed to fetch data.</p>';
    }
}

function displayData(data) {
    const unemploymentDataDiv = document.getElementById('unemploymentData');
    const unemploymentCategoryDiv = document.getElementById('unemploymentCategory');
    
    let latestData = data.find(item => item.value !== null);

    if (latestData) {
        const year = latestData.date;
        const value = latestData.value;
        unemploymentDataDiv.innerHTML = `The unemployment rate in ${year} is ${value.toFixed(2)}%.`;
        classifyUnemploymentRate(value, unemploymentCategoryDiv);
    } else {
        unemploymentDataDiv.innerHTML = 'Unemployment rate data is not available.';
    }
}

function classifyUnemploymentRate(rate, categoryDiv) {
    let category;
    if (rate < 2) {
        category = "Very Low: Less than 2% <br> This indicates an extremely healthy labor market with minimal unemployment. It suggests that most people who want to work are able to find jobs easily.";
    } else if (rate >= 2 && rate <= 5) {
        category = "Low: Between 2% and 5% <br> This level of unemployment is still quite low. It typically means that the job market is strong and that most people who are looking for work can find employment relatively easily.";
    } else if (rate > 5 && rate <= 10) {
        category = "Moderate: Between 5% and 10% <br> This range is common in many countries and indicates a balanced job market where there are some job seekers who may have difficulty finding work, but overall, there are opportunities available.";
    } else if (rate > 10 && rate <= 20) {
        category = "High: Between 10% and 20% <br> This level of unemployment is considered high. It often reflects economic difficulties, such as recessions or periods of economic instability, where finding a job is more challenging.";
    } else {
        category = "Very High: More than 20% <br> This signifies an extremely high unemployment rate, which is usually associated with severe economic crises. It indicates that a large proportion of the labor force is unable to find work, leading to widespread economic hardship.";
    }
    categoryDiv.innerHTML = `Unemployment Rate Category:<br>${category}`;
}


//////////////////////////////////////////////////////////////////////////

function fetchHolidays(countryCode) {
    const year = new Date().getFullYear(); // Mengambil tahun saat ini
    const url = `https://date.nager.at/Api/v2/PublicHoliday/${year}/${countryCode}`;

    fetch(url)
        .then(response => response.json())
        .then(holidays => {
            let holidaysHtml = '<h3>Holidays:</h3><ul>';
            holidays.forEach(holiday => {
                holidaysHtml += `<li>${holiday.localName} (${holiday.date}): ${holiday.name}</li>`;
            });
            holidaysHtml += '</ul>';

            $("#holidays").html(holidaysHtml); // Menampilkan data hari libur dalam elemen dengan ID holidays
        })
        .catch(error => console.error('Error fetching holidays:', error));
}

//////////////////////////////////////////////////////////////////////////

function getCountryFeaturesByPopulation(population) {
    let features = {};
    if (population < 1_000_000) {
        features = {
            category: "Small Population Country",
            description: "Homogeneous with little ethnic or cultural diversity. Limited economy."
        };
    } else if (population < 10_000_000) {
        features = {
            category: "Medium Population Country",
            description: "Some ethnic and cultural diversity. Developing infrastructure."
        };
    } else if (population < 100_000_000) {
        features = {
            category: "Large Population Country",
            description: "Highly diverse with a varied economy. Complex infrastructure."
        };
    } else if (population < 1_000_000_000) {
        features = {
            category: "Very Large Population Country",
            description: "Challenges in managing diversity. Large economy."
        };
    } else {
        features = {
            category: "Largest Population Country",
            description: "Extremely large population with a significant economy on the global stage."
        };
    }
    return features;
}

//////////////////////////////////////////////////////////////////////////

function getWeatherAndUVIndex(latitude, longitude, countryCode) {
    var baseURL = "https://chat.openai.com/?q=";

    // Get the current time in ISO format
    var now = new Date().toISOString();

    // Dictionary of queries mapped by country codes
    var queries = {
        "US": "What is the current temperature, and what is the UV index? Also, what is considered a healthy range for UV exposure and air temperature?",
        "ID": "Berapa suhu saat ini, dan berapa indeks UV? Selain itu, berapa rentang aman untuk paparan UV dan suhu udara?",
        "ES": "¿Cuál es la temperatura actual y cuál es el índice UV? Además, ¿cuál es el rango saludable de exposición a UV y temperatura del aire?",
        "FR": "Quelle est la température actuelle et quel est l'indice UV ? De plus, quelle est la plage saine pour l'exposition aux UV et la température de l'air ?",
        "DE": "Wie ist die aktuelle Temperatur und wie hoch ist der UV-Index? Außerdem, was gilt als gesunder Bereich für UV-Belastung und Lufttemperatur?",
        "CN": "目前的气温是多少，紫外线指数是多少？另外，什么是紫外线暴露和空气温度的健康范围？",
        "JP": "現在の気温とUV指数は何ですか？また、UV暴露と気温の健康的な範囲は何ですか？"
    };

    // Get the query based on the country code, default to English (US) if not found
    var query = queries[countryCode] || queries["US"];

    // Construct the full URL for the chatbot query
    var fullURL = baseURL + encodeURIComponent("Current time: " + now + " Coordinates: " + latitude + "," + longitude + ", " + query);

    // URL for AccuWeather
    var accuweatherURL = "https://www.accuweather.com/en/id/jakarta/208971/hourly-weather-forecast/208971";

    // Update the content of the element with the ID 'basechatgpt'
    $("#basechatgpt1").html(`
        <a href="${fullURL}" target="_blank">Ask about current temperature, UV index, and healthy ranges</a>
    `);

    $("#basechatgpt2").html(`
        <a href="${accuweatherURL}" target="_blank">View AccuWeather hourly forecast</a>
    `);

    return fullURL;
}

//////////////////////////////////////////////////////////////////////////
