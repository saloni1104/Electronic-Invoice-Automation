$(function () {
    $('.upload-file').change(function () {
        var f = this.files[0]
        if (f.size > 4194304 || f.fileSize > 4194304) {
            alert("Allowed file size exceeded. (Max. 4 MB)")
            this.value = null;
        }
    })
    $(".cancel-btn").click(function () {
        $('.upload-file').val(null);
    })

});