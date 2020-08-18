'use strict';

// import 'addGroup';const addGroup = require('addGroup');
var localStorageConst = {
    emojionearea_expanded: 'emojionearea_expanded'
};
var add_group, edit_group;
$(function () {
    $.datetimepicker.setLocale('ru');
    window.emojioneVersion = "3.0.0";
    add_group = new addGroup($('.new_group_list'));
    edit_group = new editGroup($('.group_edit'));
    // Menu Toggle
    $('.menu-collapse').on('click', function () {
        $('.leftpanel').toggleClass('slideInLeft slideOutLeft').addClass('show-leftpanel');
        return false;
    });

    $('.date-picker-1').datetimepicker({
        format: 'd.m.Y',
        inline: false,
        lang: 'ru',
        dayOfWeekStart: 1,
        timepicker: false,
        scrollInput: false,
        scrollMonth: false
    });

    $('.datetime-picker-1').datetimepicker({
        format: 'd.m.Y H:i',
        inline: false,
        lang: 'ru',
        step: 60,
        dayOfWeekStart: 1,
        timepicker: true,
        scrollInput: false,
        scrollMonth: false
    });

    $('.js-select').select2();

    init_select_ajax($(".js-select-ajax"));

    $(document).on('click', '._copy', function () {
        var $this = $(this);
        var $e = $($this.data('target'));

        if (!$e.length) {
            $e = $(this).closest('._copy_wr').find('._copy_target');
        }

        CopyToClipboard($e);
        $this.tooltip('show');

        setTimeout(function () {
            $this.tooltip('dispose');
        }, 1000);
        return false;
    });
});

function CopyToClipboard($e) {
    var rng, sel;
    if ($e.val()) {
        $e.select();
    } else if (document.createRange) {
        rng = document.createRange();
        rng.selectNode($e[0]);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rng);
    } else {
        alert("Browser not supported copy to clipboard");
    }
    document.execCommand("copy");
}

function init_select_ajax($e) {
    $e.select2({
        ajax: {
            dataType: 'json',
            delay: 250,
            data: function data(params) {
                return {
                    search: params['term'],
                    page: params['page']
                };
            },
            processResults: function processResults(data, params) {
                params['page'] = params['page'] || 1;
                return {
                    results: data['items'],
                    pagination: {
                        more: !data['end']
                    }
                };
            },
            cache: true
        },
        templateResult: function templateResult(data) {
            if (data['loading']) return data['text'];
            return data['text'];
        },
        templateSelection: function templateSelection(data) {
            return data['text'];
        }
    });
}

function notify(msg, type) {
    $.notify({
        // options
        message: msg
    }, {
        // settings
        type: type ? type : 'success',
        offset: { x: 20, y: 80 },
        delay: 2000
    });
}

function notify_default_error() {
    var msg = "Извините, при выполнении запроса произошла ошибка. Повторите запрос или обратитесь в службу поддержки.";
    try {
        notify(msg, "danger");
    } catch (e) {
        alert(msg);
    }
}

// function pasteHtmlAtCaret(html) {
//     var sel, range;
//     if (window.getSelection) {
//         sel = window.getSelection();
//         if (sel.getRangeAt && sel.rangeCount) {
//             range = sel.getRangeAt(0);
//             range.deleteContents();
//             var el = document.createElement("div");
//             el.innerHTML = html;
//             var frag = document.createDocumentFragment(), node, lastNode;
//             while ((node = el.firstChild)) {
//                 lastNode = frag.appendChild(node);
//             }
//             range.insertNode(frag);
//             if (lastNode) {
//                 range = range.cloneRange();
//                 range.setStartAfter(lastNode);
//                 range.collapse(true);
//                 sel.removeAllRanges();
//                 sel.addRange(range);
//             }
//         }
//     }
// }

function pasteHtmlAtCaret(html) {
    var sel, range;
    if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            // Range.createContextualFragment() would be useful here but is
            // non-standard and not supported in all browsers (IE9, for one)
            var el = document.createElement("div");
            el.innerHTML = html;
            var frag = document.createDocumentFragment(),
                node,
                lastNode;
            while (node = el.firstChild) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            // Preserve the selection
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.setEndAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    } else if (document.selection && document.selection.type != "Control") {
        // IE < 9
        document.selection.createRange().pasteHTML(html);
    }
}
//# sourceMappingURL=main.js.map