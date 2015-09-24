// ***********************************************************************
// <author>Stephan Burguchev</author>
// <copyright company="Stephan Burguchev">
//   Copyright (c) Stephan Burguchev 2012-2015. All rights reserved.
// </copyright>
// <summary>
//   RunnerData.h
// </summary>
// ***********************************************************************

#pragma once

#include "EbDevice.h"

namespace core
{
    struct EbDeviceStatus
    {
        SMART_PTR_T(EbDeviceStatus);

        EbDevice::RangeData range;
        QString enq;
        QString about;
        QDateTime time;
    };

    struct RunnerStatus : EbDeviceStatus
    {
        SMART_PTR_T(RunnerStatus);

        RunnerStatus()
        {
            standBy = false;
            isRunning = false;
            samplingIntervalMs = 0;
        }

        QDateTime timeUpdated;
        QDateTime updated;
        bool standBy;
        bool isRunning;
        int samplingIntervalMs;
    };

    struct RunnerConfig
    {
        int webServerPort;
        QString devicePortName;
        QString msRecordLocation;
        QString msRecordNetwork;
        QString msRecordStation;
        QString msFileName;
        int samplesCacheMaxSize;
        bool skipDiagnostics;
    };
}
