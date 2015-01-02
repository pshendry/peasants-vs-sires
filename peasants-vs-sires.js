function resetState(e){e.state.reset({paused:false,audioEnabled:true,availablePeasants:[],availableSires:[],peasantSpawnQueue:[],sireSpawnQueue:[],peasantLosses:0,knightLosses:0,lordLosses:0,kingLosses:0})}window.addEventListener("load",function(e){var t=Quintus({audioPath:"assets/audio/",imagePath:"assets/images/",dataPath:"assets/data/",audioSupported:["mp3","wav"]}).include("Sprites, Scenes, Input, Anim, 2D, Touch, UI, Audio").setup("quintusContainer").touch().enableSound();t.input.keyboardControls({27:"escape",32:"space",81:"peasantHelp",87:"peasantFight",79:"sireHelp",80:"sireFight"});t.gravityX=0;t.gravityY=0;resetState(t);t.input.on("escape",function(){var e=!t.state.get("paused");t.state.set("paused",e);if(e){t.pauseGame()}else{t.unpauseGame()}});t.component("homing",{_toIsoCoords:function(e,t){return{x:.866*e-.5*t,y:.5*e+.866*t}},_chooseFacing:function(e){if(e===null||!e.p){return}var t=this.entity.p;var n=this._toIsoCoords(e.p.x,e.p.y);var r=this._toIsoCoords(t.x,t.y);var i=n.x-r.x;var s=n.y-r.y;var o=Math.abs(i)-Math.abs(s);if(o>0){t.facing=i<0?"front":"back"}else{t.facing=s>0?"left":"right"}if(Math.abs(o)<=t.speed/6){t.commitment=.25}},_findClosest:function(e){if(!e){e=function(){return true}}var t=this.entity.p;var n=this.entity.stage;var r=null;var i=null;for(var s=0;s<n.items.length;s++){var o=n.items[s];if(!e(o)||o===this.entity){continue}var u=o.p.x-t.x;var a=o.p.y-t.y;var f=Math.sqrt(u*u+a*a);if(r===null){r=o;i=f;continue}if(f<i){r=o;i=f}}return r},_acquireTarget:function(){var e=this.entity.p;e.target=this._findClosest(function(t){return e.predicate(t)&&(!t.p.followerCount||t.p.followerCount<e.maxFollowers)});e.retargetCountdown+=e.retargetFreq;if(e.target){if(e.target.followerCount){e.target.followerCount++}else{e.target.followerCount=1}}},_abandonTarget:function(){var e=this.entity.p;if(e.target!==null){e.target.followerCount--}},defaults:{predicate:function(){return true},speed:25,facing:"front",stopDistance:25,restartDistance:30,maxFollowers:5,target:null,retargetFreq:1,retargetCountdown:0,commitment:0,homingActive:false},added:function(){var e=this.entity.p;t._defaults(e,this.defaults);this.entity.on("step",this,"step");e.retargetCountdown=Math.random()*e.retargetFreq},step:function(e){var t=this.entity.p;t.retargetCountdown-=e;if(t.retargetCountdown<=0&&(t.target===null||!t.target.has("combat")||t.target.health<=0||t.retargetCountdown<=0)){this._acquireTarget();t.homingActive=true}if(t.target===null){return}var n=t.target.p.x-t.x;var r=t.target.p.y-t.y;var i=Math.sqrt(n*n+r*r);if(!t.homingActive&&i<t.restartDistance){return}else{t.homingActive=true;this.entity.trigger("homingStarted")}if(i<=t.stopDistance){t.homingActive=false;this.entity.trigger("homingEnded");return}if(t.commitment<=0){this._chooseFacing(t.target)}if(t.facing==="front"){t.x-=e*t.speed;t.y+=e*t.speed/2}else if(t.facing==="left"){t.x+=e*t.speed;t.y+=e*t.speed/2}else if(t.facing==="back"){t.x+=e*t.speed;t.y-=e*t.speed/2}else if(t.facing==="right"){t.x-=e*t.speed;t.y-=e*t.speed/2}t.commitment-=e},destroy:function(){var e=this.entity.p;if(e.target!==null&&e.target.followerCount){e.target.followerCount-=1}this._super()}});t.component("combat",{defaults:{health:10,range:30,attack:4,attackVariance:.25,cooldown:2,cooldownVariance:.25,cooldownCounter:0,attackTarget:null,attackTargetDistance:null},added:function(){var e=this.entity.p;t._defaults(e,this.defaults);this.entity.on("step",this,"step");this.entity.on("attacked",this,"attacked")},step:function(e){var t=this.entity.p;if(t.cooldownCounter>0){t.cooldownCounter-=e}if(t.attackTarget===null||!t.attackTarget.has("combat")||t.attackTargetDistance>t.range){t.attackTarget=this.entity.homing._findClosest(t.predicate);if(t.attackTarget===null){return}var n=t.attackTarget.p.x-t.x;var r=t.attackTarget.p.y-t.y;t.attackTargetDistance=Math.sqrt(n*n+r*r)}if(t.attackTargetDistance<=t.range&&t.cooldownCounter<=0){this.entity.play("striking_"+t.facing)}},attacked:function(e){var n=this.entity.p;if(n.attackTarget&&n.attackTarget.takeDamage){if(t.state.get("audioEnabled")){t.audio.play(n.strikeSound,.1)}n.attackTarget.takeDamage(n.attack*(1+(2*Math.random()-1)*n.attackVariance))}n.cooldownCounter=n.cooldown*(1+(2*Math.random()-1)*n.cooldownVariance)},extend:{takeDamage:function(e){this.p.health-=e;if(this.p.health<=0){if(this.p.team==="peasants"){t.state.inc("peasantLosses",1)}else if(this.p.team==="sires"&&this.p.sheet==="knight"){t.state.inc("knightLosses",1)}else if(this.p.team==="sires"&&this.p.sheet==="lord"){t.state.inc("lordLosses",1)}else if(this.p.team==="sires"&&this.p.sheet==="king"){t.state.inc("kingLosses",1)}this.trigger("dead");this.play("dying_"+this.p.facing);if(t.state.get("audioEnabled")){t.audio.play(this.p.deathSound,.1)}this.del("combat");this.del("homing");this.del("2d");this.p.sensor=true}}}});t.animations("fighter",{idle_front:{frames:[0]},running_front:{frames:[1,0,2,0],rate:1/3},ready_front:{frames:[3]},striking_front:{frames:[3,4],rate:1/6,next:"withdrawing_front",trigger:"attacked"},withdrawing_front:{frames:[4,3],rate:1/6,next:"ready_front"},dying_front:{frames:[5],rate:1/3,next:"dead_front"},dead_front:{frames:[6,7,8],rate:15,loop:false,trigger:"destroy"},idle_left:{frames:[9]},running_left:{frames:[10,9,11,9],rate:1/3},ready_left:{frames:[12]},striking_left:{frames:[12,13],rate:1/6,next:"withdrawing_left",trigger:"attacked"},withdrawing_left:{frames:[13,12],rate:1/6,next:"ready_left"},dying_left:{frames:[14],rate:1/3,next:"dead_left"},dead_left:{frames:[15,16,17],rate:15,loop:false,trigger:"destroy"},idle_back:{frames:[18]},running_back:{frames:[19,18,20,18],rate:1/3},ready_back:{frames:[21]},striking_back:{frames:[21,22],rate:1/6,next:"withdrawing_back",trigger:"attacked"},withdrawing_back:{frames:[22,21],rate:1/6,next:"ready_back"},dying_back:{frames:[23],rate:1/3,next:"dead_back"},dead_back:{frames:[24,25,26],rate:15,loop:false,trigger:"destroy"},idle_right:{frames:[27]},running_right:{frames:[28,27,29,27],rate:1/3},ready_right:{frames:[30]},striking_right:{frames:[30,31],rate:1/6,next:"withdrawing_right",trigger:"attacked"},withdrawing_right:{frames:[31,30],rate:1/6,next:"ready_right"},dying_right:{frames:[32],rate:1/3,next:"dead_right"},dead_right:{frames:[33,34,35],rate:15,loop:false,trigger:"destroy"}});t.Sprite.extend("Fighter",{init:function(e,t){t.cx=32;t.cy=46;t.points=[[19,45],[32,39],[44,46],[31,51]];this._super(e,t);this.add("2d, animation, homing, combat");this.play("idle_"+this.p.facing);this.on("homingStarted",function(e){this.play("running_"+this.p.facing)});this.on("homingEnded",function(e){this.play("ready_"+this.p.facing)});this.on("destroy",function(){this.destroy()})},step:function(e){this.p.z=this.p.y+(this.p.health>0?1e6:0);if(this.p.health<=0){return}}});t.Fighter.extend("PeasantBase",{init:function(e,t){t.sprite="fighter";t.team="peasants";t.predicate=function(e){return e.has("combat")&&e.p.health>0&&e.p.team==="sires"};t.facing="back";t.strikeSound="peasant_strike.mp3";t.deathSound="peasant_death.mp3";this._super(e,t)}});t.PeasantBase.extend("PoorPeasant",{init:function(e){this._super(e,{sheet:"poor_peasant",health:2,attack:1})}});t.PeasantBase.extend("PitchforkPeasant",{init:function(e){this._super(e,{sheet:"pitchfork_peasant",health:3,attack:1.5})}});t.PeasantBase.extend("ArmedPeasant",{init:function(e){this._super(e,{sheet:"armed_peasant",health:4,attack:2})}});t.Fighter.extend("SireBase",{init:function(e,t){t.sprite="fighter";t.team="sires";t.cooldown=1;t.predicate=function(e){return e.has("combat")&&e.p.health>0&&e.p.team==="peasants"};t.facing="front";t.strikeSound="sire_strike.mp3";t.deathSound="sire_death.mp3";this._super(e,t)}});t.SireBase.extend("Knight",{init:function(e){this._super(e,{sheet:"knight",health:36,attack:2})}});t.SireBase.extend("Lord",{init:function(e){this._super(e,{sheet:"lord",health:54,attack:3})}});t.SireBase.extend("King",{init:function(e){this._super(e,{sheet:"king",health:72,attack:4})}});t.Sprite.extend("Spawner",{init:function(e){this._super(e,{waveSize:1,placementVariance:50,spawnSound:null,spawnFuncs:{}})},spawnWave:function(e){if(t.state.get("audioEnabled")&&this.p.spawnSound){t.audio.play(this.p.spawnSound)}for(var n=0;n<this.p.waveSize;n++){var r=this.p.x+(2*Math.random()-1)*this.p.placementVariance;var i=this.p.y+(2*Math.random()-1)*this.p.placementVariance;this.stage.insert(this.p.spawnFuncs[e](r,i))}}});t.Sprite.extend("ButtonIndicator",{init:function(e){this._super(e,{cx:0,cy:0,asset:e.enabledAsset,enabledFunc:function(){return true}})},step:function(e){if(!this.p.enabledFunc()){this.p.asset=this.p.disabledAsset}else if(t.inputs[this.p.key]){this.p.asset=this.p.pressedAsset}else{this.p.asset=this.p.enabledAsset}}});t.Sprite.extend("TimelineItem",{init:function(e,t){this._super(t,{cx:0,cy:0,team:"peasants",sprite:"fighter",direction:"left",speed:25,targetX:0,targetReached:false,targetReachedSound:null});this.add("animation");this.play(this.p.direction==="left"?"running_front":"running_left")},step:function(e){if(this.p.targetReached){return}var n=this.p.speed*e*(this.p.direction==="left"?-1:1);this.p.x+=n;var r=this.p.direction==="left"?this.p.x<=this.p.targetX:this.p.x>=this.p.targetX;if(r){if(t.state.get("audioEnabled")&&this.p.targetReachedSound){t.audio.play(this.p.targetReachedSound)}this.p.targetReached=true;this.p.x=this.p.targetX;this.play(this.p.direction==="left"?"idle_front":"idle_left");if(this.p.team==="peasants"){t.state.get("availablePeasants").push(this)}else if(this.p.team==="sires"){t.state.get("availableSires").push(this)}}},draw:function(e){e.drawImage(t.asset("timeline_item_background.png"),14,8);this._super(e)}});t.Sprite.extend("Timeline",{init:function(e){this._super(e,{cx:0,cy:0,duration:30,width:751,direction:"left",itemCounter:0})},addItems:function(e,n){for(var r=0;r<e.length;r++){var i=e[r];var s=this.p.width/this.p.duration;if(!n){n=1}this.stage.insert(new t.TimelineItem(this.stage,{x:this.p.x-14+(this.p.direction==="left"?n*(this.p.width-1)-40*r:(1-n)*(this.p.width-1)+40*r),y:this.p.y-8,z:this.p.itemCounter,team:this.p.team,sheet:i,direction:this.p.direction,speed:s,targetX:this.p.x-14+(this.p.direction==="left"?0:this.p.width-1),targetReachedSound:this.p.team==="peasants"?"peasant_ready.mp3":"sire_ready.mp3"}));this.p.itemCounter--}}});t.Sprite.extend("TimelineManager",{_randomPeasant:function(){var e=Math.floor(Math.random()*3);if(e==0){return"poor_peasant"}else if(e==1){return"pitchfork_peasant"}else{return"armed_peasant"}},_randomSire:function(){var e=Math.floor(Math.random()*3);if(e==0){return"knight"}else if(e==1){return"lord"}else{return"king"}},init:function(e){this._super(e,{addPeasantItems:function(e){},addSireItems:function(e){},spawnPeasants:function(e){},spawnSire:function(e){},freeReinforcementFreq:20,freeReinforcementCounter:0});t.input.on("peasantHelp",this,"peasantHelp");t.input.on("peasantFight",this,"peasantFight");t.input.on("sireHelp",this,"sireHelp");t.input.on("sireFight",this,"sireFight")},step:function(e){this.p.freeReinforcementCounter+=e;if(this.p.freeReinforcementCounter>=this.p.freeReinforcementFreq){this.p.freeReinforcementCounter-=this.p.freeReinforcementFreq;this.p.addPeasantItems([this._randomPeasant()]);this.p.addSireItems([this._randomSire()])}},peasantHelp:function(){var e=t.state.get("availablePeasants");if(e.length>0){if(t.state.get("audioEnabled")){t.audio.play("peasant_help.mp3")}e.shift().destroy();this.p.addPeasantItems([this._randomPeasant(),this._randomPeasant()])}},peasantFight:function(){var e=t.state.get("availablePeasants");if(e.length>0){var n=e.shift();this.p.spawnPeasants(n.p.sheet);n.destroy()}},sireHelp:function(){var e=t.state.get("availableSires");if(e.length>0){if(t.state.get("audioEnabled")){t.audio.play("sire_help.mp3")}e.shift().destroy();this.p.addSireItems([this._randomSire(),this._randomSire()])}},sireFight:function(){var e=t.state.get("availableSires");if(e.length>0){var n=e.shift();this.p.spawnSire(n.p.sheet);n.destroy()}}});t.Sprite.extend("SpawnerManager",{init:function(e){this._super(e,{spawnPeasantsFunc:function(e){},spawnSireFunc:function(e){}})},step:function(e){var n=t.state.get("peasantSpawnQueue");for(var r=0;r<n.length;r++){this.p.spawnPeasantsFunc(n.shift())}var i=t.state.get("sireSpawnQueue");for(var r=0;r<i.length;r++){this.p.spawnSireFunc(i.shift())}}});t.SpawnerManager.extend("ContinuousSpawnerManager",{_randomPeasant:function(){var e=Math.floor(Math.random()*3);if(e==0){return"poor_peasant"}else if(e==1){return"pitchfork_peasant"}else{return"armed_peasant"}},_randomSire:function(){var e=Math.floor(Math.random()*3);if(e==0){return"knight"}else if(e==1){return"lord"}else{return"king"}},step:function(e){var n=0;t.stage(0).each(function(){if(this.p.team&&this.p.team==="peasants"&&this.p.health&&this.p.health>0){n++}});var r=0;t.stage(0).each(function(){if(this.p.team&&this.p.team==="sires"&&this.p.health&&this.p.health>0){r++}});if(n<=10){this.p.spawnPeasantsFunc(this._randomPeasant())}if(r<=1){this.p.spawnSireFunc(this._randomSire())}}});t.Sprite.extend("WinConditionDetector",{_endGame:function(e){t.audio.stop();t.stage(0).each(function(){if(!this.p.team||!this.p.health||this.p.health<0){return}if(this.p.team==="peasants"){this.p.direction="back"}else if(this.p.team==="sires"){this.p.direction="front"}this.del("homing");this.del("combat")});t.stage(0).pause();t.stage(1).pause();t.stageScene("endGame",3,{winner:e})},step:function(e){var t=this.stage.detect(function(){return this.p.health&&this.p.health>0&&this.p.team&&this.p.team==="peasants"});var n=this.stage.detect(function(){return this.p.health&&this.p.health>0&&this.p.team&&this.p.team==="sires"});if(!t){this._endGame("sires")}else if(!n){this._endGame("peasants")}}});t.Sprite.extend("HoverSprite",{init:function(e){this._super(e,{amplitude:3,period:2,centerY:e.y,elapsed:0})},step:function(e){this.p.elapsed+=e;this.p.y=this.p.centerY+this.p.amplitude*Math.sin(2*Math.PI*(this.p.elapsed/this.p.period))}});t.scene("mainMenu",function(e){if(t.state.get("audioEnabled")){t.audio.play("title_theme.mp3",{loop:true})}e.insert(new t.UI.Button({asset:"play_button.png",x:t.width/2,y:500},function(){t.audio.stop();t.clearStage(0);t.clearStage(1);t.stageScene("battlefield",0,{sort:true});t.stageScene("battlefieldGUI",1,{sort:true})}));e.insert(new t.HoverSprite({cx:0,cy:0,x:16,y:16,asset:"title.png"}));e.insert(new t.Sprite({x:t.width-70,y:t.height-23,asset:"credits.png"}))});t.scene("backgroundBattlefield",function(e){var n=new t.Spawner({x:500,y:300,waveSize:10,spawnSound:"peasant_spawn.mp3",spawnFuncs:{poor_peasant:function(e,n){return new t.PoorPeasant({x:e,y:n})},pitchfork_peasant:function(e,n){return new t.PitchforkPeasant({x:e,y:n})},armed_peasant:function(e,n){return new t.ArmedPeasant({x:e,y:n})}}});e.insert(n);var r=new t.Spawner({x:580,y:270,waveSize:1,spawnSound:"sire_spawn.mp3",spawnFuncs:{knight:function(e,n){return new t.Knight({x:e,y:n})},lord:function(e,n){return new t.Lord({x:e,y:n})},king:function(e,n){return new t.King({x:e,y:n})}}});e.insert(r);n.spawnWave("pitchfork_peasant");r.spawnWave("lord");n.p.x=100;n.p.y=500;r.p.x=967;r.p.y=100;var i=new t.ContinuousSpawnerManager({spawnPeasantsFunc:function(e){n.spawnWave(e)},spawnSireFunc:function(e){r.spawnWave(e)}});e.insert(i);e.on("prerender",function(e){e.drawImage(t.asset("background.png"),0,0)})});t.scene("battlefield",function(e){var n=new t.Spawner({x:100,y:500,waveSize:10,spawnSound:"peasant_spawn.mp3",spawnFuncs:{poor_peasant:function(e,n){return new t.PoorPeasant({x:e,y:n})},pitchfork_peasant:function(e,n){return new t.PitchforkPeasant({x:e,y:n})},armed_peasant:function(e,n){return new t.ArmedPeasant({x:e,y:n})}}});e.insert(n);var r=new t.Spawner({x:967,y:100,waveSize:1,spawnSound:"sire_spawn.mp3",spawnFuncs:{knight:function(e,n){return new t.Knight({x:e,y:n})},lord:function(e,n){return new t.Lord({x:e,y:n})},king:function(e,n){return new t.King({x:e,y:n})}}});e.insert(r);var i=new t.SpawnerManager({spawnPeasantsFunc:function(e){n.spawnWave(e)},spawnSireFunc:function(e){r.spawnWave(e)}});e.insert(i);n.spawnWave("pitchfork_peasant");r.spawnWave("lord");e.insert(new t.WinConditionDetector);e.on("prerender",function(e){e.drawImage(t.asset("background.png"),0,0)})});t.scene("battlefieldGUI",function(e){var n=new t.ButtonIndicator({x:6,y:64,key:"peasantHelp",disabledAsset:"peasant_help_button_disabled.png",enabledAsset:"peasant_help_button_enabled.png",pressedAsset:"peasant_help_button_pressed.png",enabledFunc:function(){return t.state.get("availablePeasants").length>0}});var r=new t.ButtonIndicator({x:76,y:64,key:"peasantFight",disabledAsset:"peasant_fight_button_disabled.png",enabledAsset:"peasant_fight_button_enabled.png",pressedAsset:"peasant_fight_button_pressed.png",enabledFunc:function(){return t.state.get("availablePeasants").length>0}});var i=new t.ButtonIndicator({x:927,y:472,key:"sireHelp",disabledAsset:"sire_help_button_disabled.png",enabledAsset:"sire_help_button_enabled.png",pressedAsset:"sire_help_button_pressed.png",enabledFunc:function(){return t.state.get("availableSires").length>0}});var s=new t.ButtonIndicator({x:997,y:472,key:"sireFight",disabledAsset:"sire_fight_button_disabled.png",enabledAsset:"sire_fight_button_enabled.png",pressedAsset:"sire_fight_button_pressed.png",enabledFunc:function(){return t.state.get("availableSires").length>0}});e.insert(n);e.insert(r);e.insert(i);e.insert(s);var o=new t.Timeline({x:8,y:8,direction:"left",team:"peasants"});e.insert(o);var u=new t.Timeline({x:273,y:544,direction:"right",team:"sires"});e.insert(u);var a=new t.TimelineManager({addPeasantItems:function(e){o.addItems(e)},addSireItems:function(e){u.addItems(e)},spawnPeasants:function(e){t.state.get("peasantSpawnQueue").push(e)},spawnSire:function(e){t.state.get("sireSpawnQueue").push(e)}});e.insert(a);o.addItems(["pitchfork_peasant"],.1);o.addItems(["pitchfork_peasant"],.55);o.addItems(["pitchfork_peasant"]);u.addItems(["lord"],.1);u.addItems(["lord"],.55);u.addItems(["lord"]);e.on("prerender",function(e){e.drawImage(t.asset("gui.png"),0,0)})});t.scene("audioToggle",function(e){var n=new t.UI.Button({x:23,y:t.height-19,asset:e.options.toggled?"audio_on.png":"audio_off.png",toggled:e.options.toggled},function(){this.p.toggled=!this.p.toggled;this.p.asset=this.p.toggled?"audio_on.png":"audio_off.png";t.state.set("audioEnabled",this.p.toggled);if(!this.p.toggled){t.audio.stop()}});e.insert(n)});t.scene("endGame",function(e){if(t.state.get("audioEnabled")){t.audio.play("victory1.mp3");window.setTimeout(function(){t.audio.play("victory2.mp3",{loop:true})},4800)}e.insert(new t.Sprite({asset:"endgame_popup_background.png",x:t.width/2,y:440}));if(e.options.winner==="peasants"){var n=t.state.get("peasantLosses")+" lives"}else if(e.options.winner==="sires"){var n=10*t.state.get("knightLosses")+100*t.state.get("lordLosses")+1e3*t.state.get("kingLosses")+" gold coins"}e.insert(new t.UI.Text({label:"The "+e.options.winner+" are victorious!",color:"black",size:16,x:t.width/2,y:405}));e.insert(new t.UI.Text({label:"Cost of victory: "+n,color:"black",size:16,x:t.width/2,y:430}));e.insert(new t.UI.Text({label:"Press SPACE to play again.",color:"black",size:16,x:t.width/2,y:480}));t.input.on("space",function(){resetState(t);t.audio.stop();t.clearStage(0);t.clearStage(1);t.clearStage(3);t.stageScene("battlefield",0,{sort:true});t.stageScene("battlefieldGUI",1,{sort:true})})});t.load("background.png, "+"gui.png, "+"peasant_help_button_disabled.png, peasant_help_button_enabled.png, peasant_help_button_pressed.png, "+"peasant_fight_button_disabled.png, peasant_fight_button_enabled.png, peasant_fight_button_pressed.png, "+"sire_help_button_disabled.png, sire_help_button_enabled.png, sire_help_button_pressed.png, "+"sire_fight_button_disabled.png, sire_fight_button_enabled.png, sire_fight_button_pressed.png, "+"timeline_item_background.png, "+"poor_peasant.png, poor_peasant.json, "+"pitchfork_peasant.png, pitchfork_peasant.json, "+"armed_peasant.png, armed_peasant.json, "+"knight.png, knight.json, "+"lord.png, lord.json, "+"king.png, king.json, "+"title.png, credits.png, "+"play_button.png, "+"endgame_popup_background.png, "+"audio_on.png, audio_off.png, "+"title_theme.mp3, victory1.mp3, victory2.mp3, "+"peasant_ready.mp3, peasant_help.mp3, peasant_spawn.mp3, peasant_strike.mp3, peasant_death.mp3, "+"sire_ready.mp3, sire_help.mp3, sire_spawn.mp3, sire_strike.mp3, sire_death.mp3",function(){t.compileSheets("poor_peasant.png","poor_peasant.json");t.compileSheets("pitchfork_peasant.png","pitchfork_peasant.json");t.compileSheets("armed_peasant.png","armed_peasant.json");t.compileSheets("knight.png","knight.json");t.compileSheets("lord.png","lord.json");t.compileSheets("king.png","king.json");t.stageScene("backgroundBattlefield",0,{sort:true});t.stageScene("mainMenu",1);t.stageScene("audioToggle",2,{toggled:true})},{progressCallback:function(e,t){var n=document.getElementById("loading_progress");n.style.width=Math.floor(e/t*100)+"%"}})})