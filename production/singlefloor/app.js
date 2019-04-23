const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const exceltojson = require('xlsx-to-json-lc');
const loginInfo = require('./login')
const chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

fillData()
  .then(done => console.log('DONE: ', done))
  .catch(error => console.log('Error: ', error));

function fillData() {
  return new Promise(async (resolve, reject) => {
    try {
      let propertiesData = await excelToJson();
      
      // Login Screen
      const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1366,768'], executablePath: chromePath });
      const page = await browser.newPage();
      await page.setViewport({ width: 1366, height: 768 });

      await page.setRequestInterception(true);

      page.on('request', (req) => {
          if(req.resourceType() === 'image' || req.resourceType() === 'font'){
              req.abort();
          }
          else {
              req.continue();
          }
      });

      await page.goto(loginInfo.siteAddress, { timeout: 0, waitUntil: 'load' });
      
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
        page.waitForNavigation({ timeout: 0, waitUntil: 'load' }),
        page.click('.folder[id="126"]')
      ]);

      // Form Filling
      for (let index = 0; index < propertiesData.length; index++) {
        // Click Add Property Button
        await page.waitFor(10000);
        await page.waitForSelector('#DataEntrySuite > div.text-center.padding-bottom-10 > button.btn.btn-success.btn-submit', { timeout: 0 });
        await page.waitFor(3000);
        const addButton = await page.$('#DataEntrySuite > div.text-center.padding-bottom-10 > button.btn.btn-success.btn-submit');
        await addButton.click();
        console.log(`${ index } - Currently entring data for SN: ${ index + 1 } Owner: ${ propertiesData[index].ownername }`);
        await page.waitFor(3000);

        if (propertiesData[index].ownershiptype != "") {
          await page.waitForSelector('#ownerTypeId', { timeout: 0 });
          await page.select('#ownerTypeId', propertiesData[index].ownershiptype);
          await page.waitFor(3000);
        }

        if (propertiesData[index].ownername != "") {
          await page.waitForSelector('#assoOwnerName');
          await page.type('#assoOwnerName', propertiesData[index].ownername);
        }

        if (propertiesData[index].ownergender != "") {
          await page.waitForSelector('#ownerGender_');
          await page.select('#ownerGender_', propertiesData[index].ownergender);
        }

        if (propertiesData[index].ownerrelation != "") {
          await page.waitForSelector('#ownerRelation_');
          await page.select('#ownerRelation_', propertiesData[index].ownerrelation);
        }

        if (propertiesData[index].ownerguardianname != "") {
          await page.waitForSelector('#assoGuardianName');
          await page.type('#assoGuardianName', propertiesData[index].ownerguardianname);
        }

        if (propertiesData[index].ownermobilenumber != "") {
          await page.waitForSelector('#assoMobileno');
          await page.type('#assoMobileno', propertiesData[index].ownermobilenumber);
        }

        if (propertiesData[index].owneremailaddress != "") {
          await page.waitForSelector('#emailId');
          await page.type('#emailId', propertiesData[index].owneremailaddress);
        }

        if (propertiesData[index].owneraadharno != "") {
          await page.waitForSelector('#assoAddharno');
          await page.type('#assoAddharno', propertiesData[index].owneraadharno);
        }

        if (propertiesData[index].ownerpanno != "") {
          await page.waitForSelector('#pannumber');
          await page.type('#pannumber', propertiesData[index].ownerpanno);
        }

        if (propertiesData[index].oldpropertyno != "") {
          await page.waitForSelector('#assOldpropno');
          await page.type('#assOldpropno', propertiesData[index].oldpropertyno);
        }

        if (propertiesData[index].propertyaddress != "") {
          await page.waitForSelector('#assAddress');
          await page.type('#assAddress', propertiesData[index].propertyaddress);
        }

        if (propertiesData[index].pincode != "") {
          await page.waitForSelector('#assPincode');
          await page.type('#assPincode', propertiesData[index].pincode);
        }

        if (propertiesData[index].ward != "") {
          await page.waitForSelector('#assWard1');
          await page.select('#assWard1', propertiesData[index].ward);
        }

        if (propertiesData[index].roadtype != "") {
          await page.waitForSelector('#propLvlRoadType');
          await page.select('#propLvlRoadType', propertiesData[index].roadtype);
        }

        if (propertiesData[index].dateofacquisition != "") {
          await page.evaluate((dateofacq) => {
            document.querySelector('#proAssAcqDate').value = dateofacq;
          }, propertiesData[index].dateofacquisition);
        }

        if (propertiesData[index].totalarea != "") {
          if (propertiesData[index].totalarea == "0") propertiesData[index].totalarea = "1";
          await page.waitForSelector('#totalplot');
          await page.type('#totalplot', propertiesData[index].totalarea);
        }

        if (await page.$(`input[id="${propertiesData[index].rebateapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[0]"]`) !== null) {
          if (propertiesData[index].rebateapplicable != "") {
            await page.click(`input[id="${propertiesData[index].rebateapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[0]"]`)
          }
        }

        if (await page.$(`input[id="${propertiesData[index].zoneapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[1]"]`) !== null) {
          if (propertiesData[index].zoneapplicable != "") {
            await page.click(`input[id="${propertiesData[index].zoneapplicable}"][name="provisionalAssesmentMstDto.proAssfactor[1]"]`)
          }
        }

        if (propertiesData[index].taxcollector != "") {
          await page.click('#taxCollEmp_chosen');
          await page.type('#taxCollEmp_chosen', propertiesData[index].taxcollector);
          await page.keyboard.press('Enter');
        }

        if (propertiesData[index].flooryear != "") {
          await page.waitForSelector(`#year0`);
          await page.select(`#year0`, propertiesData[index].flooryear);
        }

        if (propertiesData[index].floorfloorno != "") {
          await page.waitForSelector('#assdFloorNo');
          await page.select('#assdFloorNo', propertiesData[index].floorfloorno);
        }

        if (propertiesData[index].floordate != "") {
          await page.evaluate((date) => {
            document.querySelector('#yearOfConstruc0').value = date;
          }, propertiesData[index].floordate);
        }

        if (propertiesData[index].floorconstruction != "") {
          await page.waitForSelector('#assdConstruType');
          await page.select('#assdConstruType', propertiesData[index].floorconstruction);
        }

        if (propertiesData[index].floortype != "") {
          await page.waitForSelector('#assdUsagetype1');
          await page.select('#assdUsagetype1', propertiesData[index].floortype);
        }

        if (propertiesData[index].floorarea != "") {
          if (propertiesData[index].floorarea == "0" ) {
            propertiesData[index].floorarea = "1";
          }
          await page.waitForSelector('#taxableArea0');
          await page.type('#taxableArea0', propertiesData[index].floorarea);
        }

        if (propertiesData[index].flooroccupancytype != "") {
          await page.waitForSelector('#assdOccupancyType');
          await page.select('#assdOccupancyType', propertiesData[index].flooroccupancytype);
        }

        if (propertiesData[index].flooroccupiername != "") {
          await page.waitForSelector('#occupierName');
          await page.type('#occupierName', propertiesData[index].flooroccupiername);
        }

        if (propertiesData[index].floorpropertytype != "") {
          await page.waitForSelector('#assdNatureOfproperty1');
          await page.select('#assdNatureOfproperty1', propertiesData[index].floorpropertytype);
        }

        if (propertiesData[index].floorpropertysubtype != "") {
          await page.waitForSelector('#assdNatureOfproperty2');
          await page.select('#assdNatureOfproperty2', propertiesData[index].floorpropertysubtype);
        }

        await page.waitForSelector('#arrearEntry');
        await page.click('#arrearEntry');
        await page.waitFor(3000);

        await page.waitForSelector(`#financialYear`);
        await page.select(`#financialYear`, propertiesData[index].financialyear);

        await page.waitForSelector('#billList');
        await page.click('#billList');
        await page.waitFor(3000);

        if (propertiesData[index].financialyear == '554') {
          // Entries for 2017 - 2018
          if (propertiesData[index].consolidatedtax1718 !== '0' && propertiesData[index].consolidatedtax1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[0].bdCsmp"]`, propertiesData[index].consolidatedtax1718)
          }

          if (propertiesData[index].treetax1718 !== '0' && propertiesData[index].treetax1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[1].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[1].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[1].bdCsmp"]`, propertiesData[index].treetax1718)
          }

          if (propertiesData[index].educationcess1718 !== '0' && propertiesData[index].educationcess1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[2].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[2].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[2].bdCsmp"]`, propertiesData[index].educationcess1718)
          }

          if (propertiesData[index].employementguaranteecesstax1718 !== '0' && propertiesData[index].employementguaranteecesstax1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[3].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[3].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[3].bdCsmp"]`, propertiesData[index].employementguaranteecesstax1718)
          }

          if (propertiesData[index].firetax1718 !== '0' && propertiesData[index].firetax1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[4].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[4].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[4].bdCsmp"]`, propertiesData[index].firetax1718)
          }

          if (propertiesData[index].swachatakar1718 !== '0' && propertiesData[index].swachatakar1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[5].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[5].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[5].bdCsmp"]`, propertiesData[index].swachatakar1718)
          }

          if (propertiesData[index].watertreatmentandhealthcaretax1718 !== '0' && propertiesData[index].watertreatmentandhealthcaretax1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[6].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[6].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[6].bdCsmp"]`, propertiesData[index].watertreatmentandhealthcaretax1718)
          }

          if (propertiesData[index].electricitytax1718 !== '0' && propertiesData[index].electricitytax1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[7].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[7].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[7].bdCsmp"]`, propertiesData[index].electricitytax1718)
          }

          if (propertiesData[index].specialeducationtax1718 !== '0' && propertiesData[index].specialeducationtax1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[8].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[8].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[8].bdCsmp"]`, propertiesData[index].specialeducationtax1718)
          }

          if (propertiesData[index].interest1718 !== '0' && propertiesData[index].interest1718 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[0].tbWtBillDet[9].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[0].tbWtBillDet[9].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[0].tbWtBillDet[9].bdCsmp"]`, propertiesData[index].interest1718)
          }

          // Entries for 2018 - 2019
          if (propertiesData[index].consolidatedtax1819 !== '0' && propertiesData[index].consolidatedtax1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[0].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[0].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[0].bdCsmp"]`, propertiesData[index].consolidatedtax1819)
          }

          if (propertiesData[index].treetax1819 !== '0' && propertiesData[index].treetax1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[1].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[1].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[1].bdCsmp"]`, propertiesData[index].treetax1819)
          }

          if (propertiesData[index].educationcess1819 !== '0' && propertiesData[index].educationcess1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[2].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[2].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[2].bdCsmp"]`, propertiesData[index].educationcess1819)
          }

          if (propertiesData[index].employementguaranteecesstax1819 !== '0' && propertiesData[index].employementguaranteecesstax1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[3].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[3].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[3].bdCsmp"]`, propertiesData[index].employementguaranteecesstax1819)
          }

          if (propertiesData[index].firetax1819 !== '0' && propertiesData[index].firetax1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[4].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[4].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[4].bdCsmp"]`, propertiesData[index].firetax1819)
          }

          if (propertiesData[index].swachatakar1819 !== '0' && propertiesData[index].swachatakar1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[5].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[5].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[5].bdCsmp"]`, propertiesData[index].swachatakar1819)
          }

          if (propertiesData[index].watertreatmentandhealthcaretax1819 !== '0' && propertiesData[index].watertreatmentandhealthcaretax1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[6].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[6].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[6].bdCsmp"]`, propertiesData[index].watertreatmentandhealthcaretax1819)
          }

          if (propertiesData[index].electricitytax1819 !== '0' && propertiesData[index].electricitytax1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[7].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[7].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[7].bdCsmp"]`, propertiesData[index].electricitytax1819)
          }

          if (propertiesData[index].specialeducationtax1819 !== '0' && propertiesData[index].specialeducationtax1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[8].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[8].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[8].bdCsmp"]`, propertiesData[index].specialeducationtax1819)
          }

          if (propertiesData[index].interest1819 !== '0' && propertiesData[index].interest1819 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[1].tbWtBillDet[9].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[1].tbWtBillDet[9].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[1].tbWtBillDet[9].bdCsmp"]`, propertiesData[index].interest1819)
          }

          
          // Entries for 2019 - 2020
          if (propertiesData[index].consolidatedtax1920 !== '0' && propertiesData[index].consolidatedtax1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[0].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[0].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[0].bdCsmp"]`, propertiesData[index].consolidatedtax1920)
          }

          if (propertiesData[index].treetax1920 !== '0' && propertiesData[index].treetax1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[1].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[1].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[1].bdCsmp"]`, propertiesData[index].treetax1920)
          }

          if (propertiesData[index].educationcess1920 !== '0' && propertiesData[index].educationcess1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[2].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[2].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[2].bdCsmp"]`, propertiesData[index].educationcess1920)
          }

          if (propertiesData[index].employementguaranteecesstax1920 !== '0' && propertiesData[index].employementguaranteecesstax1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[3].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[3].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[3].bdCsmp"]`, propertiesData[index].employementguaranteecesstax1920)
          }

          if (propertiesData[index].firetax1920 !== '0' && propertiesData[index].firetax1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[4].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[4].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[4].bdCsmp"]`, propertiesData[index].firetax1920)
          }

          if (propertiesData[index].swachatakar1920 !== '0' && propertiesData[index].swachatakar1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[5].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[5].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[5].bdCsmp"]`, propertiesData[index].swachatakar1920)
          }

          if (propertiesData[index].watertreatmentandhealthcaretax1920 !== '0' && propertiesData[index].watertreatmentandhealthcaretax1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[6].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[6].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[6].bdCsmp"]`, propertiesData[index].watertreatmentandhealthcaretax1920)
          }

          if (propertiesData[index].electricitytax1920 !== '0' && propertiesData[index].electricitytax1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[7].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[7].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[7].bdCsmp"]`, propertiesData[index].electricitytax1920)
          }

          if (propertiesData[index].specialeducationtax1920 !== '0' && propertiesData[index].specialeducationtax1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[8].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[8].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[8].bdCsmp"]`, propertiesData[index].specialeducationtax1920)
          }

          if (propertiesData[index].interest1920 !== '0' && propertiesData[index].interest1920 !== '') {
            await page.waitForSelector(`input[id="areear0"][name="billMasList[2].tbWtBillDet[9].bdCsmp"]`)
            await page.focus(`input[id="areear0"][name="billMasList[2].tbWtBillDet[9].bdCsmp"]`)
            await page.type(`input[id="areear0"][name="billMasList[2].tbWtBillDet[9].bdCsmp"]`, propertiesData[index].interest1920)
          }
        }

        // await Promise.all([
          // page.waitForNavigation({ waitUntil: 'load' }),
          // page.click('#nextView')
        // ])
        
        await page.waitForSelector('#nextView');
        await page.click('#nextView');
        await page.waitFor(3000);

        await page.waitForSelector('button#submit');
        await page.click('button#submit');
        
        console.log(`${ index } - Data entered for SN: ${ index + 1 } Owner: ${ propertiesData[index].ownername }`);

        await page.waitFor(3000);
        // await Promise.all([
          // page.waitForNavigation({ waitUntil: 'load' }),
        await page.waitForSelector('input#btnNo'),
        await page.click('input#btnNo')
        // ]);

      }
      await browser.close();
      resolve('All entries submitted...');
    } catch (error) {
      reject(error);
    }
  });
}

function excelToJson() {
  return new Promise((resolve, reject) => {
    try {
      exceltojson({
        input: 'datasample.xlsx',
        output: 'datasample.json',
        sheet: "Sheet1"
      }, function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      reject(error)
    }
  })

}