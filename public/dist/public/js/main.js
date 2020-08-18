'use strict';

$(function () {
    init_waypoint($('._waypoints'));
    init_lazy($('._lazy'));
    init_tooltip($('[data-toggle="tooltip"]'));
    init_tooltip($('._tooltip'));
    init_polymer($(".input-polymer"));
    init_ripple(".btn");
    init_ripple(".custom-ripple");
    init_popover($('[data-toggle="popover"]'));

    /**
     * Submit Form
     */
    $(document).on('click', '.submit', function () {
        var $form = $(this).closest('form');
        if ($(this).hasClass('submit-more')) $form.data('is_scroll', true);
        $form.submit();
        return false;
    });

    /**
     * Reset Form
     */
    $(document).on('click', '.submit-reset', function () {
        var $form = $(this).closest('form');
        $form[0].reset();
        $form.find('input,textarea').not(':button,:submit,:reset,:hidden,[type="checkbox"],[type="radio"]').val('');
        $form.find('input:checked').prop('checked', false).trigger('change');
        $form.find('select').val(null).trigger('change');
        $form.submit();
        return false;
    });

    $(document).on('click', '.btn-location-back', function () {
        window.history.back();
        return false;
    });

    $(document).on('click', '.clear-search', function () {
        if ($($(this).data('target')).length) $($(this).data('target')).val('');
        return false;
    });

    select_fields('.select-relative');
    $('.select-relative').on('change', function () {
        select_fields('.select-relative');
    });

    checkbox_fields('.checkbox-relative');
    $('.checkbox-relative').on('change', function () {
        checkbox_fields('.checkbox-relative');
    });

    /**
     * Плавная прокрутка до якоря
     */
    $("a.scrollto").on('click', function () {
        var elementClick = $(this).attr("href");
        if ($(elementClick).length > 0) {
            var destination = $(elementClick).offset().top;
            $("html:not(:animated),body:not(:animated)").animate({
                scrollTop: destination
            }, 800);
        }
        return false;
    });

    $('.modal').on('shown.bs.modal', function () {
        $(this).find('input:visible:first').focus();
    });

    $(document).on('click', '.btn-long', function () {
        if ($(this).data('loading')) return false;
        loadingBtn(this);
    });

    $(document).on('click', '.btn-redirect', function () {
        if ($(this).data('redirect')) {
            document.location.href = $(this).data('redirect').toString();
        }
        return false;
    });
});

function select_fields(name) {
    $(name).each(function () {
        if ($(this).data('target')) {
            $($(this).data('target')).hide();
            $($(this).data('target') + '-' + $(this).val()).show();
        }
    });
}

function form_reset(form) {
    form.reset();
    $(form).find('select').trigger("change");
    $(form).find('[type="radio"]').trigger("change");
    $(form).find('[type="checkbox"]').trigger("change");
    $(form).find('.has-success').removeClass("has-success");
    $(form).find('.has-danger').removeClass("has-danger");
}

function checkbox_fields(name) {
    var v,
        hidden = [],
        hidden2 = [],
        show = [];

    $(name).each(function () {
        if ($(this).data('target')) {
            v = $(this).val();

            if ($(this).is(':checked') && (!$(this).data('condition') || $($(this).data('condition')).length)) {
                if ($(this).data('negative')) {
                    hidden2.push($(this).data('target') + '-' + v);
                } else {
                    show.push($(this).data('target') + '-' + v);
                }
            } else {
                if ($(this).data('negative')) {
                    show.push($(this).data('target') + '-' + v);
                } else {
                    hidden.push($(this).data('target') + '-' + v);
                }
            }
        }
    });
    hidden.forEach(function (item) {
        $(item).hide();
    });
    show.forEach(function (item) {
        $(item).show();
    });
    hidden2.forEach(function (item) {
        $(item).hide();
    });
}
/**
 * HANDLE submit Form
 * @param params
 */
$.fn.formSubmit = function (params) {
    var def = {
        beforeSend: function beforeSend() {},
        complete: function complete() {},
        success: function success() {},
        error: function error() {}
    };

    // params = Object.assign(def, params); // функция не работает в IE и на некоторых мобильных
    params = $.extend({}, def, params);

    function loadingForm(form) {
        $(form).data('loading', true);
        $(form).find('.submit').each(function () {
            $(this).data('original', $(this).html()).html('<i class="fa fa-spinner fa-pulse"></i>');
        });
    }

    function unloadingForm(form) {
        $(form).data('loading', false);

        $(form).find('.submit').each(function () {
            $(this).html($(this).data('original'));
        });
    }

    $(this).on('submit', function () {
        var form = this;

        if ($(form).data('loading')) return false;

        try {
            // console.log('submit 1');
            trimInputs(form);

            if (!$(form).hasClass('_not_check_form')) {
                // console.log('submit 2');
                checkRequired(form);
            } else {
                successAllInputs(form);
            }

            // console.log('submit 3');
            params.beforeSend(form);
            loadingForm(form);

            $.ajax($(form).attr('action'), {
                type: 'post',
                data: $(form).serialize(),
                dataType: 'json',
                beforeSend: function beforeSend(jqXHR, settings) {},
                complete: function complete(jqXHR, textStatus) {
                    params.complete(form, jqXHR, textStatus);
                    unloadingForm(form);
                },
                success: function success(data, textStatus, jqXHR) {
                    params.success(form, data, textStatus, jqXHR);
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    params.error(form, jqXHR, textStatus, errorThrown);
                }
            });
        } catch (err) {
            unloadingForm(form);
            console.log(err);
        }
        return false;
    });
    return this;
};

/**
 * HANDLE submit button
 * @param btn
 * @param params
 */
var btnSubmit = function btnSubmit(btn, params) {
    var def = {
        beforeSend: function beforeSend() {},
        complete: function complete() {},
        success: function success() {},
        error: function error() {}
    };

    // params = Object.assign(def, params);
    params = $.extend({}, def, params);

    $(document).on('click', btn, function (e) {
        e.preventDefault();

        var el = this;
        if ($(el).data('loading')) return false;
        if ($(el).data('confirm') && !confirm($(el).data('confirm').toString())) return false;
        loadingBtn(el);

        try {
            params.beforeSend(el);

            $.ajax($(el).attr('href'), {
                type: 'post',
                data: $(el).data(),
                dataType: 'json',
                beforeSend: function beforeSend(jqXHR, settings) {},
                complete: function complete(jqXHR, textStatus) {
                    params.complete(el, jqXHR, textStatus);
                    unloadingBtn(el);
                },
                success: function success(data, textStatus, jqXHR) {
                    params.success(el, data, textStatus, jqXHR);
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    params.error(el, jqXHR, textStatus, errorThrown);
                }
            });
        } catch (err) {
            unloadingBtn(el);
            console.log(err);
        }

        return false;
    });
};

/**
 * HANDLE submit button with data from closest form
 * @param btn
 * @param params
 */
var btnTargetSubmit = function btnTargetSubmit(btn, params) {
    var def = {
        beforeSend: function beforeSend() {},
        complete: function complete() {},
        success: function success() {},
        error: function error() {}
    };

    // params = Object.assign(def, params);
    params = $.extend({}, def, params);

    unloadingBtn(btn);

    $(document).on('click', btn, function (e) {
        e.preventDefault();

        var el = this;
        if ($(el).data('loading')) return false;
        if ($(el).data('confirm') && !confirm($(el).data('confirm').toString())) return false;

        loadingBtn(el);

        try {
            params.beforeSend(el);

            $.ajax($(el).data('action'), {
                type: 'post',
                data: $($(el).data('target')).serialize(),
                dataType: 'json',
                beforeSend: function beforeSend(jqXHR, settings) {},
                complete: function complete(jqXHR, textStatus) {
                    params.complete(el, jqXHR, textStatus);
                    unloadingBtn(el);
                },
                success: function success(data, textStatus, jqXHR) {
                    params.success(el, data, textStatus, jqXHR);
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    params.error(el, jqXHR, textStatus, errorThrown);
                }
            });
        } catch (err) {
            unloadingBtn(el);
            console.log(err);
        }
        return false;
    });
};

function loadingBtn(btn) {
    $(btn).data('loading', true);
    $(btn).data('original', $(btn).html()).html('<i class="fa fa-spinner fa-pulse"></i>');
}

function unloadingBtn(btn) {
    $(btn).data('loading', false);
    $(btn).html($(btn).data('original'));
}

function resetInput(form, name) {
    name = $.trim(name);

    var s = '[name' + (name ? '="' + name + '"' : '') + ']';

    $(form).find(s).closest('.form-group').removeClass('has-success has-danger');
    $(form).find(s).closest('.form-group').find('.form-control-feedback').html("");
}

function errorInput(form, name, msg) {
    resetInput(form, name);

    name = $.trim(name);
    msg = $.trim(msg);

    var s = '[name' + (name ? '="' + name + '"' : '') + ']';

    $(form).find(s).closest('.form-group').addClass('has-danger');
    $(form).find(s).closest('.form-group').find('.form-control-feedback').html(msg);
}

function successInput(form, name, msg) {
    resetInput(form, name);

    name = $.trim(name);
    msg = $.trim(msg);

    var s = '[name' + (name ? '="' + name + '"' : '') + ']';

    $(form).find(s).closest('.form-group').addClass('has-success');
    $(form).find(s).closest('.form-group').find('.form-control-feedback').html(msg);
}

function successAllInputs(form) {
    $(form).find('.form-group').removeClass('has-danger').addClass('has-success');
    $(form).find('.form-group').find('.form-control-feedback').html('');
}

function trimInputs(form) {
    $(form).find('[data-trim="1"]').each(function (i, e) {
        $(e).val($.trim($(e).val()));
    });
}

// function clearInputs(form) {
//     $(form).find('[data-clear="1"]').each(function (i, e) {
//         $(e).val('');
//     });
// }
//
// function resetForm(form) {
//     resetInput(form);
//     clearInputs(form);
// }

function checkRequired(form) {
    var $field,
        find,
        name,
        err,
        s = $(form).serializeArray();

    // console.log('checkRequired 1');
    s.forEach(function (item) {
        $field = $(form).find('[name="' + item.name + '"][type!="radio"][type!="checkbox"]');

        if (!$field.hasClass('_not_check_input')) {
            if (item.value || $field.is(':not(:required)')) {
                successInput(form, item.name);
            }
        }
    });

    // console.log('checkRequired 2');
    $(form).find(':required').each(function () {
        find = false;
        name = this.name;
        s.forEach(function (item) {
            if (item.name === name && item.value) {
                find = true;
            }

            // console.log(item);
        });

        if (!find) {
            err = $(this).data('required') ? $(this).data('required') : "Введите";
            errorInput(form, name, err);
            throw new Error(err);
        }
    });
}

function handleErrors(form, errors) {
    if (errors) {
        errors.forEach(function (item) {
            errorInput(form, item['field'], item['message']);
        });
    }
}

function init_waypoint($d) {
    try {
        $d.waypoint({
            handler: function handler() {
                var $e = $(this.element);
                $e.addClass($e.data('animate')).css('visibility', 'visible');
            },
            offset: '90%'
        });
    } catch (e) {
        $d.addClass($d.data('animate')).css('visibility', 'visible');
    }
}

function init_lazy($d) {
    try {
        $d.Lazy();
    } catch (e) {}
}

function init_tooltip($d) {
    try {
        $d.tooltip();
    } catch (e) {}
}

function init_popover($d) {
    try {
        $d.popover({
            trigger: 'focus'
        }).on('click', function () {
            return false;
        });
    } catch (e) {}
}

function init_ripple(c) {
    try {
        $.ripple(c, {
            debug: false, // Turn Ripple.js logging on/off
            on: 'mousedown', // The event to trigger a ripple effect

            opacity: 0.4, // The opacity of the ripple
            color: "auto", // Set the background color. If set to "auto", it will use the text color
            multi: false, // Allow multiple ripples per element

            duration: 0.7, // The duration of the ripple

            // Filter function for modifying the speed of the ripple
            rate: function rate(pxPerSecond) {
                return pxPerSecond;
            },

            easing: 'linear' // The CSS3 easing function of the ripple
        });
    } catch (e) {}
}

function init_polymer($d) {
    try {
        $d.polymerForm({
            label_default: '',
            margin_top: 0,
            margin_bottom: 0
        });
    } catch (e) {}
}

function getSerializeArray($form) {
    var dataObj = {};
    $form.serializeArray().forEach(function (item) {
        dataObj[item.name] = item.value;
    });
    return dataObj;
}

function number_format(number, decimals, dec_point, thousands_sep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = typeof thousands_sep === 'undefined' ? ',' : thousands_sep,
        dec = typeof dec_point === 'undefined' ? '.' : dec_point,
        s = '',
        toFixedFix = function toFixedFix(n, prec) {
        var k = Math.pow(10, prec);
        return '' + (Math.round(n * k) / k).toFixed(prec);
    };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
//# sourceMappingURL=main.js.map