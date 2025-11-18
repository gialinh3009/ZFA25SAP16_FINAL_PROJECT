sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'project1/test/integration/FirstJourney',
		'project1/test/integration/pages/ZC_SD_AllDoc_HList',
		'project1/test/integration/pages/ZC_SD_AllDoc_HObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_SD_AllDoc_HList, ZC_SD_AllDoc_HObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('project1') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_SD_AllDoc_HList: ZC_SD_AllDoc_HList,
					onTheZC_SD_AllDoc_HObjectPage: ZC_SD_AllDoc_HObjectPage
                }
            },
            opaJourney.run
        );
    }
);