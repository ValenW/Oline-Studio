window.onload = init;

//自制音乐数目
var o_length;
var o_page = 1;
var o_data;
//改编音乐数目
var d_length;
var d_page = 1;
var d_data;
//收藏音乐数目
var c_length;
var c_page = 1;
var c_data;

function init(){
    console.log(user);
    initData();
    initMessage();
    initButton();
}

function initData(){
    o_data = user.original_musics;
    d_data = user.derivative_musics;
    c_data = user.collected_musics;
}

function initMessage(){
    //自制音乐数目
    o_length = user.original_musics.length;
    //改编音乐数目
    d_length = user.derivative_musics.length;
    //收藏音乐数目
    c_length = user.collected_musics.length;
}

//data.length-((page_num-1)*10+i)-1
function initButton(){
    console.log('initButton');
    //修改个人信息
    $('#edit').click(function(){});
    if(o_length > 0){
        //自制音乐
        //上一页
        $('#original_musics_left_button').click(function(){
            console.log('original_musics_left_button');
            if(o_page == 1){return;}
            o_page--;
            $('#original_musics').html("");
            for(var i = 0; i <= 9; i++){
                if(o_data.length-((o_page-1)*10+i)-1 < 0){return;}
                createItem(o_data[o_data.length-((o_page-1)*10+i)-1]);
                $('#original_musics').append(l);
            }
        });
        //下一页
        $('#original_musics_right_button').click(function(){
            console.log('original_musics_right_button');
            if(o_page == Math.ceil(o_length/10)){return;}
            o_page++;
            $('#original_musics').html("");
            for(var i = 0; i <= 9; i++){
                if(o_data.length-((o_page-1)*10+i)-1 < 0){return;}
                createItem(o_data[o_data.length-((o_page-1)*10+i)-1]);
                $('#original_musics').append(l);
            }
        });
    }
    if(d_length > 0){
        //改编音乐
        //上一页
        $('#derivative_musics_left_button').click(function(){
            console.log('derivative_musics_left_button');
            if(d_page == 1){return;}
            d_page--;
            $('#derivative_musics').html("");
            for(var i = 0; i <= 9; i++){
                if(d_data.length-((d_page-1)*10+i)-1 < 0){return;}
                createItem(d_data[d_data.length-((d_page-1)*10+i)-1]);
                $('derivative_musics').append(l);
            }
        });
        //下一页
        $('#derivative_musics_right_button').click(function(){
            console.log('derivative_musics_right_button');
            if(d_page == Math.ceil(d_length/10)){return;}
            d_page++;
            $('#derivative_musics').html("");
            for(var i = 0; i <= 9; i++){
                if(d_data.length-((d_page-1)*10+i)-1 < 0){return;}
                createItem(d_data[d_data.length-((d_page-1)*10+i)-1]);
                $('#derivative_musics').append(l);
            }
        });
    }
    if(c_length > 0){
        //收藏音乐
        //上一页
        $('#collected_musics_left_button').click(function(){
            console.log('derivative_musics_left_button');
            if(c_page == 1){return;}
            c_page--;
            $('#collected_musics').html("");
            for(var i = 0; i <= 9; i++){
                if(c_data.length-((c_page-1)*10+i)-1 < 0){return;}
                createItem(c_data[c_data.length-((c_page-1)*10+i)-1]);
                $('collected_musics').append(l);
            }
        });
        //下一页
        $('#collected_musics_right_button').click(function(){
            console.log('collected_musics_right_button');
            if(c_page == Math.ceil(c_length/10)){return;}
            c_page++;
            $('#collected_musics').html("");
            for(var i = 0; i <= 9; i++){
                if(c_data.length-((c_page-1)*10+i)-1 < 0){return;}
                createItem(c_data[c_data.length-((c_page-1)*10+i)-1]);
                $('#collected_musics').append(l);
            }
        });
    }
}

//展示的卡片
var l;
//创建卡片
function createItem(data){
    l = document.createElement('li');
    var card = document.createElement('div');
    card.className = "ui card small-item";
    l.appendChild(card);
    var d_img = document.createElement('div');
    d_img.className = "image small-item";
    card.appendChild(d_img);
    var img = document.createElement('img');
    img.src = "/uploads/musicCovers" + data.cover;
    d_img.appendChild(img);
    var p = document.createElement('p');
    p.align = "center";
    p.innerHTML = data.name;
    l.appendChild(p);
    l.onclick = function(){
        return window.location.href="/music?music_id="+data._id;
    };
}

function updateContent(data,page_num,_id){
    
    $(_id).append();
}