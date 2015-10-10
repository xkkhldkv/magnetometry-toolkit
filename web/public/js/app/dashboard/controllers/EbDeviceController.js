/**
 * Developer: Stepan Burguchev
 * Date: 9/27/2015
 * Copyright: 2009-2015 Stepan Burguchev®
 *       All Rights Reserved
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'lib',
    'core',
    '../models/EbDeviceStatusModel',
    '../views/EbDeviceView',
    '../views/EbDeviceDiagnosticsView'
], function (lib, core, EbDeviceStatusModel, EbDeviceView, EbDeviceDiagnosticsView) {
    'use strict';

    var config = {
        UPDATER_INTERVAL: 1500
    };

    return Marionette.Controller.extend({
        initialize: function (options) {
            this.bindReqres();
            this.createModel();
            this.createView();
            this.__updateStatus().then(function () {
                this.view.displayData();
                this.view.setLoading(false);
                this.__startBackgroundUpdater();
            }.bind(this));
        },

        createModel: function () {
            this.model = new EbDeviceStatusModel();
        },

        createView: function () {
            this.view = new EbDeviceView({
                model: this.model,
                reqres: this.reqres
            });
            this.diagnosticsView = new EbDeviceDiagnosticsView({
            });
        },

        bindReqres: function () {
            this.reqres = new Backbone.Wreqr.RequestResponse();

            this.reqres.setHandler('logging:start', this.__startLogging, this);
            this.reqres.setHandler('logging:stop', this.__stopLogging, this);
            this.reqres.setHandler('standBy', this.__setStandBy, this);
            this.reqres.setHandler('deviceTime:fix', this.__fixDeviceTime, this);
            this.reqres.setHandler('device:update', this.__forceDeviceUpdate, this);
            this.reqres.setHandler('range:set', this.__setRange, this);
        },

        onDestroy: function () {
            this.isDestroyed = true;
        },

        __startBackgroundUpdater: function () {
            setTimeout(function () {
                this.view.setDataUpdating(true);
                var commandSendLock = this.commandSendLock;
                this.__updateStatus().finally(function () {
                    if (!this.isDestroyed) {
                        this.view.setDataUpdating(false);
                        var triggeredWhileQuery = !commandSendLock && this.commandSendLock;
                        if (this.model.get('commandQueueSize') > 0 || triggeredWhileQuery) {
                            // lock everything until queue is empty
                            this.view.setEnabled(false);
                            this.commandSendLock = false;
                        } else {
                            // unlock if queue is empty
                            this.view.setEnabled(true);
                        }
                        this.__startBackgroundUpdater();
                    }
                }.bind(this));
            }.bind(this), config.UPDATER_INTERVAL);
        },

        __updateStatus: function () {
            return Promise.resolve(this.model.fetch());
        },

        __startLogging: function (samplingIntervalMs) {
            return this.__sendCommand({
                command: 'run',
                intervalMilliseconds: samplingIntervalMs
            });
        },

        __stopLogging: function () {
            return this.__sendCommand({
                command: 'stop'
            });
        },

        __setStandBy: function (enabled) {
            return this.__sendCommand({
                command: 'set-device-stand-by',
                standBy: enabled
            });
        },

        __fixDeviceTime: function () {
            return this.__sendCommand({
                command: 'set-device-time',
                time: Math.floor(Number(new Date()) / 1000)
            });
        },

        __setRange: function (center) {
            return this.__sendCommand({
                command: 'set-device-range',
                range: center
            });
        },

        __forceDeviceUpdate: function () {
            return this.__sendCommand({
                command: 'update-status'
            });
        },

        __sendCommand: function (data) {
            this.commandSendLock = true;
            this.view.setEnabled(false);
            return core.services.AjaxService.post('api/dashboard/eb-device/command', data);
        }
    });
});
