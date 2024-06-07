(function($) {

	"use strict";

	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
      $('#sidebar').toggleClass('active');
  });

})(jQuery);


function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}



const user = JSON.parse(getCookie('user'))

const sender_id = user._id;
let receiver_id;
const  socket = io('/user-namespace',{
auth:{
	token:sender_id 
}
})



$(()=>{
		 $('.user-list').click(function(){
			receiver_id = $(this).data("reciever_id");
		
				 $('.start-head').hide();
				 $('.chat-section').show();
				 socket.emit('existsChat',{sender_id,receiver_id})
				 scrollChats()

		 })
})



			 //update user online status

socket.on("getOnlineUser",function(onlineUserId){

 
 $("#"+onlineUserId+"-status").text("online")
 $("#"+onlineUserId+"-status").removeClass('text-danger');
 $("#"+onlineUserId+"-status").addClass('text-primary');

})

socket.on("getOfflineUser",function(offlineUserId){


$("#"+offlineUserId+"-status").text("offline")
$("#"+offlineUserId+"-status").removeClass('text-primary');
 $("#"+offlineUserId+"-status").addClass('text-danger');


})


//chat save of user


$("#chat-form").submit(function(e){
 e.preventDefault();
 let message = $("#message").val();

 fetch("/save-chat",{
	method:"post",
	body:JSON.stringify({sender_id,receiver_id,message}),
	headers:{
		'Content-Type':"application/json"
	}
 }).then(res=>res.json()).then(res=>{
	if(res.success){
			$("#message").val("")
			let chat = res.chat.message;
			let html = ` <div class="current-user-chat" id="${res.chat._id}">
			 <h5>${chat}
				<i class="fa fa-trash" data-id="${res.chat._id}" aria-hidden="true" data-toggle="modal" data-target="#deleteMessage"></i>
				<i class="fa fa-edit" data-id="${res.chat._id}" aria-hidden="true" data-toggle="modal" data-target="#updateMessage"></i>
				</h5>
		</div>`;
		$("#chat-container").append(html)
		socket.emit('newChat',res.chat)
		scrollChats()
		 }else{
			 alert(res.msg)
		 }
 })
 
})


socket.on("loadnewChat",data=>{
let chat = data.message;
if(sender_id == data.receiver_id && receiver_id == data.sender_id){
let html = ` <div class="distance-user-chat" id="${data._id}">
			 <h5>${chat}</h5>
		</div>`;
		$("#chat-container").append(html)
}
scrollChats()

})



//load chats

socket.on("loadChats",(chats)=>{
	 $('#chat-container').html('');
	 let html ='';
	 for(let x=0;x<chats.length;x++ ){
				let addClass ='';
				if(chats[x].sender_id == sender_id){
					addClass = 'current-user-chat';
				}else if(chats[x].receiver_id==receiver_id){
							 addClass = 'distance-user-chat';
				}

				html +=`
						<div class='${addClass}' id="${chats[x]._id}">
								 <h5>${chats[x].message}
									`;
									if(chats[x].sender_id == sender_id){
										html +=`<i class="fa fa-trash" data-id="${chats[x]._id}" aria-hidden="true" data-toggle="modal" data-target="#deleteMessage"></i>
										<i class="fa fa-edit" data-id="${chats[x]._id}" aria-hidden="true" data-toggle="modal" data-target="#updateMessage"></i>
										`;
									}

							html +=    `</h5>
							</div>
				`;
	 }

	 $('#chat-container').html(html);
	 scrollChats()


})



function scrollChats(){

const  scrollTop=$('#chat-container').offset().top + $('#chat-container')[0].offsetHeight;

$('#chat-container').scrollTop(scrollTop)



}


$(document).on('click','.fa-trash',function(){
	let id=$(this).data('id');
	let msg = $(this).parent().text();
	$('#delete-message').text(msg);
	$('#delete-message-id').val(id);


})


$('#delete-chat-form').submit(function(e){
e.preventDefault();

const id =  $('#delete-message-id').val();
fetch('/delete-chat',{
method: 'POST',
body:JSON.stringify({id}),
headers: {
	'Content-Type': 'application/json'
	},
}).then(res=>res.json()).then((res)=>{
	 if(res.success){
		$('#'+id).remove();
					$('#deleteMessage').modal('hide');
					socket.emit("chatDeleted",id)
	 }else{
		alert(res.message)
	 }
})

})


socket.on('deleteChat',id=>{
$('#'+id).remove();
})


$(document).on('click','.fa-edit',function(){
	let id=$(this).data('id');
	let msg = $(this).parent().text();
	$('#update-message').val(msg);
	$('#update-message-id').val(id);


})


$('#update-chat-form').submit(function(e){
e.preventDefault();
const message = $('#update-message').val();
const id =  $('#update-message-id').val();
fetch('/update-chat',{
method: 'POST',
body:JSON.stringify({id,message}),
headers: {
	'Content-Type': 'application/json'
	},
}).then(res=>res.json()).then((res)=>{
	 if(res.success){

		$('#updateMessage').modal('hide');
		$('#'+id+" h5").html(`${message}
				<i class="fa fa-trash" data-id="${res.response._id}" aria-hidden="true" data-toggle="modal" data-target="#deleteMessage"></i>
				<i class="fa fa-edit" data-id="${res.response._id}" aria-hidden="true" data-toggle="modal" data-target="#updateMessage"></i>
		`);


		socket.emit("chatUpdated",{id,message});
	 }else{
		alert(res.message)
	 } 
})

})



socket.on("updateChat",({id,message})=>{
$('#'+id+" h5").html(`${message}`);
})


//add member

$(".addMember").click(function(e){
	e.preventDefault()

	const id = $(this).data("id");
	const limit = $(this).data("limit");

	$("#group_id").val(id);
	$("#limit").val(limit);



	fetch('/get-members',{
		method: 'POST',
		body:JSON.stringify({group_id:id}),
		headers: {
			'Content-Type': 'application/json'
			},
	}).then(res=>res.json()).then(data=>{
		console.log(data)
		$(".addMembertable").html('');
		if(data.success){
			data.data.forEach((member)=>{
				let isMemberOfGroup = member.member.length>0?true:false;
				$(".addMembertable").append(`
					<tr>
							<th><input type="checkbox" ${isMemberOfGroup?'checked':''} name="members[]" value="${member._id}"/></th>
							<th>${member.name}</th>
	
					</tr>
				`)
			})
		}else{
			alert(data.message)
		}
	
		
	})

});



$("#add-member-form").submit(function(e){
	e.preventDefault();
 var formData = $(this).serialize();

 

 $.ajax({
	url:"add-members",
	type:"POST",
	data:formData,
	success:function(res){
		if(res.success){
			$('#MemberModel').modal('hide');

			$("#add-member-form")[0].reset();

			console.log(res)

		}else{
			$('#add-member-error').text(res.message)
			setTimeout(()=>$('#add-member-error').text(""),3000)
		}
	}
 })
  
})


//  update group


$(document).on("click",".updateMember",function(){
	  var obj =$(this).data("obj");
		$("#gid").val(obj._id)
		$("#last_limit").val(obj.limit)
		$("#groupLimit").val(obj.limit)
		$("#groupName").val(obj.name)
})


$('#update-group-form').submit(function(e){
	e.preventDefault();

 
 $.ajax({
	url:"update-group",
	type:"POST",
	data:new FormData(this),
	contentType:false,
	cache:false,
	processData:false,
	success:function(res){
		if(res.success){
			$('#UpdateGroupModel').modal('hide');
			location.reload()
		}else{
			$('#update-group-error').text(res.message)
		}
	}
	})

})





//group delete

$(".deleteGroup").click(function(){
	  var dgid = $(this).data("id");
	  var gname = $(this).data("name");
		$("#dgid").val(dgid);
		$("#gname").text(gname);
})


$("#delete-group-form").submit(function(e){
	e.preventDefault();

	$.ajax({
		url:"/delete-group",
		type:"POST",
		data:$(this).serialize(),
		success:function(res){
			if(res.success){
				$('#deleteGroupModel').modal('hide');
	
				
	
				location.reload()
			}else{
				$('#delete-group-error').text(res.message)
				setTimeout(()=>$('#delete-group-error').text(""),3000)
			}
		}
	 })
})



//copy

$(".copy").click(function(){
	  $(this).prepend('<span class="copied_text">Copied</span>')
		var group_id = $(this).data("id");
		const url =window.location.host+'/share-group/'+group_id;
		var temp =$("<input>");
		$("body").append(temp);
		temp.val(url).select();
		document.execCommand("copy");
		temp.remove();
		setTimeout(() => {
			$(".copied_text").remove()
		}, 3000);

})



$(".join-now").click(function(){
	  $(this).text("wait...");
	  $(this).attr("disabled","disabled");
		var group_id = $(this).data("id");
		$.ajax({
			url:"/join-group",
			type:"POST",
			data:{group_id},
			success:function(res){
				if(res.success){
					location.reload();
					}else{
						$(".join-now").text("Join Now");
						$(".join-now").removeAttr("disabled");
						alert(res.message)
						}
						}
						})


})




var global_group_id;
$(".group-list").click(function(){
	 $('.g-chat-section').show()
	 $('.g-start-head').hide()

	 global_group_id = $(this).data('id')
	 scrollGroupChats()
	 loadGroupChats()
})



//groupchat save of user


$("#g-chat-form").submit(function(e){
	e.preventDefault();
	let message = $("#g-message").val();
 
	fetch("/save-groupchat",{
	 method:"post",
 body:JSON.stringify({sender_id,group_id:global_group_id,message}),
	 headers:{
		 'Content-Type':"application/json"
	 }
	}).then(res=>res.json()).then(res=>{
	 if(res.success){
		scrollGroupChats()
			 $("#g-message").val("")
		let msg=	res.data.message
		let msg_id=	res.data._id

		let html =`
		  <div class="current-user-chat" id="${msg_id}">
			      <h5><span>${msg}</span>
						<i class="fa fa-trash deleteGroupMessageButton" data-id="${msg_id}" aria-hidden="true" data-toggle="modal" data-target="#deleteGroupMessage"></i>
						</h5>
			</div>
		`;

		$("#g-chat-container").append(html);
		socket.emit('newGroupChat',res.data);

			
			
			}else{
				alert(res.msg)
			}
	})
	
 })
 



 // load newGroupChat


 socket.on("loadnewGroupChat",(data)=>{
	
	let html =`
	<div class="distance-user-chat" id="${data._id}">
	<h5>${data.message}</h5>
	</div>
	`; 

	if(global_group_id==data.group_id){
		scrollGroupChats()
		$("#g-chat-container").append(html);
	}
	
 })



 function loadGroupChats(){
	$("#g-chat-container").html('');
	$.ajax({
		url:'/loadGroupChats',
		method:'POST',
		data:{
			group_id:global_group_id
			},
			success:(res)=>{
				if(res.success){
					
					let groupChats=res.groupChats;
					  var html =``;
						for(let i=0;i<groupChats.length;i++){
							let className ="distance-user-chat";
							let deleteGroupMsgBtn=``;
							if(groupChats[i].sender_id==sender_id){
								className="current-user-chat"
								deleteGroupMsgBtn=`	<i class="fa fa-trash deleteGroupMessageButton" data-id="${groupChats[i]._id}" aria-hidden="true" data-toggle="modal" data-target="#deleteGroupMessage"></i>`
							}

							html+=`
							<div class="${className}" id="${groupChats[i]._id}">
							<h5><span>${groupChats[i].message}</span>
							${deleteGroupMsgBtn}
							</h5>
							</div>
							`;
							}
							$("#g-chat-container").append(html);
				
						}
						else{
							alert(res.message)
							}
							}
							})
							

 }






 function scrollGroupChats(){
	$("#g-chat-container").animate({
		scrollTop:$('#g-chat-container').offset().top+130 + $("#g-chat-container")[0].scrollHeight
		},1000)
		
	}




	$(document).on("click",".deleteGroupMessageButton",function(){
		let id=$(this).data("id");
		$("#delete-g-message-id").val(id);
	})


	$("#delete-g-chat-form").submit(function(e){
		e.preventDefault();

	const g_chat_id=	$("#delete-g-message-id").val();

	$.ajax({
		url:"/deleteGroupMessageUrl",
		type:"POST",
		data:{
			g_chat_id:g_chat_id
			},
			success:function(res){
				if(res.success){
					// console.log(res);
					$("#"+g_chat_id).remove();
					socket.emit("deleteGroupChat",g_chat_id)
					$(".deleteGroupMessageButton").click();
				}else{
           alert(res.message)
				}
			}
	})

	})



	socket.on("deleteGroupMessage",(g_chat_id)=>{
		$("#"+g_chat_id).remove();
	})




