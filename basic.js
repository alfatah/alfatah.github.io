    $(document).ready(function() {

        getLocationF();

        function getLocationF() {
            $.getJSON("https://ipapi.co/json/", function(ip) {
                console.log(ip);
                $("#ip-address").html("Your IP : " + ip.ip + "," + " " + ip.org + " " + ip.asn);
                $("#location-data").html(ip.latitude + "," + ip.longitude + " " + ip.city + ", " + ip.region + " " + ip.postal + " " + ip.country_name);
                $("#population").html("Population Country : " + ip.country_population + " ");


                getWeatherF(ip.postal);
            }, 'jsonp');

        }

    });
