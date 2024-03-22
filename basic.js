$(document).ready(function() {

    getLocationF();

    function getLocationF() {
        $.getJSON("https://ipapi.co/json/", function(ip) {
            console.log(ip);
            $("#ip-address").html("Your IP : " + ip.ip + "," + " " + ip.org + " " + ip.asn);
            $("#location-data").html(ip.latitude + "," + ip.longitude + " " + ip.city + ", " + ip.region + " " + ip.postal + " " + ip.country_name);
            $("#population").html("Population Country : " + ip.country_population + " ");

            // Mendapatkan kode negara dari data IP
            var countryCode = ip.country;
            getGDP(countryCode);
            
            getWeatherF(ip.postal);
        }, 'jsonp');
    }
    
    // Fungsi untuk mendapatkan data PDB negara menggunakan kode negara
    function getGDP(countryCode) {
        $.getJSON(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json`, function(data) {
            var gdp = "Not Available";
            if (data[1] && data[1][0] && data[1][0].value) {
                gdp = data[1][0].value;
            }
            $("#gdp").html("GDP Country : " + gdp);
        });
    }

});
