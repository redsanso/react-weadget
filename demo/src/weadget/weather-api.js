/**
 * Created by redsa on 02/06/2017.
 */

/**
 *  External API for Weather data.
 */
const WeatherAPI = function(){
    /**
     * A simple Promise wrapper to retrieve the browser user's lat/lon upon permission granted
     * @returns {Promise}
     */
    var asyncCurrentPosition = function(){
        return new Promise((resolve, reject) => {
            /**
             * [Triggers permission request at startup for collecting browser GPS data]
             */
            navigator.geolocation.getCurrentPosition(
                (result) => resolve(result),
                (result) => reject(result),
                { enableHighAccuracy: true }
            );
        });
    };

    /**
     * A simple Promise wrapper for XMLHttpRequest instances
     * @param method
     * @param url
     * @returns {Promise}
     */
    var request = function(method, url){
        return new Promise(function(resolve, reject){
            let xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function(){
                if(this.status >= 200 && this.status < 300){
                    resolve(xhr.response);
                } else {
                    reject({
                        status : this.status,
                        statusText : xhr.statusText
                    });
                }
            };
            xhr.onerror = function(){
                reject({
                    status : this.status,
                    statusText : xhr.statusText
                });
            };
            xhr.send();
        });
    };

    return {
        /**
         * Retrieves weekly weather forecast from api.openweathermap.org
         * @param callee
         * @returns {Promise.<T>}
         */
        getGPSWeather : function(callee){
            let OpenWeatherMapAppId = "92e7665924c070d341d84f1fa10a67df";
            return asyncCurrentPosition().then(
                (position) => {
                    callee.position = position;
                    let queryParams = `?lat=${parseFloat(position.coords.latitude).toFixed(2)}&lon=${parseFloat(position.coords.longitude).toFixed(2)}&appid=${OpenWeatherMapAppId}&units=metric&type=like&lang=it`;
                    return request('GET', `http://api.openweathermap.org/data/2.5/forecast/daily${queryParams}`).then(
                        (response) => {
                            return JSON.parse(response);
                        },
                        (error) => {
                            console.error(`Error [${ error.statusText }] with status [${ error.status }]`);
                            return null;
                        }
                    );
                },
                (error) => {
                    console.error(`Error: ${ JSON.stringify(error) }`);
                    return null;
                }
            );
        }
    };
}();

module.exports = WeatherAPI;