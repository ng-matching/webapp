function startTimer(duration, display, callback) {
    var timer = duration, minutes, seconds;
    var clock = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            timer = duration;
            clearInterval(clock);

            callback();
        }
    }, 1000);

    this.stop = function () {
        clearInterval(clock);
    };
}