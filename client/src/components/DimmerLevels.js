// @providesModule AQ-DimmerLevels

import React, { Component } from "react";
import _ from "lodash";

export default class WaterLevels extends Component {
    state = {};

    async componentWillMount() {
        this.update();
        setInterval(() => this.update(), 5000);
    }

    async update() {
        const response = await fetch("/api/dimmerLevels");
        this.setState(await response.json());
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
                <h1>{this.state.timestamp}</h1>
                { _.map(this.state.dimmerLevels, (levels, channelName) => this._renderChannel(channelName, levels)) }
            </div>
            );
    }
}
