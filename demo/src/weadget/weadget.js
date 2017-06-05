var React = require('react');
var ReactDOM = require('react-dom');
var GoogleMaps = require('google-maps');
var WeatherAPI = require('./weather-api');
require('./weadget.css');

/**
 *  GOOGLE MAPS API Configurations
 */
const GOOGLE_MAPS_API_KEY = "AIzaSyCSmS0WuOcw72u8tRGb81jr_gHA_QPEKPU";
GoogleMaps.KEY = GOOGLE_MAPS_API_KEY;

/**
 *  ReactJS Component for Weather widget
 *  ------------------------------------
 */
class Weadget extends React.Component {
    /**
     * Initialization
     */
    constructor(){
        super();
        this.loading = false;
        this.weather = null;
        this.flipped = false;
        this.position = null;

        this.city = null;
        this.dailyWeathers = [];
    }

    /**
     * Stops the event propagation
     * @param evt
     */
    dontPropagate(evt){
        evt.stopPropagation();
    }

    /**
     * Renders a Google Maps instance inside the HTML element having the ref="map" attribute;
     * Centers the map on current user position, marked by Maps' default pin icon.
     */
    renderMap(){
        GoogleMaps.load((google) => {
            let map = ReactDOM.findDOMNode(this.refs.map);
            let coords = this.position ? this.position.coords : null;
            let center = (coords) ? new google.maps.LatLng(parseFloat(coords.latitude).toFixed(2), parseFloat(coords.longitude).toFixed(2)) : null;
            let mapElement = new google.maps.Map(map, {
                center: center,
                zoom: 18,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            // marker
            new google.maps.Marker({
                position : center,
                map : mapElement
            });
        });
    }

    /**
     * Simple utility to check whether an object is defined and not null
     * @param target
     * @returns {boolean}
     */
    isDefined(target){
        return (typeof target !== 'undefined' && target != null);
    };

    /**
     * String formatter for Celsius temperature from the selected "weather" item
     * @returns {*}
     */
    getTemperature(){
        return `${ this.isDefined(this.weather) ? Math.floor(this.weather.temp.day) : null }°`;
    }

    /**
     * Flips the widget around its y-axis to show the rear map face
     * @param evt
     */
    flipCard = () => {
        this.flipped = !this.flipped;
        this.setState({ data : this.state.data });
    };

    /**
     * Stops the click event propagation and sets the current 'weather' item as the selected one.
     * @param event
     * @param daily
     */
    selectDaily(event, daily){
        event.stopPropagation();
        this.weather = daily;
        this.forceUpdate();
    };

    /* COMPONENT LIFECYCLE HOOKS */

    componentDidMount(){
        this.setState({ data : {} });
        this.loading = true;
        WeatherAPI.getGPSWeather(this).then((response) => {
            this.setState({ data : response });
            this.loading = false;

            this.city = response.city;
            response.list.forEach((item) => {
                item.date = new Date(item.dt * 1000);
            });
            this.dailyWeathers = response.list;
            this.weather = this.dailyWeathers[0];

            /*if(this.isDefined(response)){
             this.weather = response.weather.find((item) => this.isDefined(item));
             }*/
            this.renderMap();
            this.forceUpdate();
        });
    }

    render(){
        if(this.loading) {
            return (
                <div className="weadget">
                    <div className="weadget-container">
                        <div className="weather-loading-container">
                            <div className="loading-message">
                                Loading ...
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else if(this.isDefined(this.state) && this.isDefined(this.weather)){
            let calendarContent = [];
            this.dailyWeathers.forEach((daily) => {
                calendarContent.push(
                    <div key={daily.dt} onClick={(event) => { this.selectDaily(event, daily); }}
                         className={ "weadget-calendar-day " + ((daily.dt === this.weather.dt) ? "active" : "") }>
                        <div className="weadget-calendar-day-name">{ daily.date.toLocaleString("it-IT", { weekday : "short" }) }</div>
                    </div>
                );
            });

            return (
                <div className={ `weadget ${ this.flipped ? 'flipped' : '' }` } onClick={this.flipCard}>
                    <div className="weadget-container-front">
                        <div className="weadget-header">
                            <div className="pin"></div>
                            <div className="city-name">{ `${this.city.name}, ${this.city.country}` }</div>
                            <div className="temperature">{ this.getTemperature() }</div>
                        </div>

                        <div className="weadget-condition">
                            <div className="weadget-condition-icon">
                                <img src={ require(`./assets/svg/${this.weather.weather[0].icon}.svg`) } alt="" />
                            </div>
                            <div className="weadget-condition-name">
                                <div className="weadget-condition-message">{ this.weather.weather[0].description }</div>
                            </div>
                        </div>

                        <div className="weadget-atmospherics">
                            <div className="weadget-wind">
                                <div className="weadget-wind-value">{ `${this.weather.speed} m/s` }</div>
                                <div className="weadget-wind-label">wind</div>
                            </div>
                            <div className="weadget-humidity">
                                <div className="weadget-humidity-value">{ `${this.weather.humidity}%` }</div>
                                <div className="weadget-humidity-label">humidity</div>
                            </div>
                        </div>

                        <div className="weadget-calendar">
                            { calendarContent }
                        </div>
                    </div>

                    <div className="weadget-container-back">
                        <div className="map" ref="map" onClick={this.dontPropagate}></div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="weadget">
                    <div className="weadget-container">
                        Data is not available.
                    </div>
                </div>
            );
        }
    };
}

module.exports = Weadget;