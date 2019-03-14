const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const chromiumPath = 'C:\\Users\\asifm\\AppData\\Local\\Chromium\\Application\\chrome.exe';
const siteAddress = 'https://mahaulbservices.online/MainetService/Home.html';

const { loginInfo } = require('./login')

const {
  propertiesData
} = require('./multiplefloors');


fillData()
  .then(done => console.log('DONE', done))
  .catch(error => console.log('Error', error));

function fillData() {
  return new Promise(async (resolve, reject) => {
    try {
      // Login Screen

      const browser = await puppeteer.launch({
        headless: false,
        executablePath: chromiumPath,
      });
      const page = await browser.newPage();
      await page.goto(siteAddress, {
        timeout: 0,
        waitUntil: 'load',
      });
      await page.waitForSelector('.login-input:first-of-type');
      await page.focus('.login-input:first-of-type');
      await page.type('.login-input:first-of-type', loginInfo.user);
      await page.waitForSelector('input[type="password"]');
      await page.focus('input[type="password"]');
      await page.type('input[type="password"]', loginInfo.password);
      await page.waitForSelector('#selectedDistrict');
      await page.focus('#selectedDistrict');
      await page.select('#selectedDistrict', loginInfo.district);
      // await page.waitFor(5000)
      // await page.click('#selectedLocation + .chosen-container');
      // await page.type('#selectedLocation + .chosen-container', 'Head Office');
      // await page.keyboard.press('Enter');
      await Promise.all([
        page.waitForNavigation({
          timeout: 0,
          waitUntil: 'load',
        }),
        page.click('input[value="Submit"]'),
      ]);

      // Navigation to Add entry page

      await page.waitForSelector('.button-menu-mobile.open-left');
      await page.click('.button-menu-mobile.open-left');
      await page.waitForSelector('.has_sub.active.submenu');
      await page.click('.has_sub.active.submenu');
      await page.waitForSelector('.navigation.has_sub.active.submenu[id="124"]');
      await page.click('.navigation.has_sub.active.submenu[id="124"]');
      await page.waitForSelector('.folder[id="126"]');
      await Promise.all([
        page.waitForNavigation({
          timeout: 0,
          waitUntil: 'load',
        }),
        page.click('.folder[id="126"]'),
      ]);
      await page.waitForSelector('#serchBtn + button');
      // await Promise.all([
      // page.waitForNavigation({ timeout: 0, waitUntil: 'load' }),
      await page.click('#serchBtn + button'),
      // ]);

      // Form Filling
      propertiesData.forEach(async (data, index) => {
        await page.waitForSelector('#ownerTypeId');
        await page.select('#ownerTypeId', data.ownershiptype);

        await page.waitForSelector('#assoOwnerName');
        await page.type('#assoOwnerName', data.ownername);

        await page.waitForSelector('#ownerGender_');
        await page.select('#ownerGender_', data.ownergender);

        await page.waitForSelector('#ownerRelation_');
        await page.select('#ownerRelation_', data.ownerrelation);

        await page.waitForSelector('#assoGuardianName');
        await page.type('#assoGuardianName', data.ownerguardianname);

        await page.waitForSelector('#assoMobileno');
        await page.type('#assoMobileno', data.ownermobilenumber);

        await page.waitForSelector('#emailId');
        await page.type('#emailId', data.owneremailaddress);

        await page.waitForSelector('#assoAddharno');
        await page.type('#assoAddharno', data.owneraadharno);

        await page.waitForSelector('#pannumber');
        await page.type('#pannumber', data.ownerpanno);

        await page.waitForSelector('#assOldpropno');
        await page.type('#assOldpropno', data.oldpropertyno);

        await page.waitForSelector('#assAddress');
        await page.type('#assAddress', data.propertyaddress);

        await page.waitForSelector('#assPincode');
        await page.type('#assPincode', data.pincode);

        await page.waitForSelector('#assWard1');
        await page.select('#assWard1', data.ward);

        await page.waitForSelector('#propLvlRoadType');
        await page.select('#propLvlRoadType', data.roadtype);

        await page.evaluate((dateofacq) => {
          document.querySelector('#proAssAcqDate').value = dateofacq;
        }, data.dateofacquisition);

        await page.waitForSelector('#totalplot');
        await page.type('#totalplot', data.totalarea);


        await page.waitForSelector(`input[id="${data.rebateapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[0]"]`);
        await page.click(`input[id="${data.rebateapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[0]"]`);
        
        if (await page.$(`input[id="${data.rebateapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[1]"]`) !== null) {
          await page.click(`input[id="${data.rebateapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[1]"]`)
        }
        // await page.waitForSelector(`input[id="${data.rebateapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[1]"]`);

        await page.click('#taxCollEmp_chosen');
        await page.type('#taxCollEmp_chosen', data.taxcollector);
        await page.keyboard.press('Enter');

        if (data.rebateapplicable == 'Yes' && data.rebates.length > 0) {
          for (let index = 0; index < data.rebates.length; index++) {
            if (index != 0) {
              await page.click('.unitSpecificAdd');
            }

            await page.waitForSelector(`#unitNoFact${index}`);
            await page.select(`#unitNoFact${index}`, data.rebates[index].unitno);

            await page.waitForSelector(`#assfFactorValueId${index}`);
            await page.select(`#assfFactorValueId${index}`, data.rebates[index].factorvalue);
          }
        }

        let assdFloorNo = '#assdFloorNo';
        let assdConstruType = '#assdConstruType';
        let assdUsagetype = '#assdUsagetype1';
        let assdOccupancyType = '#assdOccupancyType';
        let occupierName = '#occupierName';
        let assdNatureOfproperty = '#assdNatureOfproperty1';
        let assdNatureOfpropertySub = '#assdNatureOfproperty2';
        for (let index = 0; index < data.floors.length; index++) {
          if (index != 0) {
            await page.click('.addCF');
            assdFloorNo = `#assdFloorNo${index}`;
            assdConstruType = `#assdConstruType${index}`;
            assdUsagetype = `#assdUsagetype${index * 6}`;
            assdOccupancyType = `#assdOccupancyType${index}`;
            occupierName = `#occupierName${index}`;
            assdNatureOfproperty = `#natureOfProperty${index * 6}`;
            assdNatureOfpropertySub = `#natureOfProperty${(index * 6) + 1}`;
          }
          await page.waitForSelector(`#year${index}`);
          await page.select(`#year${index}`, data.floors[index].year);

          await page.waitForSelector(assdFloorNo);
          await page.select(assdFloorNo, data.floors[index].floorno);

          const yearOfConstruc = `#yearOfConstruc${index}`;
          await page.evaluate((date, yoc) => {
            document.querySelector(yoc).value = date;
          }, data.floors[index].date, yearOfConstruc);

          await page.waitForSelector(assdConstruType);
          await page.select(assdConstruType, data.floors[index].construction);

          await page.waitForSelector(assdUsagetype);
          await page.select(assdUsagetype, data.floors[index].type);

          await page.waitForSelector(`#taxableArea${index}`);
          await page.type(`#taxableArea${index}`, data.floors[index].area);

          await page.waitForSelector(assdOccupancyType);
          await page.select(assdOccupancyType, data.floors[index].occupancytype);

          await page.waitForSelector(occupierName);
          await page.type(occupierName, data.floors[index].occupiername);

          await page.waitForSelector(assdNatureOfproperty);
          await page.select(assdNatureOfproperty, data.floors[index].propertytype);

          // await page.waitForSelector(`${assdNatureOfpropertySub} option[value="${data.floors[index].propertysubtype}"]`);
          await page.select(assdNatureOfpropertySub, data.floors[index].propertysubtype);
        }

        await page.waitForSelector('#arrearEntry');
        await page.click('#arrearEntry');

        await page.waitForSelector(`#financialYear`);
        await page.select(`#financialYear`, data.financialyear);

        // await Promise.all([
          // page.waitForNavigation({
            // timeout: 0,
            // waitUntil: 'load',
          // }),
          await page.waitForSelector('#billList')
          await page.click('#billList')
        // ]);

        if (data.consolidatedtax !== '0') {
          await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`)
          await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`)
          await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`, data.consolidatedtax)
        }

        // if (data. !== '0') {
          // await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`)
          // await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`)
          // await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`, data.consolidatedtax)
        // }

        resolve('done');
      });
    } catch (error) {
      reject(error);
    }
  });
}
