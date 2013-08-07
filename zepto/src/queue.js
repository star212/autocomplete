/**
 * 简单的队列
 * @author 瞿星 wb-quxing@taobao.com
 */

define(function(require, exports, module) {

    var _op = function() {
        var that = this;
        var _i = setInterval(function() {
            if (that.Queue.length > 0 && ! that.stop) {
                //console.log(that.Queue);
                var obj = that.Queue.shift()
                obj["fn"](obj.argument);
                if (obj["callBack"]) {
                    obj["callBack"]()
                }
            }
            else {
                clearInterval(_i);
            }
        },
        this.setTimeout);
    }
    var queue = function(){

            var that = this;
            that.Queue = [];
            /* 异步队列 */
            that.syncQueue = [];
            /* 同步队列 */
            that.setTimeout = 500;
            /* 执行间隔 */
    }

    queue.prototype = {

        constructor: queue,

        add: function(fn, argument, callBack) {
            /* 添加队列 */
            this.Queue.push({
                fn: fn,
                argument: argument,
                callBack: callBack
            });
            return this;
        },
        addSync: function(fn, argument, callBack) {
            /* 添加队列 */
            this.syncQueue.push({
                fn: fn,
                argument: argument,
                callBack: callBack
            });
            return this;
        },
        clear: function() {
            /* 清空队列 */
            this.Queue = [];
            return this;
        },
        stop: false,
        //异步模式延时队列，按timeout执行，防连续触发。
        start: function() {
            this.stop = false;
            if (this.setTimeout > 0) {
                _op.apply(this);
            }
            return this;
        },
        shift: function() {

        },
        //同步模式先进先出
        dequeue: function(context) {
            var obj = this.syncQueue.shift();
            if (obj) {
                obj["fn"].call(context || this, obj.argument);
                obj["callBack"] && obj["callBack"].call(context || this);
            }
        }
    }
    exports.singleton = new queue;
    exports = queue;
});

