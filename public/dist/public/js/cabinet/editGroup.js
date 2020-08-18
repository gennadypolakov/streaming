'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var editGroup = function editGroup(el) {
    var _this = this;

    _classCallCheck(this, editGroup);

    if (el.length) {
        this.el = el;
        this.el.find('#remove_group').on('click', function (e) {
            $.get('/ajax/group/remove', { 'group_id': $(e.currentTarget).data('id') }, function (r) {
                location.href = '/cabinet/live';
            });
        });
        this.el.find('#sale').on('click', function (e) {
            if ($(e.currentTarget).prop('checked')) {
                _this.el.find('ul.group_setting').show();
            } else {
                _this.el.find('ul.group_setting').hide();
            }
        });
    }
};
//# sourceMappingURL=editGroup.js.map