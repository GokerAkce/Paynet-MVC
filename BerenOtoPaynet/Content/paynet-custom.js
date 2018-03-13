var Paynet;
(Paynet = function () {
    'use strict';

    var modules = {};

    //Events
    (function (m) {
        var events = {};

        events.onLoad = function () { };
        events.onPaymentClick = function () { };
        events.onAuthentication = function () { };
        events.onCreateToken = function () { };
        events.validationError = function () { };
        events.onTdsRedirect = function () { };
        events.onCheckBin = function () { };
        events.onFormSubmiting = function () { };
        events.onCreateTokenExecuting = function () { };

        events.onCheckCardBin = function () { };
        events.onCreateCardToken = function () { };
        events.onCreateCardTokenExecuting = function () { };

        m.events = events;
    }(modules));

    //DOM Module
    (function (m) {
        var qry = {};

        qry = function (element) {
            var foundedElement = qry.get(element);

            var doAction = function (action) {
                if (foundedElement.length) {
                    for (var i = 0; i < foundedElement.length; i++) {
                        action(foundedElement[i]);
                    }
                }
            }

            return {
                attach: function (eventName, callback) {
                    doAction(function (x) {
                        x.addEventListener(eventName, function (e) {
                            callback(e);

                            x.removeEventListener(eventName, function () { }, false);
                        }, false);
                    });

                    return qry(element);
                },
                ready: function (callback) {
                    if (document.readyState == "complete" ||
                        document.readyState == "interactive") {
                        callback();
                    } else {
                        this.attach("DOMContentLoaded", callback);
                    }
                },
                attr: function (name, value) {
                    if (value) {
                        doAction(function (x) {
                            x.setAttribute(name, value);
                        });

                        return qry(element);
                    } else {
                        if (foundedElement.length) {
                            return foundedElement[0].getAttribute(name);
                        }
                    }
                },
                html: function (raw) {
                    if (foundedElement.length) {
                        if (raw) {
                            doAction(function (x) {
                                x.innerHTML = raw;
                            });

                            return qry(element);
                        } else {
                            return foundedElement[0].innerHTML;
                        }
                    }

                    return qry(element);
                },
                css: function (obj) {
                    if (obj) {
                        var cssText = '';

                        for (var property in obj) {
                            cssText += property + ':' + obj[property] + ';';
                        }

                        doAction(function (x) {
                            x.style.cssText = cssText;
                        });

                        return qry(element);
                    } else {
                        if (foundedElement.length) {
                            return foundedElement[0].style.cssText;
                        }
                    }
                },
                appendTo: function (to) {
                    var result = qry.get(to);

                    doAction(function (x) {
                        if (result.length) {
                            result[0].appendChild(x);
                        }
                    });

                    return qry(element);
                },
                append: function (elm) {
                    doAction(function (x) {
                        x.appendChild(elm);
                    });

                    return qry(element);
                },
                remove: function () {
                    doAction(function (x) {
                        var parent = x.parentNode;

                        parent.removeChild(x);
                    });
                },
                has: function () {
                    return foundedElement.length > 0;
                },
                val: function () {
                    return foundedElement.length
                                ? foundedElement[0].value
                                : undefined;
                },
                is: function (k) {
                    switch (k) {
                        case ':checkbox':
                            return foundedElement[0].type == 'checkbox';
                        case ':checked':
                            return foundedElement[0].checked;
                        case ':radio':
                            return foundedElement[0].type == 'radio';
                        default:
                            return false;
                    }
                },
                submit: function () {
                    if (foundedElement.length) {
                        if (foundedElement[0].nodeName == 'FORM') {
                            foundedElement[0].submit();
                        }
                    }
                },
                item: function () {
                    return foundedElement.length ? foundedElement[0] : undefined;
                },
                defaultAttr: function (name, defaultValue) {
                    if (foundedElement.length) {
                        var attrValue = foundedElement[0].getAttribute(name)
                        if (attrValue) {
                            try {
                                return JSON.parse(attrValue);
                            } catch (e) {
                                return attrValue;
                            }
                        } else {
                            return defaultValue;
                        }
                    }
                }
            };
        }

        qry.create = function (element, options) {
            var created = document.createElement(element);

            for (var option in options) {
                qry(created).attr(option, options[option]);
            }

            return qry(created);
        }

        qry.get = function (query) {
            if (typeof query == 'object') {
                if (query instanceof Array) {
                    return query;
                }

                return [query];
            }

            return document.querySelectorAll(query);
        }

        qry.each = function (array, iterator) {
            for (var i = 0; i < array.length; i++) {
                iterator(array[i], i);
            }
        }

        m.qry = qry;
    }(modules));

    //Utilities
    (function (m) {
        var utils = {};

        var httpStatusCodeGroup = {
            'Info': '1',
            'Success': '2',
            'Redirect': '3',
            'BedRequest': '4',
            'InternalServerError': '5'
        }
        utils.trim = function (val) {
            if (val) {
                return val.replace(/\ /g, '').replace(/-/g, '');
            }

            return val;
        }
		
        utils.parseFormattedFloat = function (value) {
            return parseFloat(value.toString().replace(/\./g, '').replace(/\,/g, '.'));
        }

        utils.messageExecuter = function (command) {
            switch (command) {
                case 'close-iframe': return function (data) {
                    document.getElementsByTagName('body')[0].removeChild(document.querySelector('.payment-iframe'));
                };
                case 'iframe-no-transparent': return function (data) {
                    var ifrm = document.querySelector('.payment-iframe');
                    ifrm.style.background = 'white';
                };
                case 'iframe-transparent': return function (data) {
                    var ifrm = document.querySelector('.payment-iframe');
                    ifrm.style.background = 'rgba(0, 0, 0, 0.00392157)';
                };
                case 'form-post': return function (data) {
                    var form = m.qry(m.API.context.form);

                    if (form) {
                        for (var d in data) {
                            if (d != 'command') {
                                var formInput = document.createElement('input');
                                formInput.type = 'hidden';
                                formInput.name = d;
                                formInput.value = data[d];

                                form.append(formInput);
                            }
                        }

                        utils.removeSecureInputs();

                        modules.events.onFormSubmiting();

                        form.submit();
                    } else {
                        throw Error('Form element not found');
                    }
                };
            }
        }

        utils.parseQueryString = function (qs) {
            var qsObject = {};

            qs.split('&').forEach(function (e, i) {
                var keyValue = e.split('=');

                qsObject[keyValue[0]] = utils.tryParse(decodeURIComponent(keyValue[1]));
            });

            return qsObject;
        }

        utils.toApiType = function (inputs, extra) {
            var scheme = {
                'number': 'pan',
                'installmentKey': 'instalment_key',
                'holderName': 'card_holder',
                'exp-month': 'month',
                'exp-year': 'year',
                'cvv': 'cvc',
                'desc': 'description',
                'phone': 'card_holder_phone',
                'email': 'card_holder_mail',
                'do3D': 'do_3ds',
                'save-card': 'save_card',
                'save-card-gsm': 'save_card_gsm',
                'save-card-desc': 'save_card_desc',
                'card-hash': 'card_hash'
            }
			
            var func = {
                'number': function (val) { return utils.trim(val); }
            };
			
            var model = {};

            m.qry.each(inputs, function (item) {
                var input = m.qry(item);
                var attr = input.attr('data-paynet');

                if (input.is(':checkbox')) {
                    model[scheme[attr]] = input.is(':checked');
                }
                else {
                   if (func[attr]) {
                        model[scheme[attr]] = func[attr](input.val());
                    }
                    else {
                        model[scheme[attr]] = input.val();
                    }
                }
            });

            if (extra) {
                for (var key in extra) {
                    model[key] = extra[key];
                }
            }

            return model;
        }

        utils.tryParse = function (str) {
            try {
                return JSON.parse(str);
            } catch (e) {
                return str;
            }
        }

        utils.xhr = function (options) {
            function isFunc(obj) {
                return obj && typeof obj == 'function';
            }

            var xmlReq = (new XMLHttpRequest);

            xmlReq.open(options.type, options.url, true);

            xmlReq.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            xmlReq.setRequestHeader('Accept', 'application/json');

            if (options.token) {
                xmlReq.setRequestHeader('Authorization', 'Basic ' + options.token);
            }

            xmlReq.addEventListener('readystatechange', function (e) {
                if (this.readyState === 4) {
                    var status = e.currentTarget.status.toString()[0];

                    if (status == httpStatusCodeGroup.Success) {
                        if (isFunc(options.success)) {
                            options.success(JSON.parse(e.currentTarget.responseText));
                        }
                    } else if (status == httpStatusCodeGroup.InternalServerError || status == httpStatusCodeGroup.BedRequest) {
                        if (isFunc(options.error)) {
                            options.error(JSON.parse(e.currentTarget.responseText));
                        }
                    }
                }
            });

            xmlReq.send(JSON.stringify(options.data));
        }

        utils.buildQueryString = function (obj) {
            var queryString = '?';

            for (var property in obj) {
                if (obj[property]) {
                    queryString += property + '=' + encodeURIComponent(obj[property]) + '&';
                }
            }

            return queryString.slice(0, queryString.length - 1);
        }

        utils.isOnlyAlpha = function (str) {
            var chars = '0123456789"é!^#%½&/{([)]=}?*\-|_~,`;.:´|<>€@æß₺';

            for (var item in str) {
                if (chars.indexOf(str[item]) != -1) {
                    return false;
                }
            }

            return true;
        }

        utils.refreshContext = function (context) {
            var button = m.qry('.paynet-button');

            context.form = button.defaultAttr('data-form');
            context.publicKey = button.defaultAttr('data-key');
            context.amount = utils.parseFormattedFloat(button.defaultAttr('data-amount', 0)) * 100;
            context.name = button.defaultAttr('data-name');
            context.tdsRequired = button.defaultAttr('data-tds_required', true);
            context.description = button.defaultAttr('data-description');
            context.agent = button.defaultAttr('data-agent');
            context.comm = button.defaultAttr('data-add_commission_amount');
            context.noInstallment = button.defaultAttr('data-no_instalment');
            context.posType = button.defaultAttr('data-pos_type');
            context.reference = button.defaultAttr('data-reference_no');
            context.authMode = button.defaultAttr('data-authmode', 'load');
			context.ratioCode = button.defaultAttr('data-ratio_code');
			context.cardType = button.defaultAttr('data-card_type');
			context.showTdsError = button.defaultAttr('data-show_tds_error',true);
			context.mergeOption = button.defaultAttr('data-merge_option',false);
			context.ratioCodeMethod = button.defaultAttr('data-ratio_code_method');
			context.invoiceNo = button.defaultAttr('data-invoice_no');
			context.saveCard = button.defaultAttr('data-save_card',false);
			context.saveCardUID = button.defaultAttr('data-save_carduid');
			context.saveCardOID = button.defaultAttr('data-save_cardoid'); 
			context.saveCardGSMNo = button.defaultAttr('data-save_card_gsmno');
			context.saveCardDesc = button.defaultAttr('data-save_card_desc');
			context.useSavedCard = button.defaultAttr('data-use_saved_card');
			context.returnURL = button.defaultAttr('data-return_url');
            context.domain = window.location.protocol + '//' + window.location.host
        }

        utils.manipulateModel = function (model) {
            var manipulated = {};

            var actions = {
                pan: function (value) {
                      return utils.trim(value).substr(0, 6) + '******' + utils.trim(value).substr(12, 4);
                },
                instalment_key: function (value) {
                    return value;
                },
                card_holder: function (value) {
                    return value;
                },
                description: function (value) {
                    return value;
                },
                card_holder_phone: function (value) {
                    return value;
                },
                card_holder_mail: function (value) {
                    return value;
                },
                do_3ds: function (value) {
                    return value;
                }
            };

            for (var m in actions) {

                if (model[m])
                {
                    manipulated[m] = actions[m](model[m]);
                }

            }

            return manipulated;
        }

        utils.removeSecureInputs = function () {
            var secureInputs = ['number', 'exp-year', 'exp-month', 'cvv'];

            m.qry.each(document.querySelectorAll('[data-paynet]'), function (item) {
                if (secureInputs.indexOf(item.getAttribute('data-paynet')) != -1) {
                    item.removeAttribute('name');
                    item.removeAttribute('id');
                }
            });
        }

        utils.sendAuthUpdateRequest = function(callback)
        {
            var params = {};

            params.amount = m.API.context.amount,
            params.token = m.API.context.publicKey,
            params.session_id = m.API.context.session,
            params.add_commission = m.API.context.comm,
            params.ratio_code = m.API.context.ratioCode,
            params.save_card = m.API.context.saveCard,
            params.card_desc = m.API.context.saveCardDesc,
            params.user_gsm_no = m.API.context.saveCardGSMNo

            m.services.updateAmount(
                params,
                function (s) {
                    if (callback) {
                        callback(s);
                    }
                }, function (done) {
                    if (modules.API.context.isAuthenticated) {
                        done({ ok: true });
                    } else {
                        modules.services.checkAuth('request', function (s) {
                            done(s);
                            modules.events.onAuthentication(s);
                        });
                    }
                });
        }

        utils.validateInstalment = function (model) {

            if (!model.instalment_key) {
                return { ok: false, message: 'Taksit bilgisi zorunlu', code: 13 };
            }

            if (model.instalment_key === '') {
                return { ok: false, message: 'Taksit bilgisi yanlış, Lütfen taksit seçiniz.', code: 14 };
            }

            return { ok: true };
        }

        utils.validateSaveCardDesc = function (model) {

            if (modules.API.context.saveCard == false) //kart saklama aktif değilse kontrol etme
            {
                return { ok: true };
            }

            if (!model.save_card_desc) {
                return { ok: false, message: 'Kart saklama ismi zorunlu', code: 17 };
            }

            return { ok: true };
        }

        utils.validateSaveCardGsmNo = function (model) {

            if (modules.API.context.saveCard == false) //kart saklama aktif değilse kontrol etme
            {
                return { ok: true };
            }

            if (!model.save_card_gsm) {
                return { ok: false, message: 'Kart saklama için kullanılacak telefon numarası zorunlu', code: 18 };
            }

            if (model.save_card_gsm.length != 10) {
                return { ok: false, message: 'Kart saklama için kullanılacak telefon numaranızı 10 hane olarak giriniz', code: 19 };
            }

            var containsNotNumber = !(String(model.save_card_gsm).match("^[0-9]+$"));

            if (containsNotNumber) {
                return { ok: false, message: 'Kart saklama için kullanılacak telefon numaranız sadece rakamlardan oluşmalı', code: 20 };
            }

            return { ok: true };
        }

        utils.validateCardHash = function (model) {

            if (!model.card_hash) {
                return { ok: false, message: 'Lütfen kaydedilmiş kartı seçin.', code: 21 };
            }

            return { ok: true };
        }

        m.utils = utils;
    }(modules));

    //Validations
    (function (m) {
        var validations = [
            function (model) {
                if (!model.pan) {
                    return { ok: false, message: 'Kart numarası zorunlu', code: 1 };
                }

                 if (modules.utils.trim(model.pan).length > 16 || modules.utils.trim(model.pan).length < 15) {
                    return { ok: false, message: 'Kart numarası bilgisi yanlış', code: 2 };
                }

                return { ok: true };
            },

            function (model) {
                if (!model.cvc) {
                    return { ok: false, message: 'CVC kodu zorunlu', code: 3 };
                }

                if (model.cvc.length > 4 || model.cvc.length < 3) {
                    return { ok: false, message: 'CVC kodu yanlış', code: 4 };
                }

                return { ok: true };
            },

            function (model) {
                if (!model.month) {
                    return { ok: false, message: 'Ay bilgisi zorunlu', code: 5 };
                }

                if (isNaN(model.month) || model.month.length > 2) {
                    return { ok: false, message: 'Ay bilgisi yanlış', code: 6 };
                }

                if (parseInt(model.month) > 12 || parseInt(model.month) < 1) {
                    return { ok: false, message: 'Ay bilgisi yanlış', code: 7 };
                }

                return { ok: true };
            },

            function (model) {
                if (!model.year) {
                    return { ok: false, message: 'Yıl bilgisi zorunlu', code: 8 };
                }

                if (isNaN(model.year) || model.year.length > 4 || model.year.length < 2) {
                    return { ok: false, message: 'Yıl bilgisi yanlış', code: 9 };
                }

                if (model.year.toString().length == 4 && parseInt(model.year) < (new Date).getFullYear()) {
                    return { ok: false, message: 'Yıl bilgisi yanlış', code: 10 };
                }

                if (model.year.toString().length == 2 && parseInt(model.year) < parseInt((new Date).getFullYear().toString().substr(2, 2))) {
                    return { ok: false, message: 'Yıl bilgisi yanlış', code: 11 };
                }

                return { ok: true };
            },
            modules.utils.validateInstalment,
            function (model) {
                if (!model.card_holder) {
                    return { ok: false, message: 'Kart sahibi bilgisi zorunlu', code: 15 };
                }

                if (!modules.utils.isOnlyAlpha(model.card_holder)) {
                    return { ok: false, message: 'Kart sahibi bilgisi yanlış', code: 16 };
                }

                return { ok: true };
            },
            modules.utils.validateSaveCardDesc,
            modules.utils.validateSaveCardGsmNo
        ];

        m.validations = validations;

    }(modules));

    //PaynetAPI
    (function (m) {
        var paynet = {};

        paynet.context = {
            publicKey: '',
            amount: 0,
            tdsRequired: '',
            description: '',
            agent: '',
            comm: '',
            noInstallment: '',
            posType: '',
            reference: '',
            domain: '',
            expire_date: '',
            name: '',
            session: '',
            currentBin: '',
            authMode: '',
			showTdsError: true,
			mergeOption : false,
            isAuthenticated: false,
			saveCard:false,
			saveCardUID:'',
			saveCardOID:'',
			saveCardGSMNo: '',
			saveCardDesc: '',
			currentCardHash: '',
            useSavedCard: false,
			returnURL:''
        };

        //paynet.apiURL = 'http://localhost:56330/';
        paynet.apiURL = 'https://pts-api.paynet.com.tr/';
        //paynet.apiURL = 'https://test4-api.paynet.com.tr/';

        paynet.createToken = function (parameters, callback, err) {
            m.utils.xhr({
                token: parameters.token,
                type: 'POST',
                url: paynet.apiURL + 'v1/paynetj/create_token',
                data: parameters,
                success: callback,
                error: err
            });
        }

        paynet.createCardToken = function (parameters, callback, err) {
            m.utils.xhr({
                token: parameters.token,
                type: 'POST',
                url: paynet.apiURL + 'v1/paynetj/create_card_token',
                data: parameters,
                success: callback,
                error: err
            });
        }

        paynet.auth = function (parameters, callback, err) {
            m.utils.xhr({
                token: parameters.token,
                type: 'POST',
                url: paynet.apiURL + 'v1/paynetj/auth?type=CF',
                data: parameters,
                success: callback,
                error: err
            });
        }

        paynet.checkBin = function (parameters, callback, err) {
            m.utils.xhr({
                token: parameters.token,
                type: 'POST',
                url: paynet.apiURL + 'v1/paynetj/check_bin',
                data: parameters,
                success: callback,
                error: err
            });
        }

        paynet.checkCardBin = function (parameters, callback, err) {
            m.utils.xhr({
                token: parameters.token,
                type: 'POST',
                url: paynet.apiURL + 'v1/paynetj/check_card_bin',
                data: parameters,
                success: callback,
                error: err
            });
        }

        paynet.updateAmount = function (parameters, callback, err) {
            m.utils.xhr({
                token: parameters.token,
                type: 'POST',
                url: paynet.apiURL + 'v1/paynetj/auth_update',
                data: parameters,
                success: callback,
                error: err
            });
        }

        paynet.installments = function (parameters, callback, err) {
            m.utils.xhr({
                token: parameters.token,
                type: 'POST',
                url: paynet.apiURL + 'v1/ratio/Get_public',
                data: parameters,
                success: callback,
                error: err
            });
        }

        m.API = paynet;
    }(modules));

    //Init Context
    (function (m) {
        m.utils.refreshContext(m.API.context);
    }(modules));

    //Services
    (function (m) {
        var services = {};

        services.auth = function (callback) {
            if (!m.API.context.isAuthenticated) {
                m.API.auth({
                    token: m.API.context.publicKey,
                    amount: m.API.context.amount,
                    agent_id: m.API.context.agent,
                    add_commission: m.API.context.comm,
                    pos_type: m.API.context.posType,
					ratio_code: m.API.context.ratioCode,
                    domain: m.API.context.domain,
                    tds_required: m.API.context.tdsRequired,
					show_tds_error: m.API.context.showTdsError,
					merge_option  : m.API.context.mergeOption,
					ratio_code_method  : m.API.context.ratioCodeMethod,
					invoice_no  : m.API.context.invoiceNo,
					save_card: m.API.context.saveCard,
					user_unique_id  : m.API.context.saveCardUID,
					user_gsm_no  : m.API.context.saveCardGSMNo,
					card_owner_id: m.API.context.saveCardOID,
					card_desc: m.API.context.saveCardDesc,
					return_url  : m.API.context.returnURL
                }, function (r) {
                    m.API.context.expire_date = r.expire_date;
                    m.API.context.name = r.name;
                    m.API.context.session = r.session_id;
                    m.API.context.isAuthenticated = true;
					m.API.context.tdsRequired = r.tds_required == true ? r.tds_required : m.API.context.tdsRequired;

                    callback({
                        ok: true,
                        session: r.session_id,
                        expire: r.expire_date
                    });
                }, function (err) {
                    callback({
                        ok: false,
                        code: err.result_code,
                        message: err.message
                    });
                });
            }
        }

        services.checkAuth = function (invokeBy, callback) {
            if (invokeBy == m.API.context.authMode) {
                services.auth(callback);
            }
        }

        services.checkBin = function (cardNumber, callBack, before, forceUpdate) {		
             if (modules.utils.trim(cardNumber).length < 6) {
                m.API.context.currentBin = '';

                callBack();

                return;
            }

            before(function (authCallback) {
                if (authCallback.ok) {
                   var bin = modules.utils.trim(cardNumber).substr(0, 6);
                    if (forceUpdate || bin != m.API.context.currentBin) {
                        m.API.checkBin({
                            token: m.API.context.publicKey,
                            bin: bin,
                            session_id: m.API.context.session,
							no_instalment : m.API.context.noInstallment
                        }, function (r) {
                            callBack({
                                ok: true,
                                tdsState: m.API.context.tdsRequired ? 'required' : 'optional',
                                bank: {
                                    id: r.bank_id,
                                    logoUrl: r.bank_logo,
                                    name: r.bank_name,
                                    tdsEnable: r.tds_enable,
                                    installments: r.data
                                },
				                cardType : r.card_type
                            });
                        }, function (err) {
                            callBack({
                                code: err.result_code,
                                message: err.message,
                                ok: false
                            });
                        });

                        m.API.context.currentBin = bin;
                    }
                }
            });
        }

        services.checkCardBin = function (cardHash, callBack, before, forceUpdate) {
            if (cardHash.length == 0) {
                m.API.context.currentCardHash = '';
                callBack();
                return;
            }

            before(function (authCallback) {
                if (authCallback.ok) {

                    if (forceUpdate || cardHash != m.API.context.currentCardHash) {
                        m.API.checkCardBin({
                            token: m.API.context.publicKey,
                            card_hash: cardHash,
                            card_owner_id : m.API.context.saveCardOID,
                            session_id: m.API.context.session,
                            no_instalment: m.API.context.noInstallment
                        }, function (r) {
                            callBack({
                                ok: true,
                                tdsState: m.API.context.tdsRequired ? 'required' : 'optional',
                                bank: {
                                    id: r.bank_id,
                                    logoUrl: r.bank_logo,
                                    name: r.bank_name,
                                    tdsEnable: r.tds_enable,
                                    installments: r.data
                                },
                                cardType: r.card_type
                            });
                        }, function (err) {
                            callBack({
                                code: err.result_code,
                                message: err.message,
                                ok: false
                            });
                        });

                        m.API.context.currentCardHash = cardHash;
                    }
                }
            });
        }

        services.createToken = function (inputs, callback, before) {
            before(function (authCallback) {
                if (authCallback.ok) {
                    var model = m.utils.toApiType(inputs, {
                        session_id: m.API.context.session,
                        token: m.API.context.publicKey
                    });

                    model.do_3ds = (!m.API.context.tdsRequired && model.do_3ds) || m.API.context.tdsRequired;

                    m.API.createToken(model, function (r) {
                        if (r.is_tds) {
                            callback({
                                ok: true,
                                isTds: true,
                                token: r.token_id,
                                iframe: m.qry.create('iframe', {
                                    src: r.post_url + m.utils.buildQueryString({
                                        session_id: m.API.context.session,
                                        token_id: r.token_id,
                                        publishable_key: m.API.context.publicKey
                                    }),
                                    class: 'payment-iframe',
                                    frameborder: 0
                                }).css({
                                    'z-index': 9999,
                                    'display': 'block',
                                    'overflowX': 'hidden',
                                    'overflowY': 'auto',
                                    'visibility': 'visible',
                                    'margin': '0px',
                                    'padding': '0px',
                                    'position': 'fixed',
                                    'left': '0px',
                                    'top': '0px',
                                    'width': '100%',
                                    'height': '100%',
                                    'background': 'white'
                                })
                            });
                        } else {
                            callback({
                                ok: true,
                                isTds: false,
                                form: m.qry(m.API.context.form).append(m.qry.create('input', {
                                    name: 'token_id',
                                    type: 'hidden',
                                    value: r.token_id
                                }).item()).append(m.qry.create('input', {
                                    name: 'session_id',
                                    type: 'hidden',
                                    value: m.API.context.session
                                }).item())
                            });
                        }
                    }, function (err) {
                        callback({
                            ok: false,
                            code: err.result_code,
                            message: err.message
                        });
                    });
                }
            });
        }

        services.createCardToken = function (inputs, callback, before) {
            before(function (authCallback) {
                if (authCallback.ok) {
                    var model = m.utils.toApiType(inputs, {
                        card_owner_id: m.API.context.saveCardOID,
                        session_id: m.API.context.session,
                        token: m.API.context.publicKey
                    });

                    model.do_3ds = (!m.API.context.tdsRequired && model.do_3ds) || m.API.context.tdsRequired;

                    m.API.createCardToken(model, function (r) {
                        if (r.is_tds) {
                            callback({
                                ok: true,
                                isTds: true,
                                token: r.token_id,
                                iframe: m.qry.create('iframe', {
                                    src: r.post_url + m.utils.buildQueryString({
                                        session_id: m.API.context.session,
                                        token_id: r.token_id,
                                        publishable_key: m.API.context.publicKey
                                    }),
                                    class: 'payment-iframe',
                                    frameborder: 0
                                }).css({
                                    'z-index': 9999,
                                    'display': 'block',
                                    'overflowX': 'hidden',
                                    'overflowY': 'auto',
                                    'visibility': 'visible',
                                    'margin': '0px',
                                    'padding': '0px',
                                    'position': 'fixed',
                                    'left': '0px',
                                    'top': '0px',
                                    'width': '100%',
                                    'height': '100%',
                                    'background': 'white'
                                })
                            });
                        } else {
                            callback({
                                ok: true,
                                isTds: false,
                                form: m.qry(m.API.context.form).append(m.qry.create('input', {
                                    name: 'token_id',
                                    type: 'hidden',
                                    value: r.token_id
                                }).item()).append(m.qry.create('input', {
                                    name: 'session_id',
                                    type: 'hidden',
                                    value: m.API.context.session
                                }).item())
                            });
                        }
                    }, function (err) {
                        callback({
                            ok: false,
                            code: err.result_code,
                            message: err.message
                        });
                    });
                }
            });
        }

        services.isModelValid = function (inputs) {
            var model = m.utils.toApiType(inputs);

            for (var i = 0; i < m.validations.length; i++) {
                var validationResult = m.validations[i](model);

                if (!validationResult.ok) {
                    return {
                        ok: false,
                        message: validationResult.message,
                        code: validationResult.code
                    }
                }
            }

            return {
                ok: true
            };
        }

        services.isUseSavedCardModelValid = function (inputs)
        {
            var model = m.utils.toApiType(inputs);

            var cardValidationResult = m.utils.validateCardHash(model);
            if (!cardValidationResult.ok)
            {
                return {
                    ok: false,
                    message: cardValidationResult.message,
                    code: cardValidationResult.code
                }
            }

            var instalmentValidationResult = m.utils.validateInstalment(model);
            if (!instalmentValidationResult.ok) {
                return {
                    ok: false,
                    message: instalmentValidationResult.message,
                    code: instalmentValidationResult.code
                }
            }

            return {
                ok: true
            };
        }

        services.updateAmount = function (parameters, callback, before) {
            before(function (authCallback) {
                if (authCallback.ok) {
                    m.API.updateAmount(parameters,
                        function (r) {
                            callback({
                                ok: true,
                                message: r.message
                            });
                        },
                        function (r) {
                            callback({
                                ok: false,
                                message: r.message
                            });
                        });
                }
            });
        }

        services.installments = function (parameters, callback, before) {
            before(function (authCallback) {
                if (authCallback.ok) {
                    m.API.installments(parameters,
                        function (d) {
                            callback({
                                ok: true,
                                data: d.data
                            });
                        },
                        function () {
                            callback({
                                ok: false,
                                code: d.code,
                                message: d.message
                            });
                        });
                }
            });
        }

        m.services = services;
    }(modules));

    //App
    (function ($, u, evnt, s, ctx) {
        $(document).ready(function () {
            s.checkAuth('load', function (s) {
                evnt.onAuthentication(s);
            });

            $('[data-paynet="submit"]').attach('click', function (e) {
                evnt.onPaymentClick();

                var inputs = $.get('input[data-paynet], select[data-paynet]');

                var validationResult = {};

                if (ctx.useSavedCard) {
                    validationResult = s.isUseSavedCardModelValid(inputs);
                }
                else {
                    validationResult = s.isModelValid(inputs);
                }

                if (!validationResult.ok) {
                    console.error('code:', validationResult.code, 'error:', validationResult.message);
                    e.preventDefault();
                    evnt.validationError(validationResult);
                    return false;
                }

                evnt.onCreateTokenExecuting({
                    model: u.manipulateModel(u.toApiType(inputs)),
                    isAuthenticated: ctx.isAuthenticated,
                    session: ctx.session
                });

                if (ctx.useSavedCard) {
                    s.createCardToken(inputs, function (c) {
                        if (c.ok) {
                            evnt.onCreateCardToken({
                                ok: true,
                                is3DPayment: c.isTds
                            });

                            if (c.isTds) {
                                evnt.onTdsRedirect();
                                c.iframe.appendTo('body');
                            }
                            else {
                                u.removeSecureInputs();
                                evnt.onFormSubmiting();
                                c.form.submit();
                            }
                        } else {
                            evnt.onCreateCardToken(c);
                        }
                    }, function (done) {
                        if (ctx.isAuthenticated) {
                            done({ ok: true });
                        } else {
                            s.checkAuth('request', function (s) {
                                done(s);
                                evnt.onAuthentication(s);
                            });
                        }
                    });
                }
                else {
                    s.createToken(inputs, function (c) {
                        if (c.ok) {
                            evnt.onCreateToken({
                                ok: true,
                                is3DPayment: c.isTds
                            });

                            if (c.isTds) {
                                evnt.onTdsRedirect();

                                c.iframe.appendTo('body');
                            }
                            else {
                                u.removeSecureInputs();

                                evnt.onFormSubmiting();

                                c.form.submit();
                            }
                        } else {
                            evnt.onCreateToken(c);
                        }
                    }, function (done) {
                        if (ctx.isAuthenticated) {
                            done({ ok: true });
                        } else {
                            s.checkAuth('request', function (s) {
                                done(s);
                                evnt.onAuthentication(s);
                            });
                        }
                    });
                }

                e.preventDefault();
            });

            $('[data-paynet="number"]').attach('keyup', function (e) {
                s.checkBin(e.currentTarget.value, function (c) {
                    evnt.onCheckBin(c);
                }, function (done) {
                    if (ctx.isAuthenticated) {
                        done({ ok: true });
                    } else {
                        s.checkAuth('request', function (s) {
                            done(s);
                            evnt.onAuthentication(s);
                        });
                    }
                });
            });

            $(window).attach('message', function (evnt) {
                if (evnt) {
                    var data = evnt.length
                                    ? u.parseQueryString(evnt[0].data)
                                    : u.parseQueryString(evnt.data);

                    u.messageExecuter(data.command)(data);
                }
            });

            evnt.onLoad();
        });
    }(modules.qry, modules.utils, modules.events, modules.services, modules.API.context));

    return {
        utils: {
            refreshContext: function () {
                modules.utils.refreshContext(modules.API.context);
            }
        },
        events: {
            onLoad: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onLoad = fn;
                }
            },

            onPaymentClick: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onPaymentClick = fn;
                }
            },

            onAuthentication: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onAuthentication = fn;
                }
            },

            onCreateToken: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onCreateToken = fn;
                }
            },

            validationError: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.validationError = fn;
                }
            },

            onTdsRedirect: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onTdsRedirect = fn;
                }
            },

            onCheckBin: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onCheckBin = fn;
                }
            },

            onFormSubmiting: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onFormSubmiting = fn;
                }
            },

            onCreateTokenExecuting: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onCreateTokenExecuting = fn;
                }
            },

            onCheckCardBin: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onCheckCardBin = fn;
                }
            },

            onCreateCardToken: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onCreateCardToken = fn;
                }
            },

            onCreateCardTokenExecuting: function (fn) {
                if (typeof fn == 'function') {
                    modules.events.onCreateCardTokenExecuting = fn;
                }
            }

        },
        services: {
            auth: function () {
                modules.services.auth(function (s) {
                    modules.events.onAuthentication(s);
                });
            },
            checkBin: function (cardNumber, forceUpdate) {
                 modules.services.checkBin(modules.utils.trim(cardNumber),  function (c) {
                    modules.events.onCheckBin(c);
                }, function (done) {
                    if (modules.API.context.isAuthenticated) {
                        done({ ok: true });
                    } else {
                        modules.services.checkAuth('request', function (s) {
                            done(s);
                            modules.events.onAuthentication(s);
                        });
                    }
                }, forceUpdate);
            },
            checkCardBin: function (cardHash, forceUpdate) {
                modules.services.checkCardBin(cardHash.trim(), function (c) {
                    modules.events.onCheckCardBin(c);
                }, function (done) {
                    if (modules.API.context.isAuthenticated) {
                        done({ ok: true });
                    } else {
                        modules.services.checkAuth('request', function (s) {
                            done(s);
                            modules.events.onAuthentication(s);
                        });
                    }
                }, forceUpdate);
            },
            installments: function (callback, parameters) {                           

                modules.services.installments({
                    			amount: modules.API.context.amount,
					pos_type: modules.API.context.posType,
					card_type: modules.API.context.cardType,
                    			token: modules.API.context.publicKey,
                    			session_id: modules.API.context.session,
					merge_option :  modules.API.context.mergeOption					
                }, function (s) {
                    if (callback) {
                        callback(s);
                    }
                }, function (done) {
                    modules.API.context.currentBin = '';

                    if (modules.API.context.isAuthenticated) {
                        done({ ok: true });
                    } else {
                        modules.services.checkAuth('request', function (s) {
                            done(s);
                            modules.events.onAuthentication(s);
                        });
                    }
                });
            },
            updateAmount: function (amount, callback) {

                modules.API.context.amount = amount * 100;
                modules.utils.sendAuthUpdateRequest(callback);

            },
            updateRatioCode: function (amount, ratioCode, callback) {

                modules.API.context.amount = amount * 100;
                modules.API.context.ratioCode = ratioCode;
                modules.utils.sendAuthUpdateRequest(callback);

            },
		    updateAddCommToAmount: function (addCommToAmount, callback) {

		        modules.API.context.comm = addCommToAmount;
		        modules.utils.sendAuthUpdateRequest(callback);

		    },
		    updateSaveCardIsActive: function(saveCard, callback) {

		        modules.API.context.saveCard = saveCard;
		        modules.utils.sendAuthUpdateRequest(callback);

		    },
		    updateSaveCardDesc: function(saveCardDesc, callback) {

		        var input = modules.qry.get('input[data-paynet="save-card-desc"]');
		        var model = modules.utils.toApiType(input);
		        var validationResult = modules.utils.validateSaveCardDesc(model);

		        if (!validationResult.ok) {
		            console.error('code:', validationResult.code, 'error:', validationResult.message);

		            modules.events.validationError(validationResult);

		            return false;
		        }

		        modules.API.context.saveCardDesc = saveCardDesc;
		        modules.utils.sendAuthUpdateRequest(callback);

		    },
		    updateSaveCardGSMNo: function(saveCardGSMNo, callback) {

		        var input = modules.qry.get('input[data-paynet="save-card-gsm"]');

		        if (input.length > 0)
		        {
		            var model = modules.utils.toApiType(input);
		            var validationResult = modules.utils.validateSaveCardGsmNo(model);

		            if (!validationResult.ok) {
		                console.error('code:', validationResult.code, 'error:', validationResult.message);

		                modules.events.validationError(validationResult);

		                return false;
		            }
		        }

		        modules.API.context.saveCardGSMNo = saveCardGSMNo;
		        modules.utils.sendAuthUpdateRequest(callback);

		    },
		    useSavedCard: function (useSavedCard) {
		        modules.API.context.useSavedCard = useSavedCard;
		    },
            createToken: function () {
                var inputs = modules.qry.get('input[data-paynet], select[data-paynet]');

                var validationResult = modules.services.isModelValid(inputs);

                if (!validationResult.ok) {
                    console.error('code:', validationResult.code, 'error:', validationResult.message);

                    modules.events.validationError(validationResult);

                    return false;
                }

                modules.events.onCreateTokenExecuting({
                    model: modules.utils.manipulateModel(modules.utils.toApiType(inputs)),
                    isAuthenticated: modules.API.context.isAuthenticated,
                    session: modules.API.context.session
                });

                modules.services.createToken(inputs, function (c) {
                    if (c.ok) {
                        modules.events.onCreateToken({
                            ok: true,
                            is3DPayment: c.isTds,
                            orderToken: c.token,
                        });

                        if (c.isTds) {
                            modules.events.onTdsRedirect();

                            c.iframe.appendTo('body');
                        }
                        else {
                            modules.qry.each(document.querySelectorAll('[data-paynet]'), function (item) {
                                item.removeAttribute('name');
                                item.removeAttribute('id');
                            });

                            modules.events.onFormSubmiting();

                            c.form.submit();
                        }
                    } else {
                        modules.events.onCreateToken(c);
                    }
                }, function (done) {
                    if (modules.API.context.isAuthenticated) {
                        done({ ok: true });
                    } else {
                        modules.services.checkAuth('request', function (s) {
                            done(s);
                            modules.events.onAuthentication(s);
                        });
                    }
                });
            }
        }
    };
}());