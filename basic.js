$(document).ready(function() {

    getLocationF();

    function getLocationF() {
        $.getJSON("https://ipapi.co/json/", function(ip) {
            console.log(ip);
            $("#ip-address").html("IP Anda Adalah: " + ip.ip + " " + ip.org + " " + ip.asn);
            $("#location-data").html(ip.latitude + "," + ip.longitude + " " + ip.city + ", " + ip.region + " " + ip.postal + " " + ip.country_name);

            getWeatherF(ip.postal);
        }, 'jsonp');

    }

});
