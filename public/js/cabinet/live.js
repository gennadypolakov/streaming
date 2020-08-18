class Live {
    constructor(el) {
        if (el.length) {
            this.el = el;
            this.el.find('.broadcast input').on('checked',(e)=>{
                $.get("/ajax/group/set_broadcast",{
                   group_id: $(e.currentTarget).data('group_id'),
                    status:$(e.currentTarget).prop("checked")
                },(r)=>{
                    let a = jQuery.parseJSON(r);
                    if(a.status !== 'ok'){
                        this.showError(e,a.message);
                    }
                });
            })
        }
    }
    showError(e,mes){
        console.log(mes);
    }

}