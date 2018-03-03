/**
 * Timer thing
 */

const TIME_UNIT_STRING = "mines_time_unit",
    NO_OFFSET = 0,
    MS_TO_S = 1000.0,
    ONE_DIGIT = 1,
    INTERVAL = 100;

export default class Timer {
    constructor(offset = NO_OFFSET, output) {
        this.offset = offset;
        this.output = output;
        this.startTime = 0;
        this.interval = 0;
        this.running = false;

        if("Intl" in window) {
            this._nf = new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1
            });
        }
        const time = this.formatTime(this.offset);

        navigator.mozL10n.setAttributes(this.output, TIME_UNIT_STRING, { time });
        navigator.mozL10n.translateFragment(this.output);
    }

    formatTime(time) {
        if(this._nf) {
            return this._nf.format(time / MS_TO_S);
        }

        return (time / MS_TO_S).toFixed(ONE_DIGIT);
    }

    updateOutput(time) {
        if(typeof time !== "number") {
            time = Date.now() - this.startTime;
        }

        const timeStr = this.formatTime(time);

        navigator.mozL10n.setAttributes(this.output, TIME_UNIT_STRING, { time: timeStr });
        navigator.mozL10n.translateFragment(this.output);
    }

    reset() {
        this.startTime = 0;
        this.offset = 0;
        this.updateOutput(NO_OFFSET);
        this.running = false;
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = 0;
        }
        this.output.dispatchEvent(new Event("reset"));
    }

    getTime() {
        if(!this.running) {
            return this.offset;
        }

        return Date.now() - this.startTime;
    }

    start() {
        if(!this.running) {
            this.startTime = Date.now() - this.offset;
            this.running = true;
            if(this.output) {
                this.interval = setInterval(this.updateOutput.bind(this), INTERVAL);
                this.output.dispatchEvent(new Event("start"));
            }
        }
    }

    pause() {
        if(this.running) {
            this.offset = Date.now() - this.startTime;
            this.running = false;
            if(this.interval) {
                clearInterval(this.interval);
                this.interval = 0;
                this.updateOutput(this.offset);
                this.output.dispatchEvent(new CustomEvent("pause", { detail: this.offset }));
            }
        }
    }

    stop() {
        if(this.running) {
            const time = Date.now() - this.startTime;
            this.running = false;
            if(this.interval) {
                clearInterval(this.interval);
                this.interval = 0;
                this.output.dispatchEvent(new CustomEvent("stop", { detail: time }));
            }
            this.reset();
            return time;
        }
        return this.offset;
    }
}
