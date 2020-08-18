class editGroup {
    constructor(el) {
        if(el.length){
            this.el = el;
            this.el.find('#remove_group').on('click',(e)=>{
                $.get('/ajax/group/remove',{'group_id':$(e.currentTarget).data('id')},(r)=>{
                    location.href = '/cabinet/live';
                })
            })
            this.el.find('#sale').on('click',(e)=>{
               if($(e.currentTarget).prop('checked')){
                   this.el.find('ul.group_setting').show();
               }else{
                   this.el.find('ul.group_setting').hide();
               }
            });
        }
    }
}