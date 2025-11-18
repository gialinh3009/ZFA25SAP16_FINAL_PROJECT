sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'project1',
            componentId: 'ZC_SD_AllDoc_HObjectPage',
            contextPath: '/ZC_SD_AllDoc_H'
        },
        CustomPageDefinitions
    );
});