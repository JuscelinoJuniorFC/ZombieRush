const {app,BrowserWindow,Menu,globalShortcut}=require('electron');
const path=require('path');
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
function make(){
  Menu.setApplicationMenu(null);
  const w=new BrowserWindow({width:1280,height:720,minWidth:640,minHeight:360,backgroundColor:'#040506',title:'Zombie Rush',icon:path.join(__dirname,'icon.png'),autoHideMenuBar:true,
    webPreferences:{autoplayPolicy:'no-user-gesture-required',backgroundThrottling:false}});
  w.loadFile(path.join(__dirname,'index.html'));
  w.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'){
    if(i.key==='F11'){w.setFullScreen(!w.isFullScreen());e.preventDefault()}
    else if(i.key==='Escape'&&w.isFullScreen()){w.setFullScreen(false)}}});
}
app.whenReady().then(make);
app.on('window-all-closed',()=>app.quit());
