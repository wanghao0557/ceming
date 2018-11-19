var FoundationTools = {
    getAccurate: function(datas, callback) {
        $.ajax({
            type: 'POST',
            url: '/accurate',
            data: datas,
            dataType: 'json',
            timeout: 5000,
            success: function(data) {
                callback(JSON.parse(JSON.stringify(data)));
            },
            error: function(xhr, type) {
                console.log('ajax error');
            }
        });
    }
};
$(function() {
    $(document).on("pageInit", "#page-preloader", function(e, id, page) {
        $(page).on('change', '#photos',  function(e) {
            $.showPreloader('图片上传中...');
            var reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = function(e) {
                var imgBase64 = e.target.result;
                $('#view-img').attr('src', imgBase64);
                $('#photos-storage').val(imgBase64);
                $.hidePreloader();
            };
        });
        $(page).on('click', '#submit-form', function() {
            $.showPreloader('数据提交中...');
            var data = {
                name: $('#nick').val(),
                photos: $('#photos-storage').val()
            };
            FoundationTools.getAccurate(data, function(data) {
                $.hidePreloader();
                var text = getText(data.data.textResult);
                $('#result-text').val(text);
                $('#render-text').html('<strong>'+data.data.name+': </strong>'+text);
            });
        });
    });
    $.init();
});

function getText(obj) {
    var arr, temp = '';
    obj.words_result && (arr = obj.words_result);
    arr.forEach(function(elem, index) {
        temp += elem.words+'。';
    });
    return temp;
}
