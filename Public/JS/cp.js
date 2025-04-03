$(document).ready(function() {
    $("#cp").on("input", function() {
        let cp = $(this).val();

        if (cp.length === 5) {
            $.ajax({
                url: `https://api.zippopotam.us/MX/${cp}`,
                method: "GET",
                success: function(data) {
                    $("#ciudad").val(data.places[0]["place name"]);
                    $("#estado").val(data.places[0]["state"]);
                },
                error: function() {
                    alert("Código postal no encontrado.");
                }
            });
        }
    });
});