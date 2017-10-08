// @providesModule AQ-DimmerLevels

import React, { Component } from "react";
import _ from "lodash";

export default class WaterLevels extends Component {
    state = {};

    async componentWillMount() {
        const response = await fetch("/api/dimmerLevels");
        const dimmerLevels = await response.json();

        this.setState({
            dimmerLevels
        });
    }

    _renderChannel = (channelName, levels) => {
        return (
            <div key={ channelName }>
                <h1>{ channelName }</h1>
                <p>
                    { levels.channel }
                </p>
                <p>
                    { levels.percentage }
                </p>
                <p>
                    { levels.brightness }
                </p>
            </div>
            );
    }

    render() {
        return (
            <div>
                { _.map(this.state.dimmerLevels, (levels, channelName) => this._renderChannel(channelName, levels)) }
            </div>
            );
    }
}
