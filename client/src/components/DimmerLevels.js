// @providesModule AQ-DimmerLevels

import React, { Component } from "react";

export default class WaterLevels extends Component {
    state = {};

    async componentWillMount() {
        const response = await fetch("/api/dimmerLevels");
        const dimmerLevels = await response.json();

        this.setState({
            dimmerLevels
        });
    }

    render() {
        const dimmerLevels = JSON.stringify(this.state.dimmerLevels);

        return (
            <p>
                { dimmerLevels }
            </p>
            );
    }
}
