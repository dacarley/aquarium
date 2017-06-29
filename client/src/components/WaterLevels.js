// @providesModule AQ-WaterLevels

import React, { Component } from "react";

export default class WaterLevels extends Component {
    state = {};

    async componentWillMount() {
        this.update();
        setInterval(() => this.update(), 5000);
    }


    async update() {
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
