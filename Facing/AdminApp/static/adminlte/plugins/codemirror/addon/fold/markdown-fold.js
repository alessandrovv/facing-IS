ways] StaleJobTime=60000 msecs
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] StaleJobPollTime=10000 msecs
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] JobMonitorPollTime=500 msecs
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] RTermArgs=--slave --no-restore --no-save
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] RScript=library(RevoScaleR); sqlSatelliteCall <- function() { rxSqlUpdateLibPaths(); resultList <- .Call("RxSqlSatelliteCall", %s); }; sqlSatelliteCall();
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] RPoolScript=library(RevoScaleR); rxSqlUpdateLibPaths(); sessionDirectory <- '%s'; sessionId <- '%s'; scriptFile <- file.path(sessionDirectory, paste(sessionId, '.R', sep='')); rxIgnoreCallResult <- .Call('RxSqlSessionStart', list(sessionDirectory=sessionDirectory, sessionId=sessionId, waitTime=-1));source(scriptFile)
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] UserPoolSize=65535
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] ProcessPoolingEnabled=1
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] ProcessRecycleEnabled=0
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] StaleProcessTime=300000 msecs
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] StaleProcessPollTime=60000 msecs
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] TelemetryFlushInterval=300000
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] ProcessPoolSqlSatelliteGrowth=5
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] ProcessPoolRxJobGrowth=3
[2022-05-16 18:05:12.927][00000BCC][00000BD0][Always] LaunchpadSecuri