const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('file:///c:/Users/bauti/.gemini/antigravity/scratch/lensique-web/public/asesor_zeiss.html');
  
  // Wait for load
  await page.waitForTimeout(1000);
  
  // Navigate to step 3 (where rxBlock is)
  console.log('Clicking to get to step 3...');
  // pick('type', 'mono') -> this should go to step 2? Wait, the UI has steps? 
  // No, the UI renders all steps in stageBody but some might be hidden or just one long scroll?
  // Let's check how many buttons there are.
  
  // Let's just evaluate toggleRxGuide directly to see what it does.
  await page.evaluate(() => {
    console.log("Initial ST.rxGuide:", ST.rxGuide);
    var btn = document.querySelector('button[onclick="toggleRxGuide()"]');
    if (btn) {
      console.log("Button found. Clicking it.");
      btn.click();
    } else {
      console.log("Button NOT found. Manually calling toggleRxGuide()");
      toggleRxGuide();
    }
    console.log("After ST.rxGuide:", ST.rxGuide);
    var w = document.getElementById("rxGuideWrapper");
    if(w) console.log("Wrapper display is:", w.style.display);
    else console.log("Wrapper NOT found");
  });
  
  await browser.close();
})();
