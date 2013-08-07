/**
 * @fileoverview 
 * @author quxing<star212417@163.com>
 * @module kissy
 **/
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 
     * @class Kissy
     * @constructor
     * @extends Base
     */
    function Kissy(comConfig) {
        var self = this;
        //调用父类构造函数
        Kissy.superclass.constructor.call(self, comConfig);
    }
    S.extend(Kissy, Base, /** @lends Kissy.prototype*/{

    }, {ATTRS : /** @lends Kissy*/{

    }});
    return Kissy;
}, {requires:['node', 'base']});



