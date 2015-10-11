/**
 * Developer: Stepan Burguchev
 * Date: 10/5/2015
 * Copyright: 2009-2015 Comindware®
 *       All Rights Reserved
 *
 * THIS IS UNPUBLISHED PROPRIETARY SOURCE CODE OF Comindware
 *       The copyright notice above does not evidence any
 *       actual or intended publication of such source code.
 */

/* global define, require, Handlebars, Backbone, Marionette, $, _, Localizer */

define([
    'lib',
    'core',
    'text!../templates/ebDevice.html'
], function (lib, core, template) {
    'use strict';

    var classes = {
        DATA_UPDATE_SPINNER_VISIBLE: 'eb-device__data-update-spinner_visible'
    };

    return Marionette.ItemView.extend({
        initialize: function (options) {
            core.utils.helpers.ensureOption(options, 'model');
            core.utils.helpers.ensureOption(options, 'reqres');

            this.reqres = options.reqres;
        },

        modelEvents: {
            'change': '__onDataChange'
        },

        template: Handlebars.compile(template),

        templateHelpers: function () {
            var range60 = [ 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50 ];
            var range24 = [ 1, 2, 3, 4, 5, 6, 12, 24 ];
            var optionMs = function (hz, ms) {
                return {
                    name: core.utils.helpers.format('{1}ms ({0}Hz)', hz, ms),
                    value: ms
                };
            };

            return {
                samplingIntervalOptions: [
                    {
                        groupName: '< 1 second',
                        options: [
                            optionMs(5, 200),
                            optionMs(4, 250),
                            optionMs(3, 334),
                            optionMs(2, 500)
                        ]
                    },
                    {
                        groupName: 'Seconds',
                        options: _.map(range60, function (sec) {
                            return {
                                name: core.utils.helpers.format('{0} second(s)', sec),
                                value: sec * 1000
                            };
                        })
                    },
                    {
                        groupName: 'Minutes',
                        options: _.map(range60, function (min) {
                            return {
                                name: core.utils.helpers.format('{0} minute(s)', min),
                                value: min * 60 * 1000
                            };
                        })
                    },
                    {
                        groupName: 'Hours',
                        options: _.map(range24, function (hour) {
                            return {
                                name: core.utils.helpers.format('{0} hour(s)', hour),
                                value: hour * 60 * 60 * 1000
                            };
                        })
                    }
                ]
            };
        },

        className: 'panel panel-default',

        ui: {
            dataUpdateSpinner: '.js-data-update-spinner',
            loadingPanel: '.js-loading-panel',
            dataTable: '.js-data-table',
            statusUpdated: '.js-status-updated',
            condStopped: '.js-cond-stopped',
            condRunning: '.js-cond-running',
            fixDeviceTimeButton: '.js-fix-device-time-button',
            condSamplingIntervalRow: '.js-cond-sampling-interval-row',
            statusSamplingIntervalInput: '.js-status-sampling-interval-input',
            statusSamplingInterval: '.js-status-sampling-interval',
            statusStandBy: '.js-status-stand-by',
            statusStandByButton: '.js-status-stand-by-button',
            statusDeviceTime: '.js-status-device-time',
            statusRangeMin: '.js-status-range-min',
            statusRangeMax: '.js-status-range-max',
            statusCenterRangeInput: '.js-status-center-range-input',
            setRangeButton: '.js-set-range-button',
            statusEnq: '.js-status-enq',
            statusAbout: '.js-status-about',
            statusCommandQueue: '.js-status-command-queue',
            startLoggingButton: '.js-start-logging-button',
            stopLoggingButton: '.js-stop-logging-button',
            forceUpdateButton: '.js-force-update-button',
            runDiagnosticsButton: '.js-run-diagnostics-button',
            runAutoTestButton: '.js-run-auto-test-button'
        },

        events: {
            'click @ui.statusStandByButton': '__onToggleStandBy',
            'click @ui.fixDeviceTimeButton': '__onFixDeviceTime',
            'click @ui.setRangeButton': '__onSetRange',
            'click @ui.startLoggingButton': '__onStartLogging',
            'click @ui.stopLoggingButton': '__onStopLogging',
            'click @ui.forceUpdateButton': '__onForceUpdate',
            'click @ui.runDiagnosticsButton': '__onRunDiagnostics',
            'click @ui.runAutoTestButton': '__onRunAutoTest'
        },

        onRender: function () {
            this.ui.dataTable.hide();
            this.ui.statusSamplingIntervalInput.val(1000);
            this.ui.statusSamplingIntervalInput.selectpicker();
        },

        displayData: function () {
            this.ui.dataTable.show();
            this.__updateData();
        },

        setLoading: function (isLoading) {
            if (isLoading) {
                this.ui.loadingPanel.show();
            } else {
                this.ui.loadingPanel.hide();
            }
        },

        __updateData: function () {
            var data = this.model.toJSON();
            
            //noinspection JSUnresolvedVariable
            this.ui.statusSamplingInterval.text(data.samplingIntervalMs);
            if (!this.ui.statusSamplingIntervalInput.val()) {
                //noinspection JSUnresolvedVariable
                this.ui.statusSamplingIntervalInput.text(data.samplingIntervalMs);
            }
            if (data.standBy) {
                this.ui.statusStandBy.text('On');
                this.ui.statusStandByButton.text('Turn off');
            } else {
                this.ui.statusStandBy.text('Off');
                this.ui.statusStandByButton.text('Turn on');
            }
            this.ui.statusDeviceTime.text(moment(data.time).format('lll'));
            //noinspection JSUnresolvedVariable
            this.ui.statusRangeMin.text(data.range.minField);
            //noinspection JSUnresolvedVariable
            this.ui.statusRangeMax.text(data.range.maxField);
            this.ui.statusEnq.text(data.enq);
            //noinspection JSUnresolvedVariable
            this.ui.statusAbout.html(core.utils.htmlHelpers.textToHtml(data.about));
            if (data.isRunning) {
                this.ui.condStopped.show();
                this.ui.condRunning.hide();
                this.ui.condSamplingIntervalRow.show();
            } else {
                this.ui.condStopped.hide();
                this.ui.condRunning.show();
                this.ui.condSamplingIntervalRow.hide();
            }
            //noinspection JSUnresolvedVariable
            this.ui.statusUpdated.text(moment(data.updated).format('lll'));
            //noinspection JSUnresolvedVariable
            this.ui.statusCommandQueue.text(data.commandQueueSize);
        },

        __onRunDiagnostics: function () {
            this.reqres.request('run:diagnostics');
        },

        __onRunAutoTest: function () {
            this.reqres.request('run:autoTest');
        },

        __onDataChange: function () {
            /*var queueSize = this.model.get('commandQueueSize');
            if (queueSize === 0) {
                this.setLoading(false);
            }*/
            this.__updateData();
        },

        setDataUpdating: function (isUpdating) {
            this.ui.dataUpdateSpinner.toggleClass(classes.DATA_UPDATE_SPINNER_VISIBLE, isUpdating);
        },

        setEnabled: function (enabled) {
            this.ui.fixDeviceTimeButton[0].disabled = !enabled;
            this.ui.statusStandByButton[0].disabled = !enabled;
            this.ui.setRangeButton[0].disabled = !enabled;
            this.ui.startLoggingButton[0].disabled = !enabled;
            this.ui.stopLoggingButton[0].disabled = !enabled;
            this.ui.forceUpdateButton[0].disabled = !enabled;
            this.ui.statusCenterRangeInput[0].disabled = !enabled;
            this.ui.statusSamplingIntervalInput[0].disabled = !enabled;
            this.ui.runDiagnosticsButton[0].disabled = !enabled;
            this.ui.runAutoTestButton[0].disabled = !enabled;
        },

        __onToggleStandBy: function () {
            //this.setLoading(true);
            var newValue = !this.model.get('standBy');
            this.reqres.request('standBy', newValue);
        },

        __onFixDeviceTime: function () {
            this.reqres.request('deviceTime:fix');
        },

        __onSetRange: function () {
            var centerValue = Number(this.ui.statusCenterRangeInput.val());
            this.reqres.request('range:set', centerValue);
        },

        __onStartLogging: function () {
            var samplingIntervalMs = Number(this.ui.statusSamplingIntervalInput.val());
            this.reqres.request('logging:start', samplingIntervalMs);
        },

        __onStopLogging: function () {
            this.reqres.request('logging:stop');
        },

        __onForceUpdate: function () {
            this.reqres.request('device:update');
        }
    });
});