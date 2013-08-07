/**
 * 
 * 依赖zepto
*/

 define(function(require,exports,module){

    var $ = require("zepto");
    var queue = require('./queue').singleton;
	queue.setTimeout = 100;

    //防xss htmlEncode
    var htmlEncode = function(str){
        var div = document.createElement("div");
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    //autoComplete组件 2011.1.07
    $.fn.autoComplete = function(options){
        var setting = {
            ajaxUrl:"http://suggest.taobao.com/sug", //ajax路径
            operator:'.J_autocomplete', //触发搜索文本框
            wrapEl:'.wrap', //内容展示层
            listEl:'.list', //用来包裹列表内层元素的层
            childEl:'li', //列表内层元素
            submit:'.btn',//提交表单的按钮
            close:'.close',//关闭内容展示层
            collapse:'collapse', //收缩状态class
            expand:'expand', //展开状态class
            delay:0, //延迟时间，2012.6.28暂时引入了队列，来阻止异步的时候，出现的bug，异步的设置里有timeout
            anim: false, //是否动画
            history: false, //历史记录请求的url，支持字符串和数组
            localStorage: "searchhistory", //历史从本地读取,false自动从网上获取。设置为本地的key
            clearHistory: "clear", //清除历史的url
            addition: false, //是否有附加功能
            additionClass: ".addition", //附加按钮的样式
            max: 7, //最多记录数
            //点击列表项时执行
            afterItemClick: function(n) {
               console.log(n);
            },
            //历史加载完成
            onHisLoad: function(){console.log("history ready.")}
        }

        options && $.extend(setting, options);

        var that = this;

        var autoComplete = {
            //存放发生ajax请求，用于清除
			ajax: [],
            //历史数据的数组
			hisList : [],
            //用于设置历史数据的索引
            hisIndex: 0,
            //历史加载完成
            onHisLoad: setting.onHisLoad,
            //是否打开状态
            isOpen: function(i){
                return that.eq(i).hasClass("expand");
            },
            //添加历史
            addHistory: function(value){

                //解码
                //try {
                //    value = window.encodeURIComponent(value);
                //}catch(e) {
                //    console.error("解码失败");
                //}
                //拿到localStorage的数据

                var s = localStorage,
                data = s.getItem(setting.localStorage);

                //如果没有的，就进行初始化
                this.hisList = data && JSON.parse(data) || [];
                var listItem = this.hisList[this.hisIndex] || {'result': []};

                //去掉之前的重复记录
                var filterList = $.map(listItem.result, function(item, index){  
					if(item[0] == value || index + 2 > setting.max) return null;
					else return [item];
				});

                filterList.unshift([value]);
                listItem.result = filterList;
                //初始化时需要重新赋值
                this.hisList[this.hisIndex] = listItem;

                //写入数据
                try{s.setItem(setting.localStorage,JSON.stringify(this.hisList));}
				catch(e){console.error("写入失败")}
            }
            
		};

        var close = function() {

            var timer = null;
            var that = this;
            timer = setTimeout(function(){
                if(!setting.anim){
                    that.removeClass(setting.expand).addClass(setting.collapse);
                }else{
                    that.find(setting.wrapEl).hide();
                }
            },setting.delay);

        };

        $(this).each(function(){
            var self = $(this);
            //console.log(self);


			/* 优先请求历史记录 支持数组*/
			if(setting.history){
                
                //是否从本地读取
                if(setting.localStorage) {
                    window.localStorage && (autoComplete.hisList = eval(localStorage.getItem(setting.localStorage) || []));
                }else{

                    var hisArray = typeof(setting.history) == "string" ? [setting.history] : setting.history; 

                    for (var i = 0; i < hisArray.length; i++) {
                        queue.addSync($.ajax,{
                            url: hisArray[i],
                            type:"GET",
                            dataType:"jsonp",
                            error:function(){
                                console.log('网络连接失败，请刷新页面重试');
                                return false;
                            },
                            success:function(json, status, xhr){
                                autoComplete.hisList.push(json);
                                queue.dequeue();
                            }
                        });
                    };
                    queue.addSync(autoComplete.onHisLoad);

                    queue.dequeue();

                }
			}
            var operator = $(this).find(setting.operator);
            var $close = self.find(setting.close);
            //设置文本框的autocomplete
            operator.attr('autocomplete','off');
            //解决HTML5 placeholder属性在Android Webkit上的交互细节BUG
            operator.focus(function(){
                if($(this).val() == ''){
                    $(this).val('');
                }
            });
			

            //判断是否底部，由于大部分文本框在初始化以后是隐藏状态，拿不到距离，所以只能在输入和聚焦时检测。
            var btm = false;
            var isIOS = /iphone/.test(navigator.userAgent.toLowerCase());
            function hack(){
               var offsetTop = operator.offset().top;
               //console.log(offsetTop);
               //console.log(window.document.body.offsetHeight);
               if(window.document.body.offsetHeight - offsetTop < 200) {
                   btm = true;
               }
            }
            //判断为空时出现历史
            var showHistory = function() {

                //兼容性&用户体验设计
                //android下，文本框离页面底部太近时不弹出提示。

                if(!btm)hack();

                if(btm && !isIOS){
                   return;
                }
                //兼容end

                var data = $(this).val().replace(/(^\s+)|(\s+$)/g,'');
                //文本为空时返回
                if(data.length==0 && setting.history){
                    //self.find(setting.wrapEl).slideUp();
                    queue.add(getHistory);
                    queue.start();
                    return false;
                }else{
                    return data;
                }
            }

            var initInput = function(e){
                var e = e||window.event;

                queue.clear();
                autoComplete.clear();

                var data = showHistory.call(this);
                if(!data){
                   close.call(self);
                   return;
                }

                //兼容性&用户体验设计
                //android下，文本框离页面底部太近时不弹出提示。
                if(!btm)hack();

                if(btm && !isIOS){
                   return;
                }

                //首次触发滚动屏幕，让文本框置顶
                if (!this.onceScroll) toTop();
                this.onceScroll = true;

                queue.add(getList,data);
                queue.start();

				
            };

            //文本框上的事件
            operator.on("input",initInput);
            operator.focus(showHistory);

            //异步请求数据
            function getList(text){
                var ajaxurl = setting.ajaxUrl;
				
                autoComplete.ajax.push($.ajax({
                    url:ajaxurl,
                    type:"GET",
                    dataType:"jsonp",
                    data:"code=utf-8&extras=1&q=" + text,
                    error:function(){
                        //alert('网络连接失败，请刷新页面重试');
                        return false;
                    },
                    success:function(json){
                        render(json);
                        $close.html("关闭").removeClass("clear");
                    }
                    //complete : function(xhr, status) {
                        //console.log(xhr);
                        //console.log(status);
                    //}
                }));
            }
            //获得历史记录
            function getHistory(){
				var json = autoComplete.hisList[autoComplete.hisIndex];
                render(json);
                $close.html("清除历史记录").addClass("clear");
            }

            //清除历史记录
            function clearHistory(){
                if(setting.localStorage) {
                    localStorage.removeItem(setting.localStorage);
                }else{

                    var clearArray = typeof(setting.clearHistory) == "string" ? [setting.clearHistory] : setting.clearHistory; 



                    //这里也要用到同步来清除，同一时间删cookie会有问题。
                    queue.clear();
                    for (var i = 0; i < clearArray.length; i++) {
                        queue.addSync($.ajax, 
                        {
                              url: clearArray[i],
                              dataType:"jsonp",
                              success: function(data){
                                  queue.dequeue();
                              }
                        });
                    };
                    queue.dequeue();

                }
                autoComplete.hisList = [];
            }

            //DOM组装联想搜索数据
            function render(json){
                if(json && json.result != false && json.result.length > 0){ //请求结果成功
                    var html = '';
                    var num = json.result.length > setting.max ? setting.max : json.result.length;
                    var addition = setting.addition ? "<div class='" + setting.additionClass.slice(1) + "'></div>" : "";
                    for(var i=0;i<num;i++){
                        html += '<li key="'+ htmlEncode(json.result[i][0]) +'">'+ "<div>" + htmlEncode(json.result[i][0])+ "</div>" + addition + '</li>';
                    }
                    self.find(setting.listEl + " ul").html(html);
                    effect();
                }else{
                    //self.find(setting.wrapEl).slideUp('normal');
                    close.call(self);
                    return;
                }
            }

            //组装内容后操作
            function effect(){
                var timer = null;
                //展开联想搜索内容
                timer = setTimeout(function(){
                    if(!setting.anim){
                        self.removeClass(setting.collapse).addClass(setting.expand);
                    }else{
                        self.find(setting.listEl).show();
                    }
                },setting.delay);

                //避免重复绑定
                self.find(setting.close).unbind('click');
                self.find(setting.childEl).unbind('click');

                //点击关闭联想内容
                self.find(setting.close).click(function(){
                    var interval = 0;
                    close.call(self);

                    //interval = $(window).scrollTop() - operator.offset().top;
                    if (interval > 0) toTop();
                    if($close.hasClass("clear")) {
                        clearHistory();
                    }
                });

                //搜索提交表单
                //uc下有点击反馈，不用代理了。
                //self.on("click",setting.childEl,function(){

                self.find(setting.childEl).click(function(){

                   var $this = $(this);
                   setting.afterItemClick.call(this,Number($this.index()) + 1);
                   //暂时注释
                   //if(setting.isUseKey){
                   //    self.find('#J_IsUseSearchSuggest').val($('#J_StatisticsKeyword').val());
                   //}
                   var text= $this.attr('key');
                   //console.log(text);
                   operator.val(text); //赋值给文本框

                   //触发提交
                   //var evt = document.createEvent("MouseEvents");  
                   //evt.initEvent("click", true, true);  
                   //self.find(setting.submit)[0].dispatchEvent(evt);
                   close.call(self);

                   var submitBtn = self.find(setting.submit)[0];
                   submitBtn && submitBtn.click();
                });
            }

            //让文本框位置移到顶部
            function toTop(){
                var offsetTop = operator.offset().top;
                setTimeout(function(){window.scrollTo(0,offsetTop)}, 1000);
            }
            
            //添加联想词附加到关键词上的功能
            setting.addition && self.find(setting.listEl + " ul").on("touchstart click", "div" + setting.additionClass,function(e){
                var $this = $(this);
                operator.focus();
                operator.val($this.parent().attr("key"));

                //聚焦到最后，无法成功，只能选到最后的前一个字符
                //var length = operator[0].value.length;
                //console.log(length);
                //operator[0].setSelectionRange(length,length); 
                
                initInput.call(operator);
                e.preventDefault();
                e.stopPropagation();
            });


            //是否历史功能
            if (setting.history) {
                autoComplete.getHistory = function(){
					queue.clear();
                    queue.add(getHistory);
                    queue.start();
				};
            }else{
                autoComplete.getHistory = function(){};
            };

        });
        
        autoComplete.close = function(){
           queue.clear();
           autoComplete.clear();
           that.each(function(){
               var self = $(this);
               close.call(self);
           });
        };
        //清空已出队列的异步请求
        autoComplete.clear = function() {
            if(autoComplete.ajax.length){
                for(i=0;i<autoComplete.ajax.length;i++){
                    autoComplete.ajax[i] && autoComplete.ajax[i].abort();	
                }
                autoComplete.ajax = [];
            }
        }
        
        return autoComplete;
    };

});
