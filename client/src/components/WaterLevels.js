// @providesModule AQ-WaterLevels

import React, { Component } from "react";

export default class WaterLevels extends Component {
    state = {};

    async componentWillMount() {
        const response = await fetch("/api/waterLevels");
        const waterLevels = await response.json();

        this.setState({
            waterLevels
        });
    }

    render() {
        const waterLevels = JSON.stringify(this.state.waterLevels);

        return (
            <p>
                { waterLevels }
            </p>
            );
    }
}
