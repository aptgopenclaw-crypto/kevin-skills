var show_tab;
var tab_array=[];
var disabled_tab=[];
function chtd_tab(){
	    var idx = 0;
		if(arguments.length > 0) {
			idx = arguments[0];
		}
		jQuery("li[id^='tab']").each(function(i,el) {
			tab_array[i]=jQuery(el).children("a").attr("tab");
			if(i==idx){
				jQuery(jQuery(el).children("a").attr("tab")).show();
				show_tab=jQuery(el).children("a").attr("tab");
				jQuery(el).children("a").attr("class","active");
				jQuery(el).children("a").children().addClass("active2");
			}
			else
				jQuery(jQuery(el).children("a").attr("tab")).hide();
		});
		$(document).on("mouseover", "li[id^='tab']",
			function (){
			jQuery(this).children("a").addClass("hover");
			jQuery(this).children("a").children().addClass("hover2");
			}
		);
		$(document).on("mouseout", "li[id^='tab']",
			function (){
			jQuery(this).children("a").removeClass("hover");
			jQuery(this).children("a").children().removeClass("hover2");
			}
		);
		$(document).on("click", "li[id^='tab']",function (){
			if(typeof(jQuery(this).children("a").attr("parent"))=='undefined'){
				goto_tab(jQuery(this).children("a").attr("tab"));
			}
			else{
				goto_tab2(jQuery(this).children("a").attr("tab"),jQuery(this).children("a").attr("parent"));
			}
		}); 
}
function goto_tab(name){
	if(jQuery.inArray(name,disabled_tab)==-1){
		jQuery(".active").attr("class","tab_b");
		jQuery(".active2").removeClass("active2");
		jQuery("[tab='"+name+"']").attr("class","active");
		jQuery("[tab='"+name+"']").children().addClass("active2");
		jQuery(""+show_tab).hide();
		show_tab=name;
		jQuery(name).show();
	}
}
function goto_tab2(name,name2){
	if(jQuery.inArray(name,disabled_tab)==-1){
		jQuery(".active").attr("class","tab_b");
		jQuery(".active2").removeClass("active2");
		jQuery("[tab='"+name+"']").attr("class","active");
		jQuery("[tab='"+name+"']").children().addClass("active2");
		jQuery("[tab='"+name2+"']").attr("class","active");
		jQuery("[tab='"+name2+"']").children().addClass("active2");
		jQuery(""+show_tab).hide();
		show_tab=name;
		jQuery(name).show();
		jQuery(name2).show();
	}
}
function tabs_next(){
	var i=1;
	while(jQuery.inArray(tab_array[jQuery.inArray(show_tab,tab_array)+i],disabled_tab)>-1)
		i++;
	goto_tab(tab_array[jQuery.inArray(show_tab,tab_array)+i]);
}
function tabs_previous(){
	var i=1;
	while(jQuery.inArray(tab_array[jQuery.inArray(show_tab,tab_array)-i],disabled_tab)>-1)
		i++;
	goto_tab(tab_array[jQuery.inArray(show_tab,tab_array)-i]);
}
function tabs_next_name(){
	var i=1;
	while(jQuery.inArray(tab_array[jQuery.inArray(show_tab,tab_array)+i],disabled_tab)>-1)
		i++;
	return tab_array[jQuery.inArray(show_tab,tab_array)+i].replace(/#/gi,"");
}
function tabs_previous_name(){
	var i=1;
	while(jQuery.inArray(tab_array[jQuery.inArray(show_tab,tab_array)-i],disabled_tab)>-1)
		i++;
	return tab_array[jQuery.inArray(show_tab,tab_array)-i].replace(/#/gi,"");
}
function tabs_disable(name){
	if(jQuery.inArray(name,disabled_tab)==-1){
		disabled_tab.push(name);
		jQuery("[tab='"+name+"']").parent().unbind("click");
		jQuery("[tab='"+name+"']").addClass("disabled");
		jQuery("[tab='"+name+"']").children().addClass("disabled2");
	}
}
function tabs_enable(name){
	disabled_tab[jQuery.inArray(name,disabled_tab)]=null;
	jQuery("[tab='"+name+"']").parent().click(function (){
			goto_tab(jQuery(this).children("a").attr("tab"));
		});
	jQuery("[tab='"+name+"']").parent().hover(
			function (){
			jQuery(this).children("a").addClass("hover");
			jQuery(this).children("a").children().addClass("hover2");
			},
			function (){
			jQuery(this).children("a").removeClass("hover");
			jQuery(this).children("a").children().removeClass("hover2");
			}
		);
	jQuery("[tab='"+name+"']").removeClass("disabled");
	jQuery("[tab='"+name+"']").children().removeClass("disabled2");
}