import React, { Component } from "react";
import WaterLevels from "AQ-WaterLevels";
import DimmerLevels from "AQ-DimmerLevels";
import logo from "./logo.svg";
import "./App.css";

export default class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={ logo } className="App-logo" alt="logo" />
                    <h2>Welcome to the Aquarium</h2>
                </div>
                <WaterLevels />
                <DimmerLevels />
            </div>
            );
    }
}
