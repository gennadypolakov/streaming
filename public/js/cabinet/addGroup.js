class addGroup {
    constructor(el) {
        if (el.length) {
            this.el = el;
            this.el.find('.card').on('click','.add_group',(e)=>{
                this.getToken($(e.currentTarget).data('group_id'),()=>{
                    $(e.currentTarget).toggleClass('add_group');
                    $(e.currentTarget).html('Отключить');
                    $(e.currentTarget).toggleClass('remove_group');
                    $(e.currentTarget).toggleClass('btn-success');
                    $(e.currentTarget).toggleClass('btn-danger');
                });
            });
            this.el.find('.card').on('click','.remove_group',(e)=>{
                $.get('/ajax/group/remove',{'group_id':$(e.currentTarget).data('group_id')},(r)=>{
                    $(e.currentTarget).toggleClass('add_group');
                    $(e.currentTarget).html('Подключить');
                    $(e.currentTarget).toggleClass('remove_group');
                    $(e.currentTarget).toggleClass('btn-success');
                    $(e.currentTarget).toggleClass('btn-danger');

                });

            });
        }
    }

    getToken(vk_group_id,callback) {
        let width = 750;
        let height = 500;
        let left = window.screen.width / 2 - width / 2;
        let top = window.screen.height / 2 - height / 2;
        let redirect_url = encodeURIComponent(`http://${window.location.hostname}/vk_group_token`);
        let url = `https://oauth.vk.com/authorize?client_id=6665818&redirect_uri=${redirect_url}&group_ids=${vk_group_id}&display=page&scope=messages,manage,photos,docs&response_type=code&v=5.8&state=${vk_group_id}`;
        let wnd_vk = window.open(url, "Подключение группы", "width=" + width + ",height=" + height + ",status=no,directories=no,location=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,left=" + left + ",top=" + top);
        window[window.addEventListener ? 'addEventListener' : 'attachEvent'](
            (window.attachEvent ? 'on' : '') + 'message', (event) => {
                switch (event.data.act) {
                    case 'ErrorVkTokenGroup':
                        notify(event.data.message,'danger');
                        break;
                    case 'SendVkTokenGroup':
                        callback();
                        break;
                }
            }, false
        );
    }

    SendVkTokenGroup(vk_group_id, group_id, token, btn) {
        if (!btn.hasClass('load')) {
            btn.formbutton('start');
            $.post('/ajax/youcarta_ru/group/token', {
                group_id: group_id,
                vk_group_id: vk_group_id,
                token: token
            }, (r) => {
                let a = jQuery.parseJSON(r);
                if (a.status === 'ok') {
                    if (group_id !== 0) {
                        this.wndConnect.iwindow('hide');
                        this.get(this.el.data('id'));
                    } else {
                        location.href = '/cabinet/group/' + a.group_id;
                    }
                } else {
                    this.wndConnect.iwindow('hide');
                    this.show_error(a.message);
                }
            });
        }
    }
}
