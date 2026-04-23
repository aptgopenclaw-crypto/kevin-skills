$(function(){
    var $li = $('ul.tab-title li');
        $($li. eq(0) .addClass('active').find('a').attr('href')).siblings('.tab-inner').hide();
    
        $li.click(function(){
            $($(this).find('a'). attr ('href')).show().siblings ('.tab-inner').hide();
            $(this).addClass('active'). siblings ('.active').removeClass('active');
			
		jQuery(document).ready(function(e) {
		var offset = jQuery(':target').offset();
		var scrollto = offset.top - 450; // minus fixed header height
		jQuery('html, body').animate({scrollTop:scrollto}, 0);
		})
			
        });
    });



/*title顯示時間*/
