const GeradorQRCode = {
    // Variaveis
    name: null,
    width: 300,
    height: 300,
    selected : {
        type: null,
        icon: null,
        quality: 0,
        iconsize: 0.7,
    },
    uploadCount: 0,

    init : function() {
        $(`.form`).hide();

        GeradorQRCode.selected.type = $(".qr-type li.select").attr("value") || null;
        GeradorQRCode.selected.icon = $(".list-icons li.select").attr("value") || null;
        GeradorQRCode.selected.quality = parseInt($(".preview select[name='quality']").val()) || 0;
        GeradorQRCode.selected.iconsize = parseFloat($(".preview input[name='icon-size']").val()) || 0.7;
        GeradorQRCode.width = $(".preview input[name='width']").val() || 300;
        GeradorQRCode.height = $(".preview input[name='height']").val() || 300;

        $(`.form.${GeradorQRCode.selected.type}`).show();

        $(".qr-type li").click(GeradorQRCode.selectType);
        $(".list-icons li").click(GeradorQRCode.selectIcon);

        $("button.create").click(GeradorQRCode.createQR);
        $("button.save[type='png']").click(GeradorQRCode.savePNG);
        $("button.save[type='svg']").click(GeradorQRCode.saveSVG);

        $(".preview input[name='width']").change(GeradorQRCode.updateWidth);
        // $(".preview input[name='height']").change(GeradorQRCode.updateHeight);
        $(".preview input[name='icon-size']").change(GeradorQRCode.updateIconSize);
        $(".preview select[name='quality']").change(GeradorQRCode.updateQuality);
        $(".icon input[name='upload-icon']").change(GeradorQRCode.uploadIcon);
    },

    uploadIcon: function(evt) {
        if(!this.files || this.files.length <= 0) {
            return;
        }

        for(let i=0; i<this.files.length; i++) {
            var reader = new FileReader();
            reader.onload = function(evt) {
                $(".list-icons li.upload").before(`<li value="other-${GeradorQRCode.uploadCount}"><img src="${evt.target.result}" width="50" height="50"></li>`);
                $(`.list-icons li[value="other-${GeradorQRCode.uploadCount}"]`).click(GeradorQRCode.selectIcon);
                GeradorQRCode.uploadCount++;
            };
            reader.readAsDataURL(this.files[i]);
        }
    },
    // Eventos Click
    updateWidth : function(evt) {
        let width = $(this).val();
        if(width < 10) {
            width = 10;
        }
        GeradorQRCode.width = width;
        GeradorQRCode.height = width;
        $(".preview input[name='height']").val(width);
    },
    selectType : function(evt) {
        if($(this).hasClass("select")) {
            return;
        }

        if(GeradorQRCode.selected.type != null) {
            $(`.qr-type li[value='${GeradorQRCode.selected.type}']`).removeClass("select");
            $(`.form.${GeradorQRCode.selected.type}`).hide();
        }
        GeradorQRCode.selected.type = $(this).attr("value");
        $(`.form.${GeradorQRCode.selected.type}`).show();
        $(this).addClass("select");
    },
    selectIcon : function(evt) {
        if($(this).hasClass("select")) { return; }

        if($(this).hasClass("upload")) {
            // Fazer o Upload de um novo Icone!
            $(".icon input[name='upload-icon']").click();
            return;
        }

        if(GeradorQRCode.selected.icon != null) {
            $(`.list-icons li[value='${GeradorQRCode.selected.icon}']`).removeClass("select");
        }
        GeradorQRCode.selected.icon = $(this).attr("value");
        $(this).addClass("select");
    },
    updateQuality : function(evt) {
        GeradorQRCode.selected.quality = parseInt($(this).val());
    },
    updateIconSize : function(evt) {
        $("#icon-size-box label").html(`Icone Tam. (${parseInt($(this).val()*100)}%)`);
        GeradorQRCode.selected.iconsize = parseFloat($(this).val());
    },
    createQR : function() {
        const opts = {
            render: "canvas",
            width: GeradorQRCode.width,
            height: GeradorQRCode.height,
            correctLevel: parseInt(GeradorQRCode.selected.quality),
        };

        let rtn = false;
        if(GeradorQRCode.selected.type == "url") {
            rtn = GeradorQRCode.createUrlOpts(opts);
        } else if(GeradorQRCode.selected.type == "mail") {
            rtn = GeradorQRCode.createEmailOpts(opts);
        } else if(GeradorQRCode.selected.type == "vcard") {
            rtn = GeradorQRCode.createVCardOpts(opts);
        }

        GeradorQRCode.setIconQR(opts);

        if(rtn) {
            console.log(opts);
            $(".output").html("");
            $(".output").qrcode(opts);
        }
    },
    savePNG : function() {
        const canvas = $(".output canvas")[0];
        var link = document.createElement('a');
        link.setAttribute('download', `${GeradorQRCode.name} - QRCode.png`);
        link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
        link.click();
    },
    saveSVG : function() { },

    // Cria a Data de retorno
    // Verifica se tudo está correto
    createUrlOpts : function(opts) {
        let url = $("input[name='data-url']").val().trim();
        if(url.length == 0) {
            alert("Informe um URL para poder gerar o QRCode.");
            return false;
        }
        if(url.indexOf("http://") < 0 && url.indexOf("https://") < 0) {
            url = "http://"+url;
        }
        opts.text = url;
        GeradorQRCode.name = new URL(url).host;
        return true;
    },
    createEmailOpts : function(opts) {
        let mail = $("input[name='data-mail']").val().trim();
        if(mail.length == 0) {
            alert("Informe um E-mail para poder gerar o QRCode.");
            return false;
        }

        opts.text = mail;
        let corte = mail.indexOf("@") > 0 ? mail.indexOf("@") : 0;
        GeradorQRCode.name = mail.substr(0, corte);
        return true;
    },
    createVCardOpts : function(opts) {
        let name = $("input[name='data-vcar-name']").val().trim();
        if(name.length == 0) {
            alert("Informe um Nome para poder gerar o QRCode.");
            return false;
        }
        GeradorQRCode.name = name;
        var vcard = vCard.create(vCard.Version.FOUR);
        vcard.add(vCard.Entry.FORMATTEDNAME, name);
        
        if($("input[name='data-vcar-site']").val().trim() != "") {
            vcard.add(vCard.Entry.URL,  $("input[name='data-vcar-site']").val().trim());
        }
        if($("input[name='data-vcar-mail']").val().trim() != "") {
            vcard.add(vCard.Entry.EMAIL, $("input[name='data-vcar-mail']").val().trim(), "Trabalho");
        }        
        if($("input[name='data-vcar-tel']").val().trim() != "") {
            vcard.add(vCard.Entry.PHONE, $("input[name='data-vcar-tel']").val().trim(), "Trabalho");
        }
        if($("input[name='data-vcar-cel']").val().trim() != "") {
            vcard.add(vCard.Entry.PHONE, $("input[name='data-vcar-cel']").val().trim(), "Celular");
        }

        if($("input[name='data-vcar-cname']").val().trim() != "") {
            vcard.add(vCard.Entry.ORGANIZATION, $("input[name='data-vcar-cname']").val().trim());
        }
        if($("input[name='data-vcar-cargo']").val().trim() != "") {
            vcard.add(vCard.Entry.TITLE, $("input[name='data-vcar-cargo']").val().trim());
            // vcard.add(vCard.Entry.ROLE, $("input[name='data-vcar-cargo']").val().trim());
        }
        
        if($("input[name='data-vcar-ende']").val().trim() != "") {
            const street = $("input[name='data-vcar-ende']").val().trim() || "";
            const city = $("input[name='data-vcar-city']").val().trim() || "";
            const state = $("input[name='data-vcar-esta']").val().trim() || "";
            const zipcode = $("input[name='data-vcar-cep']").val().trim() || "";
            const country = $("input[name='data-vcar-pais']").val().trim() || "";

            vcard.add(vCard.Entry.ADDRESS, `;;${street};${city};${state};${zipcode};${country}`, "Trabalho");
        }

        opts.text = vCard.dump(vcard);
        return true;
    },

    setIconQR : function(opts) {
        if(GeradorQRCode.selected.icon == null || GeradorQRCode.selected.icon == "none") {
            return;
        }

        opts.src = $(`.list-icons li[value='${GeradorQRCode.selected.icon}'] img`).attr("src");
        opts.imgWidth = (opts.width * GeradorQRCode.selected.iconsize);
        opts.imgHeight = (opts.height * GeradorQRCode.selected.iconsize);
    },
};

$(function () {
    GeradorQRCode.init();
});