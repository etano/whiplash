Object.defineProperty(global, '__stack', {
get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__function', {
get: function() {
        return __stack[1].getFunctionName();
    }
});

class GlobalTimer {
    constructor() {
        this.enabled = false;
        this.timers = {};
        this.get_timer('global');
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            for (var key in this.timers) {
                this.timers[key].enabled = true;
                this.timers[key].reset();
            }
            this.get_timer('global').start();
            return 'global timer enabled';
        } else {
            return 'global timer already enabled';
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            for (var key in this.timers) {
                this.timers[key].enabled = false;
            }
            this.get_timer('global').stop();
            return 'global timer disabled';
        } else {
            return 'global timer already disabled';
        }
    }

    get_timer(function_name) {
        if (!this.timers.hasOwnProperty(function_name)) {
            this.timers[function_name] = new Timer(this.enabled);
        }
        return this.timers[function_name];
    }

    report() {
        this.get_timer('global').stop();
        var total_time = this.get_timer('global').report()['total_time'];
        var reports = {};
        for (var key in this.timers) {
            var report = this.timers[key].report();
            report['percent_time'] = 100*(report['total_time']/total_time);
            reports.key = report;
        }
        this.get_timer('global').start();
        return {
            'total_time': total_time,
            'reports': reports
        };
    }
}

class Timer {
    constructor(enabled) {
        this.enabled = enabled;
        this.reset();
    }

    get_time() {
        return (new Date().getTime());
    }

    reset() {
        this.average_time = 0;
        this.count = 0;
        this.start_time = null;
        this.stop_time = null;
    }

    start() {
        if (this.enabled) {
            this.start_time = this.get_time();
            this.count++;
        }
    }

    stop() {
        if (this.enabled) {
            this.stop_time = this.get_time();
            var duration = (this.stop_time - this.start_time) / 1000;
            this.average_time = (this.average_time*(this.count-1) + duration)/this.count;
        }
    }

    report() {
        var res = {
            'average_time': this.average_time,
            'total_time': this.average_time*this.count,
            'count': this.count
        };
        return res;
    }
}

global.timer = new GlobalTimer();
