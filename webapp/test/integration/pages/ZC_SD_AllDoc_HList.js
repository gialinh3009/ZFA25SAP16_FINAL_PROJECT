sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'project1',
            componentId: 'ZC_SD_AllDoc_HList',
            contextPath: '/ZC_SD_AllDoc_H'
        },
        CustomPageDefinitions
    );
});