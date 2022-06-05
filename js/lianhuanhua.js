var gallery;
function showGallery(jsonUrl,resourceUrl){
	var zoom=$("body").css("zoom");
	$("body").css("zoom",1.2);
	$("#langhuanhua-audio-background").attr("src",resourceUrl+"/background.mp3");
	$("#langhuanhua-audio-background")[0].volume=0.1;
	$.getJSON(jsonUrl , function(data) {
		for(var i=0;i<data.length;i++){
			data[i].image=resourceUrl+"/"+data[i].image;//add resource url to image.
		}
		gallery=blueimp.Gallery(data,{
			titleProperty:"label",
			altTextProperty:"label",
			urlProperty:"image",
			thumbnailProperty:"image",
			startSlideshow: true,
			transitionDuration: 1000,//1s for animation
			slideshowTransitionDuration: 1000,//1s for animation
			onslideend:function(index, slide){
				//clear the auto play timeout handle. because the next page will be shown after speech.
				window.clearTimeout(gallery.timeout);
				window.clearTimeout(gallery.timeoutForSpeech);
				try{
					//stop speech.
					speechSynthesisCancel();
					//split text. Because long text maybe stop the tts engine.
					var ary=gallery.list[index].hanzi.split("。");
					speechSynthesisTexts=[];
					for(var i=0;i<ary.length;i++){
						if (ary[i]==""){
							//do nothing
						}else if (ary[i].length<60){
							speechSynthesisTexts.push(ary[i]+"。");
						}else{
							var ary2=ary[i].split("，");
							var t="";
							for (j=0;j<ary2.length;j++){
								if (t.length+ary2[j].length>=60){
									speechSynthesisTexts.push(t);
									t="";
								}
								if (j==ary2.length-1){
									t+=ary2[j]+"。";
								}else{
									t+=ary2[j]+"，";
								}
							}
							speechSynthesisTexts.push(t);
						}
					}
					console.log(speechSynthesisTexts);
					//wait 1s for slide changing animation
					window.clearTimeout(gallery.timeoutForSpeech);
					gallery.timeoutForSpeech=setTimeout(function(){speechSynthesisSpeak();},
						speechSynthesisTexts.length==0?10000:1000);
					//if it is the last page, stop the auto play.
					if (index==gallery.list.length-1){
						gallery.pause();
					}
				}catch(e){console.log(e);}
			},
			onclose:function(){
				//clear the auto play timeout handle. because the next page will be shown after speech.
				window.clearTimeout(gallery.timeout);
				window.clearTimeout(gallery.timeoutForSpeech);
				try{
					speechSynthesisCancel();
				}catch(e){console.log(e);}
				$("#langhuanhua-audio-background")[0].pause();
				$("body").css("zoom","");
			}
		});
		$(".slides").css("background-image","url("+resourceUrl+"/background.jpg)");
	});
}
var speechSynthesisTexts=[];
var isSpeechSynthesisCanceled=false;
function speechSynthesisCancel(){
	speechSynthesis.cancel();
	isSpeechSynthesisCanceled=true;
}
function speechSynthesisSpeak(){
	var text=speechSynthesisTexts.shift();
	if (text!=""&&text!=null){
		speech.text=text;
	}else{
		speech.text="";
	}
	speechSynthesis.speak(speech);
	isSpeechSynthesisCanceled=false;
}
$(function(){
	try{
		speech.rate = 0.9;
		speech.onend = function() {
			if (!isSpeechSynthesisCanceled){
				if (speechSynthesisTexts.length>0){
					speechSynthesisSpeak();
				}else{
					if (gallery.interval) {
						gallery.next();
					}
				}
			}
		}
		speechSynthesis.onvoiceschanged=function(){
			var voices = speechSynthesis.getVoices();
			for (var i=0;i<voices.length;i++){
				if (voices[i].lang=="zh-CN"){
					speech.voice=voices[i];
					break;
				}
			}
		}
		speechSynthesis.cancel();
	}catch(e){}
	$("body").append("<audio id='langhuanhua-audio-background' autoplay></audio><div id='blueimp-gallery' class='blueimp-gallery' aria-label='image gallery' aria-modal='true' role='dialog'><div class='slides' aria-live='polite'></div><h3 class='title'></h3><a class='prev' aria-controls='blueimp-gallery' aria-label='previous slide' aria-keyshortcuts='ArrowLeft'></a><a class='next' aria-controls='blueimp-gallery' aria-label='next slide' aria-keyshortcuts='ArrowRight'></a><a class='close' aria-controls='blueimp-gallery' aria-label='close' aria-keyshortcuts='Escape'></a><a class='play-pause' aria-controls='blueimp-gallery' aria-label='play slideshow' aria-keyshortcuts='Space' aria-pressed='false' role='button'></a><ol class='indicator'></ol></div>");
});
const speech = new SpeechSynthesisUtterance();

