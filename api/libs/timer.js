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
        this.enabled = true;
        for (var key in this.timers) {
            this.timers[key].enabled = true;
            this.timers[key].reset();
        }
        this.get_timer('global').start();
        return 'global timer enabled';
    }

    disable() {
        this.enabled = false;
        for (var key in this.timers) {
            this.timers[key].enabled = false;
            this.timers[key].reset();
        }
        this.get_timer('global').stop();
        return 'global timer disabled';
    }

    get_timer(function_name) {
        if (!this.timers.hasOwnProperty(function_name)) {
            this.timers[function_name] = new Timer(function_name);
        }
        return this.timers[function_name];
    }

    report() {
        if (this.enabled) {
            this.get_timer('global').stop();
            var total_time = this.get_timer('global').report()['total_time'];
            var reports = [];
            for (var key in this.timers) {
                var report = this.timers[key].report();
                report['percent_time'] = 100*(report['total_time']/total_time);
                reports.push(report);
            }
            this.get_timer('global').start();
            return {
                'total_time': total_time,
                'reports': reports
            };
        } else {
            return {
                'total_time': 0,
                'reports': {}
            };
        }
    }
}

class Timer {
    constructor(name) {
        this.name = name;
        this.count = 0;
        this.start_time = null;
        this.stop_time = null;
        this.average_time = 0;
        this.enabled = false;
    }

    get_time() {
        return (new Date().getTime());
    }

    reset() {
        this.average_time = 0;
        this.count = 0;
    }

    start() {
        if (this.enabled) {
            this.count++;
            this.start_time = this.get_time();
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
            'name': this.name,
            'average_time': this.average_time,
            'total_time': this.average_time*this.count,
            'count': this.count
        };
        return res;
    }
}

global.timer = new GlobalTimer();
