function showHideLayer(layerid, actionid) {
    if (actionid == 'show') {
        $('#' + layerid).show();
		$("a[data-layerid='"+layerid+"']").addClass("liact"); 
    } else {
        $('#' + layerid).hide();
		$("a[data-layerid='"+layerid+"']").removeClass("liact");

    }
}

function  init_nav() {
    $(".bind_menu_a").bind({
        mouseover: function(){
            var $t = $(this);
            var layerid = $t.data('layerid');
            showHideLayer(layerid, 'show');
        },
		focus: function(){
            var $t = $(this);
            var layerid = $t.data('layerid');
            showHideLayer(layerid, 'show');
        },
        mouseout: function(){
            var $t = $(this);
            var layerid = $t.data('layerid');
            showHideLayer(layerid, 'hide');
        }
    });
	
    return false;
}

$(function(){
	$(".bind_menu_a[data-layerid='layer1']").bind('click', function(event) {
		setTimeout(function(){
			$("#layer1").find('a:first').focus();
		
		}, 1);
		
	});	
	
    $(".bind_menu_a").find('a:last').bind({
        focusout: function(e){
        	var thid = $(e.target).closest(".bind_menu_a").attr("id");
			
			showHideLayer(thid, 'hide');
        }
    });

	$(".bind_menu_a").on("keydown", function (e) {
        if (e.shiftKey && e.key === "Tab" && $(e.target).hasClass("bind_menu_a")) {
              const layerId = $(this).data("layerid");
              $("#" + layerId).hide();
              $(this).removeClass("liact");
            }
     });
	
})




$(function(){
    init_nav();
});



	

	

	

	

	$(".icon.icon-map").bind('keyup', function(event) {

		if(event.which === 9) {

			setTimeout(function(){

			$(".map-container .map-left .map-selector").find('a:first').focus();

		}, 1);

		}

	});

	

	

	

	

	$(".icon.icon-map").bind('keyup', function(event) {

		if(event.which === 9) {

			setTimeout(function(){

			$(".map-container .map-left .map-selector").find('a:first').focus();

		}, 1);

		}

	});

/*// 頂端次選單的顯示與關閉
function tipSwitchMenu(){
    $('.menu .container > ul > li > a').on({
        click: function(){
            return false;
        },
        mouseover: function(){
            $('.menu li').removeClass('active').find('a').blur();
        },
        focus: function(){
            $('.menu li').removeClass('active');
            $(this).parent('li').addClass('active');
        }
    });

    //判斷是否離開主選單區域
    $(document).delegate('a','focusin', function(event){
        if ( $(this).parents('.menu').length < 1 ) {
            $('.menu li').removeClass('active').find('a').blur();
        };
    });

    //頂端凍結
    $(window).scroll(function(){
        if ( $(window).scrollTop() > parseInt($('.header').height()) ) {
            $('.menu').css('position','fixed');
        } else {
            $('.menu').css('position','static');
        }
    });

    return false;
}*/

