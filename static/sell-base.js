$.key('f', function() {
        	$("#memberModal").modal("show"),
        	$("#memberModal").one("shown.bs.modal",
        	function() {
            	var e = $("#ac_customer_no");
            	$(e).select()
        	});
        
});


$.key('f7', function() {
    clearCart();
    $("#bar_code").focus()
});


$.key('f8', function() {
    0 != $("#cart tbody").children("tr").length && initDiscountFull()
    $("#bar_code").focus()

});

$.key('f2', function() {
    0 != $("#cart tbody").children("tr").length && initCheckoutModal()
    $("#bar_code").focus()

});


var totalIndex  = 0;

function setCurrentRowBg(cartIndex) {
    $("#cart tbody tr").each(function() {
        if($(this).attr("id") == cartIndex){
            $(this).addClass("currentRow")
        }else{
            $(this).removeClass("currentRow")
        }
    })
}

function setEndPrice() {
    var sale_price = 0.0;
    var points = 0;
    var list_price = 0.0;
    var saving = 0;
    var index = 0
    $("#cart tbody tr").each(function() {
        discount = $(this).find("[name='discount']").val()
        sale_price = $(this).find("[name='sale_price']").val()
        count = $(this).find("[name='qty']").val()
        console.log("index:" + index + "\t"   + discount + "\t" + sale_price + "\t" + count)
        list_price += sale_price * count
        index += 1
    })
    sale_price = list_price - saving;
    points =  parseInt(sale_price.toFixed(1))
    console.log("END:" + sale_price + "\t" + saving + "\t"   + points + "\t" + list_price)

    $("#t_points").text(points)
    $("#t_sale_price").text(sale_price.toFixed(2))
    $("#t_saving").text(saving.toFixed(2))
    $("#t_list_price").text(list_price.toFixed(2))
    $("#total_points").val(points);
    $("#total_list_price").val(list_price.toFixed(2));
    $("#total_saving").val(saving.toFixed(2))
    $("#total_sale_list_price").val(sale_price.toFixed(2))
        // $("#cart tbody").children("tr").length > 0 && ($("#total_qty").val(n), $("#total_price").val(s), $("#total_points").val(l), $("#total_list_price").val(i), $("#total_sale_list_price").val(d), $("#total_sale_price").val(p), $("#total_discount_enabled_list_price").val(u), $("#total_discount_enabled_sale_price").val(_), $("#total_refund_price").val(c), $("#total_saving").val(m), $("#spn_total_discount_enabled_list_price").text("最多可直减 " + doDecimal(u) + "元"), $("#t_sale_price").text(s), $("#t_points").text(doDecimal(l)), $("#t_list_price").text(doDecimal(doRound(i))), $("#t_saving").text(m), getCookie("cCustomerCode") ? $("#spn_t_points").show() : $("#spn_t_points").hide(), $("#ul_t").show());

}

function clearCart() {
    $("#cart tbody tr").each(function() {
            $(this).remove()
    })
    setEndPrice()
    $("#bar_code").focus()
    totalIndex = 0;

}


function removeCart(e) {
    $('#' + e).remove(); 
    setEndPrice()
    totalIndex -= 1;
    $("#bar_code").focus()
}


function updateCart(cartIndex) {
	$("#bar_code").focus()
    console.log("updateCart runing")
    $("#"+cartIndex).find("[name='t_total']").text(($("#"+cartIndex).find("[name='sale_price']").val() *  $("#"+cartIndex).find("[name='qty']").val()).toFixed(2))

    setEndPrice()
    setCurrentRowBg(cartIndex)
}

function addCart(count,code,name,price) {
    cartIndex = totalIndex  + 1
     R =    '<tr id="' + cartIndex + '"><td>' + cartIndex + '<br><i class="glyphicon glyphicon-star-empty"></i></td><td class="clip" title="' + name +'">' + name + '<br><span class="comment">' + code + '</span></td><td style="text-align:right">' + price + '</td><td><input class="remember" onchange="updateCart(' + cartIndex +')" type="text" name="discount" disabled="disabled" value="100" style="">' +
                                                 '</td><td><input class="price remember" onchange="updateCart(' + cartIndex+')" type="text" name="sale_price" value="'+price+'">' +
                                            '</td><td style="text-align:right"><input class="remember" onchange="updateCart('+cartIndex+')" type="text" name="qty" value="1" style="">' + 
                                           '</td><td name="t_total" style="text-align:right">' + price + '</td><td style="text-align:right">' + 
                                                '<span class="btn btn-xs" onclick="removeCart('+cartIndex+')"><i class="glyphicon glyphicon-remove white"></i></span></td></tr>'
    console.log(R)
    totalIndex += 1
    $("#cart tbody").prepend(R)
    setCurrentRowBg(cartIndex)
    setEndPrice()
    $("#bar_code").focus()

}

function addCartPre(){
	 var barcode = $("#bar_code").val()
	 url = "/goods/simple?barcode="+barcode
	 $.ajax({
    	cache: false,
    	type: "GET",
    	url:url,
		async: false,
		error: function(request) {
			toastr.error('出现内部错误！请重试！')
		},
		success: function(data) {
			var obj = JSON.parse(data)
			if(obj.success == 0){
				toastr.error(obj.barcode + " 没有加入库存！查找不到！")
			}else{
				console.log(obj.price)
				if(obj.price == 0){
						toastr.options["hideDuration"] = "3000";
						toastr.options["positionClass"] = "toast-top-left"

 //  		"closeButton": false,
 //  		"debug": true,
 //  		"positionClass": "toast-top-left",
 //  		"onclick": null,
 //  		"showDuration": "300",
 //  		"hideDuration": "3000",
 //  		"timeOut": "1500",
 //  		"extendedTimeOut": "1000",
 //  		"showEasing": "swing",
 //  		"hideEasing": "linear",
 //  		"showMethod": "fadeIn",
 //  		"hideMethod": "fadeOut"
	// }

					toastr.error("注意！注意！" + obj.name + " 价格为0，请检查！")
					// toastr.options["hideDuration"] = "1000";
					toastr.options["positionClass"] = "toast-top-right"

				}
				addCart(1,obj.barcode,obj.name,parseFloat(obj.price).toFixed(2))
			}
			$("#bar_code").val("")
			$("#bar_code").focus()

		}
	})

}


function initDiscountFull() {
    $("#final_pay").val($("#total_list_price").val())
    $("#discountModal").modal("show"),
    $("#discountModal").one("shown.bs.modal",       
    function() {
        $("#final_pay").select()
    })
}

function getData3(url){
        var defer = $.Deferred();
        $.ajax({
            url : url,
            //async : false,
            error: function(request) {
				toastr.error('出现内部错误！请重试！')
			},
            success: function(data){
                defer.resolve(data)
            }
        });
        return defer.promise();
}    

var cache = {};

function searchCustomerInfo(){
	url = "/vip/info?cardnumber=" + $("#ac_customer_no").val()

	// $.when(getData3(url)).done(function(data){
	// 		var obj = JSON.parse(data)
	// 		if(obj.cardnumber ==  $("#ac_customer_no").val()){
	// 		if(obj.success == "true"){
	// 			$("#x_customer_number").text(obj.cardnumber)	
	// 			$("#x_customer_number").attr("success","true")				
	// 			$("#x_customer_name").text(obj.name == "" ? "空" : obj.name)
	// 			$("#x_customer_points").text(obj.points == "" ? "空" : obj.points)
	// 			$("#x_customer_phone").text(obj.phonenumber == "" ? "空" : obj.phonenumber)
	// 			$(".input-lg p").css("color","")
	// 		}else{
	// 			$("#x_customer_number").attr("success","flase")				
	// 			$("#x_customer_number").text("卡号\"" + obj.cardnumber + "\"不存在!")
	// 			$("#x_customer_name").text("空")
	// 			$("#x_customer_points").text("空")
	// 			$("#x_customer_phone").text("空")
	// 			$(".input-lg p").css("color","red")
	// 		}
	// 	}
	// });
	if(cache[$("#ac_customer_no").val()]){
				data = cache[$("#ac_customer_no").val()]
				var obj = JSON.parse(data)
				if(obj.success == "true"){
					$("#x_customer_number").text(obj.cardnumber)	
					$("#x_customer_number").attr("success","true")				
					$("#x_customer_name").text(obj.name == "" ? "空" : obj.name)
					$("#x_customer_points").text(obj.points == "" ? "0" : obj.points)
					$("#x_customer_phone").text(obj.phonenumber == "" ? "空" : obj.phonenumber)
					$(".input-lg p").css("color","")
				}else{
					$("#x_customer_number").attr("success","flase")				
					$("#x_customer_number").text("卡号\"" + obj.cardnumber + "\"不存在!")
					$("#x_customer_name").text("空")
					$("#x_customer_points").text("0")
					$("#x_customer_phone").text("空")
					$(".input-lg p").css("color","red")
				}

	}else{

		$.ajax({
    	cache: false,
    	type: "GET",
    	url:url,
		async: false,
		error: function(request) {
			toastr.error('出现内部错误！请重试！')
		},
		success: function(data) {
				var obj = JSON.parse(data)
				cache[obj.cardnumber] = data
				if(obj.success == "true"){
					$("#x_customer_number").text(obj.cardnumber)	
					$("#x_customer_number").attr("success","true")				
					$("#x_customer_name").text(obj.name == "" ? "空" : obj.name)
					$("#x_customer_points").text(obj.points == "" ? "0" : obj.points)
					$("#x_customer_phone").text(obj.phonenumber == "" ? "空" : obj.phonenumber)
					$(".input-lg p").css("color","")
				}else{
					$("#x_customer_number").attr("success","flase")				
					$("#x_customer_number").text("卡号\"" + obj.cardnumber + "\"不存在!")
					$("#x_customer_name").text("空")
					$("#x_customer_points").text("0")
					$("#x_customer_phone").text("空")
					$(".input-lg p").css("color","red")
				}
			}
		})
	}

}


function initCheckoutModal(){

	var obj = {}
	var goods = []
	obj.goods = goods
    $("#cart tbody tr").each(function() {
    	var info = {}
    	info.barcode = $(this).find(".clip span").text()
    	info.discount = parseInt($(this).find("[name='discount']").val())
    	info.sale_price = parseFloat($(this).find("[name='sale_price']").val())
    	info.count = parseInt($(this).find("[name='qty']").val())
    	goods.push(info)
    });
    obj.total_points = parseInt($("#total_points").val());
    obj.total_saving = parseFloat($("#total_saving").val());
    obj.total_sale_price = parseFloat($("#total_sale_list_price").val());
    obj.total_list_price =  parseFloat($("#t_list_price").text())

    var customer_info = $("#r_customer_info").val()
    obj.r_customer_info = customer_info == "" ? "" : customer_info.split("/")[0]
    // alert(obj.r_customer_info)
    $.ajax({
    	cache: false,
    	type: "POST",
    	url:"/checkout",
		data: JSON.stringify(obj),
		async: false,
		error: function(request) {
			toastr.error('出现内部错误！请重试！')
		},
		success: function(data) {
			toastr.success(obj.total_sale_price +'元！结算成功！～')
			clearCart()
			clearCustomer()
			// alert(JSON.stringify(cache))
			cache= {}
		}
	})
}

function discountFull() {
    var e = $("#all_discount_type").val();
    if (console.log("--------------------- discountType @ discountFull() ->" + e), null != e && "" != e) {
        if (1 == e) {
            var t = ($("#all_saving"), $("#all_saving").val()),
            o = $("#final_pay").val(),
            a = /^[+-]?\d+\.?\d*$/;
            if (!a.test(t)) return $("#all_saving").next().text("直接金额必须是数字!").css({
                color: "#ff0000",
                "font-weight": "bold"
            }),
            void $("#all_saving").css("border", "1px solid #ff0000").focus().select();
            if ($("#all_saving").next().text("").removeAttr("style"), $("#all_saving").removeAttr("style"), !a.test(o)) return $("#final_pay").next().text("实收金额必须是数字!").css({
                color: "#ff0000",
                "font-weight": "bold"
            }),
            void $("#final_pay").css("border", "1px solid #ff0000").focus().select();
            $("#final_pay").next().text("").removeAttr("style"),
            $("#final_pay").removeAttr("style");
            // var r = (parseFloat($("#total_sale_price").val()), parseFloat($("#total_discount_enabled_sale_price").val())),
            // n = (parseFloat($("#total_sale_list_price").val()), parseFloat($("#total_saving").val())),
            // l = t - n,
            // s = 0,
            i = 0.00.toFixed(2);
            if (console.log("---------------- 直接减 @ discountFUll()-> " + parseFloat(t) + "/" + i), parseFloat(o) < i) return $("#all_saving").next().text("实收金额不能为负!").css({
                color: "#ff0000",
                "font-weight": "bold"
            })

            var sale_price = parseFloat(o);
            var points = parseInt(sale_price.toFixed(1));
            var saving = parseFloat($("#all_saving").val());
            console.log($("#t_saving").text() + " a\t " +parseFloat($("#t_saving").text())  + " b\t " + parseFloat($("#all_saving").val()))
            $("#t_points").text(points)
            $("#t_sale_price").text(sale_price.toFixed(2))
            $("#t_saving").text(saving.toFixed(2))
            $("#total_points").val(points);
            $("#total_saving").val(saving.toFixed(2))
            $("#total_sale_list_price").val(sale_price.toFixed(2))

            // void $("#all_saving").css("border", "1px solid #ff0000").focus().select();
            // $("#all_saving").next().text("").removeAttr("style");
            // $("#all_saving").removeAttr("style");
            $("#all_saving").val("")
            $("#all_discount").val("")
            $("#bar_code").focus()
            $("#discountModal").modal("hide")
        }
        if (2 == e) {
            var d = ($("#all_discount"), $("#all_discount").val());
            $("#all_discount").css("border", "1px solid #ff0000").focus().select();
            $("#all_discount").next().text("").removeAttr("style");
            $("#all_discount").removeAttr("style");
            var a = /^(?:1|[1-9][0-9]?|100)$/;
            if (!a.test(d)) return $("#all_discount").next().text("请输入折扣,1~100的整数!").css({
                color: "#ff0000",
                "font-weight": "bold"
            })
            var e = parseFloat($("#total_list_price").val());
            var sale_price = e  * parseInt(d)/100
            var points = parseInt(sale_price.toFixed(1));
            var saving = /*parseFloat($("#t_saving").text()) + */e - sale_price
            console.log("END:" + d + "\t"  + sale_price + "\t" + saving + "\t"   + points + "\t" + e)
            $("#t_points").text(points)
            $("#t_sale_price").text(sale_price.toFixed(2))
            $("#t_saving").text(saving.toFixed(2))
            $("#total_points").val(points);
            $("#total_saving").val(saving.toFixed(2))
            $("#total_sale_list_price").val(sale_price.toFixed(2))

            // $("#all_discount").css("border", "1px solid #ff0000").focus().select();
            // $("#all_discount").next().text("").removeAttr("style")
            // $("#all_discount").removeAttr("style")
            $("#all_saving").val("")
            $("#all_discount").val("")
			$("#bar_code").focus()
            $("#discountModal").modal("hide")
        }
    }
}

function sellForCustomerEx() {
	if($("#x_customer_number").attr("success") == "true" && $("#ac_customer_no").val() != ""){
		$("#r_customer_info").val($("#x_customer_number").text() + "/" + $("#x_customer_name").text() + "/" + $("#x_customer_points").text())
	}else{
		$("#r_customer_info").val("")
	}
	$("#bar_code").focus()
	$(".input-lg p").css("color","")
    $("#memberModal").modal("hide")
}

function clearCustomer(){
	$(".input-lg p").css("color","")
	$("#r_customer_info").val("")
	$("#x_customer_number").removeAttr("success")				
	$("#x_customer_number").text("")
	$("#x_customer_name").text("")
	$("#x_customer_points").text("")
	$("#x_customer_phone").text("")
	$("#ac_customer_no").val("")
}



$(document).ready(function() {
    var timeout;
	$("#bar_code").focus()
	toastr.options = {
  		"closeButton": false,
  		"debug": true,
  		"positionClass": "toast-top-right",
  		"onclick": null,
  		"showDuration": "300",
  		"hideDuration": "1000",
  		"timeOut": "1500",
  		"extendedTimeOut": "1000",
  		"showEasing": "swing",
  		"hideEasing": "linear",
  		"showMethod": "fadeIn",
  		"hideMethod": "fadeOut"
	}

    $("#btn_discount_type_a").click(function() {
        $("#btn_discount_type_b").removeClass("btn-primary"),
        $("#btn_discount_type_a").addClass("btn-primary"),
        $("#discount_a").removeClass("hide"),
        $("#discount_b").addClass("hide"),
        $("#all_discount_type").val(1),
        $("#final_pay").focus().select()
    }),
    $("#btn_discount_type_b").click(function() {
        $("#btn_discount_type_a").removeClass("btn-primary"),
        $("#btn_discount_type_b").addClass("btn-primary"),
        $("#discount_b").removeClass("hide"),
        $("#discount_a").addClass("hide"),
        $("#all_discount_type").val(2),
        $("#all_discount").focus().select()
    }),
    $("#btnGetCustomer").click(function() {
    	"" != $("#ac_customer_no").val() && searchCustomerInfo()
    }),
   	$("#bar_code").keyup(function(event) {
   		if($("#bar_code").val().toUpperCase() == "F"){
			$("#bar_code").val("")
        	$("#memberModal").modal("show"),
        	$("#memberModal").one("shown.bs.modal",
        	function() {
            	var e = $("#ac_customer_no");
            	$(e).select()
        	});
        }

   		// event = e || event
   		if(event.keyCode == 13){
   			addCartPre()
   			// alert($("#bar_code").val())
   		}
    	// "" != $("#ac_customer_no").val() && searchCustomerInfo()
    }),
    $("#btnSearch").click(function(event) {
        initSearchProductModal(),
        $("#searchModal").one("shown.bs.modal",
        function() {
            $("#kw").select()
        }),
        $("#searchModal").modal("show")
    }),
    $("#btnDiscount").click(function(event) {
    	$("#bar_code").focus()
        0 != $("#cart tbody").children("tr").length && initDiscountFull()
    }),
    $(".openMemberModal").click(function() {
        $("#memberModal").modal("show"),
        $("#memberModal").one("shown.bs.modal",
        function() {
            var e = $("#ac_customer_no");
            $(e).select()
        })
    }),
    $("#btnMember").click(function(event) {
        var e = $(this).find("i:first").attr("class");
        console.log("###################i class->" + e + "/" + $(this).find("i:first").hasClass("glyphicon-option-horizontal")),
        $(this).find("i:first").hasClass("glyphicon-option-horizontal") && $(".openMemberModal").click(),
        $(this).find("i:first").hasClass("glyphicon-remove") && restorePrice()
    }),
    $("#btnCheckout").click(function() {
    	$("#bar_code").focus()
        0 != $("#cart tbody").children("tr").length && initCheckoutModal()
    }),
    $("#ac_customer_no").keyup(function(event) {
    	// alert($("#ac_customer_no").val())
        if(event.keyCode == 13){
        	sellForCustomerEx();
        	$("#bar_code").focus()
        }else{
            if("" != $("#ac_customer_no").val()){
                clearTimeout(timeout);
                timeout=setTimeout(function(){ // setting the delay for each keypress
                    searchCustomerInfo()
                }, 100);
            }
            

        	// "" != $("#ac_customer_no").val() && searchCustomerInfo()
        }

    }),
	$("#final_pay").keyup(function(event) {
		var e = parseFloat($("#total_list_price").val());
        console.log("--------------------- totalListPrice  ->" + e);
        var t = ($("#all_saving").val(), $("#final_pay").val()),
        o = /^[+-]?\d+\.?\d*$/;
        var res = o.test(t) ? ($("#final_pay").next().text("").removeAttr("style"), $("#final_pay").removeAttr("style"), $("#all_saving").val((e - t).toFixed(2)), void 0) : ($("#final_pay").next().text("折扣金额必须是数字!").css({
            color: "#ff0000",
            "font-weight": "bold"
        }), void $("#final_pay").css("border", "1px solid #ff0000").focus().select())
        if(event.keyCode == 13){
             discountFull();
             $("#bar_code").focus()
         }else{
         	return res;
         }
    }),
    $("#all_saving").keyup(function(event) {
        if(event.keyCode == 13){
             discountFull();
             $("#bar_code").focus()
        }else{
            var e = parseFloat($("#total_list_price").val());
            console.log("--------------------- totalListPrice  ->" + e);
            var t = $("#all_saving").val(),
            o = ($("#final_pay").val(), /^[+-]?\d+\.?\d*$/);
            return o.test(t) ? ($("#all_saving").next().text("").removeAttr("style"), $("#all_saving").removeAttr("style"), $("#final_pay").val((e - t).toFixed(2)), void 0) : ($("#all_saving").next().text("实收金额必须是数字!").css({
                color: "#ff0000",
                "font-weight": "bold"
            }), void $("#all_saving").css("border", "1px solid #ff0000").focus().select())
        }   
    }),
    $("#all_discount").keyup(function(event) {
        if(event.keyCode == 13){
             discountFull();
        }else{      
            var e = ($("#all_discount"), $("#all_discount").val()),
            t = /^(?:1|[1-9][0-9]?|100)$/;
            return t.test(e) ? ($("#all_discount").next().text("").removeAttr("style"), void $("#all_discount").removeAttr("style")) : ($("#all_discount").next().text("请输入折扣,1~100的整数!").css({
                color: "#ff0000",
                "font-weight": "bold"
            }), void $("#all_discount").css("border", "1px solid #ff0000").focus().select())
        }
    })
}), Date.prototype.Format = function(e) {
    var t = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds()
    };
    /(y+)/.test(e) && (e = e.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)));
    for (var o in t) new RegExp("(" + o + ")").test(e) && (e = e.replace(RegExp.$1, 1 == RegExp.$1.length ? t[o] : ("00" + t[o]).substr(("" + t[o]).length)));
    return e
};