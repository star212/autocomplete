/*
combined files : 

gallery/kissy/1.0/index

*/
/**
 * @fileoverview 
 * @author quxing<star212417@163.com>
 * @module kissy
 **/
KISSY.add('mobile/kissy/1.0/index',function (S, Node,Base) {
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




