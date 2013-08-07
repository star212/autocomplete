/*=============================================================================
#     FileName: demo.js
#         Desc: autocomplete
#       Author: Smeagol
#        Email: star212417@163.com
#     HomePage: http://www.quxing.info
#      Version: 0.0.1
#   LastChange: 2013-02-27 15:42:36
#      History:
=============================================================================*/
seajs.config({
    alias: {
        //'mu': 'mustache/0.4.0/mu',
        'zepto': 'zepto/1.0.0/zepto'
    },
    //preload: ['plugin-less'],
    base : 'http://a.tbcdn.cn/mw/base/libs/', 
    //base: 'http://a.tbcdn.cn/mw/etao/touch/js/sea-modules',
    debug: 1
});

define(function(require) {

    var $ = require("zepto");
    var autocomplete = require('../src/autocomplete');
    //var txtSearch = new search(".c-form-search",{callback:function(){
    //    alert(2);
    //}});
    var url = "http://suggest.taobao.com/sug";
    var clear = ["http://s.m.taobao.com/historyAjax.htm?delete=true&stype=1", "http://s.m.taobao.com/historyAjax.htm?delete=true&stype=2", "http://s.m.tmall.com/historyAjax.htm?delete=true&stype=1"];
    var a = $('#J_Search').autoComplete({
        ajaxUrl: url,
        wrapEl: '.suggest-wrap',
        listEl: '.suggest',
        close: '.suggest .close',
        //anim: true,
        //history: ["http://s.m.taobao.com/historyAjax.htm?stype=1", "http://s.m.taobao.com/historyAjax.htm?stype=2", "http://s.m.tmall.com/historyAjax.htm?stype=1"],
        //history:"json/history.json", 
        addition: true,
        additionClass: ".addition"
        //clearHistory: clear
    });

});

