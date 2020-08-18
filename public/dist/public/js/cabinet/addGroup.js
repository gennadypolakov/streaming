'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var addGroup = function () {
    function addGroup(el) {
        var _this = this;

        _classCallCheck(this, addGroup);

        if (el.length) {
            this.el = el;
            this.el.find('.card').on('click', '.add_group', function (e) {
                _this.getToken($(e.currentTarget).data('group_id'), function () {
                    $(e.currentTarget).toggleClass('add_group');
                    $(e.currentTarget).html('Отключить');
                    $(e.currentTarget).toggleClass('remove_group');
                    $(e.currentTarget).toggleClass('btn-success');
                    $(e.currentTarget).toggleClass('btn-danger');
                });
            });
            this.el.find('.card').on('click', '.remove_group', function (e) {
                $.get('/ajax/group/remove', { 'group_id': $(e.currentTarget).data('group_id') }, function (r) {
                    $(e.currentTarget).toggleClass('add_group');
                    $(e.currentTarget).html('Подключить');
                    $(e.currentTarget).toggleClass('remove_group');
                    $(e.currentTarget).toggleClass('btn-success');
                    $(e.currentTarget).toggleClass('btn-danger');
                });
            });
        }
    }

    _createClass(addGroup, [{
        key: 'getToken',
        value: function getToken(vk_group_id, callback) {
            var width = 750;
            var height = 500;
            var left = window.screen.width / 2 - width / 2;
            var top = window.screen.height / 2 - height / 2;
            var redirect_url = encodeURIComponent('http://' + window.location.hostname + '/vk_group_token');
            var url = 'https://oauth.vk.com/authorize?client_id=6665818&redirect_uri=' + redirect_url + '&group_ids=' + vk_group_id + '&display=page&scope=messages,manage,photos,docs&response_type=code&v=5.8&state=' + vk_group_id;
            var wnd_vk = window.open(url, "Подключение группы", "width=" + width + ",height=" + height + ",status=no,directories=no,location=no,toolbar=no,menubar=no,resizable=yes,scrollbars=yes,left=" + left + ",top=" + top);
            window[window.addEventListener ? 'addEventListener' : 'attachEvent']((window.attachEvent ? 'on' : '') + 'message', function (event) {
                switch (event.data.act) {
                    case 'ErrorVkTokenGroup':
                        notify(event.data.message, 'danger');
                        break;
                    case 'SendVkTokenGroup':
                        callback();
                        break;
                }
            }, false);
        }
    }, {
        key: 'SendVkTokenGroup',
        value: function SendVkTokenGroup(vk_group_id, group_id, token, btn) {
            var _this2 = this;

            if (!btn.hasClass('load')) {
                btn.formbutton('start');
                $.post('/ajax/youcarta_ru/group/token', {
                    group_id: group_id,
                    vk_group_id: vk_group_id,
                    token: token
                }, function (r) {
                    var a = jQuery.parseJSON(r);
                    if (a.status === 'ok') {
                        if (group_id !== 0) {
                            _this2.wndConnect.iwindow('hide');
                            _this2.get(_this2.el.data('id'));
                        } else {
                            location.href = '/cabinet/group/' + a.group_id;
                        }
                    } else {
                        _this2.wndConnect.iwindow('hide');
                        _this2.show_error(a.message);
                    }
                });
            }
        }
    }]);

    return addGroup;
}();
//# sourceMappingURL=addGroup.js.map