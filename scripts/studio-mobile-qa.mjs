/**
 * Real browser QA for the public (unauthenticated) ConnectPixel Studio login.
 * No credentials sent or stored. Screenshots are GitHub Actions artifacts.
 *
 * npm install --no-save playwright
 * npx playwright install chromium
 * node scripts/studio-mobile-qa.mjs
 */
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const base='https://connectpixel-studio-staging.mktdigital663.workers.dev/admin/';
const dir='artifacts/studio-mobile-qa';
await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const report=[];
let failed=false;

for(const [width,height,device] of [[320,568,'compact'],[375,667,'iphone-se'],[390,844,'iphone'],[768,1024,'tablet'],[1440,900,'desktop']]) {
  const page=await browser.newPage({
    viewport:{width,height},
    deviceScaleFactor:1,
    isMobile:width<=768,
    hasTouch:width<=768,
    colorScheme:'dark'
  });
  try {
    const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:35000});
    assert.equal(response?.status(),200,'login must load');
    await page.waitForSelector('#studioLoginForm',{state:'visible',timeout:10000});
    await page.evaluate(()=>document.fonts?.ready?.catch(()=>{}));
    const data=await page.evaluate(()=>{
      const visible=el=>{if(!el)return false;const c=getComputedStyle(el);const r=el.getBoundingClientRect();return c.display!=='none'&&c.visibility!=='hidden'&&r.width>0&&r.height>0};
      const form=document.getElementById('studioLoginForm');
      const username=document.getElementById('loginUsername');
      const password=document.getElementById('loginToken');
      const button=document.getElementById('loginBtn');
      const brand=document.querySelector('.login-mobile-brand');
      const story=document.querySelector('.login-story');
      const scroller=document.scrollingElement;
      return {
        screenWidth:window.innerWidth,
        horizontalOverflow:scroller.scrollWidth-window.innerWidth,
        visibleBrand:visible(brand),
        visibleStory:visible(story),
        visibleUsername:visible(username),
        visiblePassword:visible(password),
        visibleButton:visible(button),
        visibleForm:visible(form),
        fields:[username,password,button].map(el=>{
          const r=el.getBoundingClientRect();
          return {left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),height:Math.round(r.height)};
        }),
        duplicateEmblems:[...document.querySelectorAll('.login-emblem')].filter(visible).length,
        visibleBrandImages:[...document.querySelectorAll('.login-mobile-brand img, .studio-product-lockup img')].filter(visible).length
      };
    });
    assert.ok(data.horizontalOverflow<=2, 'No horizontal overflow: '+JSON.stringify(data));
    assert.ok(data.visibleUsername&&data.visiblePassword&&data.visibleButton&&data.visibleForm,'Both fields and button visible');
    assert.equal(data.visibleBrandImages,1,'Exactly one visible login brand');
    assert.equal(data.duplicateEmblems,0,'No second emblem');
    if(width<=768) {
      assert.equal(data.visibleBrand,true,'Mobile brand must appear');
      assert.equal(data.visibleStory,false,'Mobile must hide decorative desktop hero');
    } else {
      assert.equal(data.visibleStory,true,'Desktop story panel should appear');
    }
    for(const field of data.fields){
      assert.ok(field.left>=0&&field.right<=width+3,'Field must remain inside viewport at '+width);
      assert.ok(field.width>=Math.min(width-36,230),'Field must have enough room to type at '+width);
      assert.ok(field.height>=48,'Touch targets at least 48px');
    }
    await page.locator('#studioLoginForm button[type=submit]').click();
    await page.waitForFunction(()=>document.getElementById('loginError').textContent.includes('usuário'),{timeout:3000});
    await page.locator('#loginUsername').fill('qa-example');
    await page.locator('#studioLoginForm button[type=submit]').click();
    await page.waitForFunction(()=>document.getElementById('loginError').textContent.includes('senha'),{timeout:3000});
    await page.locator('#loginToken').fill('sample-not-sent');
    const prior=await page.locator('#loginToken').getAttribute('type');
    await page.locator('#studioPasswordToggle').click();
    assert.equal(prior,'password');
    assert.equal(await page.locator('#loginToken').getAttribute('type'),'text','Eye control reveals password');
    await page.locator('#studioPasswordToggle').click();
    assert.equal(await page.locator('#loginToken').getAttribute('type'),'password','Eye control remasks password');
    await page.locator('#loginToken').fill('');
    await page.locator('#loginUsername').fill('');
    await page.screenshot({path:dir+'/'+width+'x'+height+'-'+device+'.png',fullPage:true,animations:'disabled'});
    report.push({device,width,height,ok:true,...data});
  }catch(e) {
    failed=true;report.push({device,width,height,ok:false,error:String(e)});
    await page.screenshot({path:dir+'/'+width+'x'+height+'-FAILED.png',fullPage:true}).catch(()=>{});
  }finally{await page.close();}
}
await browser.close();
await writeFile(dir+'/report.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report.map(r=>({device:r.device,ok:r.ok,overflow:r.horizontalOverflow,error:r.error})),null,2));
if(failed)process.exitCode=1;
