// @providesModule AQ-Delay

export default {
    wait
};

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
