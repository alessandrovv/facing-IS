d. Source provider: LocalFileSettingsProvider. Value: 12000. Default: 12000 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [NumberOfAttemptsBeforeDeadConnectionDeclared] has been initialized. Source provider: LocalFileSettingsProvider. Value: 5. Default: 5 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [MaximumConcurrentDmsQueries] has been initialized. Source provider: LocalFileSettingsProvider. Value: 32. Default: 32 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [StatusTimer] has been initialized. Source provider: LocalFileSettingsProvider. Value: 10000. Default: 10000 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DmsBufferPoolSize] has been initialized. Source provider: LocalFileSettingsProvider. Value: 0. Default: 0 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DmsBufferSizeBytes] has been initialized. Source provider: LocalFileSettingsProvider. Value: 32768. Default: 32768 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DmsBufferInitialAllocation] has been initialized. Source provider: LocalFileSettingsProvider. Value: 100. Default: 100 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DmsCommandChannelConfigTimeout] has been initialized. Source provider: LocalFileSettingsProvider. Value: 300. Default: 300 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DmsDataChannelReceiverBufferSizeBytes] has been initialized. Source provider: LocalFileSettingsProvider. Value: 10240. Default: 10240 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DmsReaderCacheScalingFactor] has been initialized. Source provider: LocalFileSettingsProvider. Value: 2. Default: 2 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [ConverterBufferPoolSize] has been initialized. Source provider: LocalFileSettingsProvider. Value: 0. Default: 0 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [ConverterBufferSizeBytes] has been initialized. Source provider: LocalFileSettingsProvider. Value: 262144. Default: 262144 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [ConverterBufferInitialAllocation] has been initialized. Source provider: LocalFileSettingsProvider. Value: 50. Default: 50 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [ConverterScalingFactor] has been initialized. Source provider: LocalFileSettingsProvider. Value: 3. Default: 3 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [ConverterQueueSize] has been initialized. Source provider: LocalFileSettingsProvider. Value: 12. Default: 12 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DistributorBufferPoolSize] has been initialized. Source provider: LocalFileSettingsProvider. Value: 0. Default: 0 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DistributorBufferSizeBytes] has been initialized. Source provider: LocalFileSettingsProvider. Value: 262144. Default: 262144 
15/06/2022 17:14:40 [Thread:6012] [AppConfigPropertyResolver:InformationEvent] (Info, Normal): Configuration property [DistributorBufferInitialAllocation] has been initialized. Source provider:        return lastWeekDays[this.day()];
            },
            sameElse: 'L',
        },
        relativeTime: {
            future: 'за %s',
            past: 'пре %s',
            s: 'неколико секунди',
            ss: translator.translate,
            m: translator.translate,
            mm: translator.translate,
            h: translator.translate,
            hh: translator.translate,
            d: 'дан',
            dd: translator.translate,
            M: 'месец',
            MM: translator.translate,
            y: 'годину',
            yy: translator.translate,
        },
        dayOfMonthOrdinalParse: /\d{1,2}\./,
        ordinal: '%d.',
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 7, // The week that contains Jan 1st is the first week of the year.
        },
    });

    return srCyrl;

})));
